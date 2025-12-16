/**
 * CDN Service
 *
 * CloudFront CDN integration for S3 assets
 * Features:
 * - Generate CloudFront signed URLs
 * - Invalidate CDN cache
 * - URL rewriting from S3 to CDN
 * - Cache control headers
 */

import { serviceLoggers } from '../lib/logger';
import { s3StorageService } from './s3-storage.service';
import { createHash, createSign } from 'crypto';

const logger = serviceLoggers.deployment;

/**
 * CDN Configuration
 */
interface CDNConfig {
  distributionId: string;
  distributionDomain: string;
  keyPairId: string;
  privateKey: string;
  enabled: boolean;
}

/**
 * Signed URL options
 */
interface SignedUrlOptions {
  expiresIn?: number; // seconds, default 3600 (1 hour)
  ipAddress?: string; // restrict to specific IP
}

/**
 * Cache invalidation result
 */
interface InvalidationResult {
  invalidationId: string;
  status: string;
  paths: string[];
}

/**
 * CDN Service for CloudFront integration
 */
class CDNService {
  private config: CDNConfig;

  constructor() {
    this.config = {
      distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID || '',
      distributionDomain: process.env.CLOUDFRONT_DOMAIN || '',
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID || '',
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY || '',
      enabled: process.env.CDN_ENABLED === 'true',
    };

    if (!this.config.enabled) {
      logger.info('CDN is disabled - using direct S3 URLs');
    } else if (!this.config.distributionDomain) {
      logger.warn('CDN enabled but CLOUDFRONT_DOMAIN not configured');
    } else {
      logger.info(`CDN enabled with domain: ${this.config.distributionDomain}`);
    }
  }

  /**
   * Check if CDN is properly configured and enabled
   */
  isEnabled(): boolean {
    return (
      this.config.enabled &&
      !!this.config.distributionDomain
    );
  }

  /**
   * Check if signed URLs are available
   */
  canSignUrls(): boolean {
    return (
      this.isEnabled() &&
      !!this.config.keyPairId &&
      !!this.config.privateKey
    );
  }

  /**
   * Get the CDN URL for an S3 key
   * Falls back to S3 signed URL if CDN is not enabled
   */
  async getUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    const expiresIn = options.expiresIn || 3600;

    if (!this.isEnabled()) {
      // Fallback to S3 signed URL
      return s3StorageService.getSignedUrl(key, expiresIn);
    }

    // Use signed URL if credentials are available, otherwise use public URL
    if (this.canSignUrls()) {
      return this.createSignedUrl(key, options);
    }

    // Public CDN URL (for public assets)
    return `https://${this.config.distributionDomain}/${key}`;
  }

  /**
   * Create a CloudFront signed URL for private content
   */
  createSignedUrl(key: string, options: SignedUrlOptions = {}): string {
    if (!this.canSignUrls()) {
      throw new Error('CloudFront signing not configured - missing key pair ID or private key');
    }

    const expiresIn = options.expiresIn || 3600;
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    const url = `https://${this.config.distributionDomain}/${key}`;

    // Build CloudFront policy
    const policy: Record<string, unknown> = {
      Statement: [
        {
          Resource: url,
          Condition: {
            DateLessThan: {
              'AWS:EpochTime': expires,
            },
          },
        },
      ],
    };

    // Add IP restriction if specified
    if (options.ipAddress) {
      (policy.Statement as Array<Record<string, unknown>>)[0].Condition = {
        ...(policy.Statement as Array<Record<string, unknown>>)[0].Condition as object,
        IpAddress: {
          'AWS:SourceIp': options.ipAddress,
        },
      };
    }

    const policyString = JSON.stringify(policy);

    // Create signature
    const signature = this.signPolicy(policyString);

    // Build signed URL
    const signedUrl = new URL(url);
    signedUrl.searchParams.set('Policy', this.base64Encode(policyString));
    signedUrl.searchParams.set('Signature', signature);
    signedUrl.searchParams.set('Key-Pair-Id', this.config.keyPairId);

    return signedUrl.toString();
  }

  /**
   * Create a canned signed URL (simpler, no custom policy)
   */
  createCannedSignedUrl(key: string, expiresIn: number = 3600): string {
    if (!this.canSignUrls()) {
      throw new Error('CloudFront signing not configured');
    }

    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    const url = `https://${this.config.distributionDomain}/${key}`;

    // Create signature for canned policy
    const stringToSign = `${url}\n${expires}`;
    const signature = this.signString(stringToSign);

    const signedUrl = new URL(url);
    signedUrl.searchParams.set('Expires', expires.toString());
    signedUrl.searchParams.set('Signature', signature);
    signedUrl.searchParams.set('Key-Pair-Id', this.config.keyPairId);

    return signedUrl.toString();
  }

  /**
   * Invalidate CDN cache for specific paths
   */
  async invalidateCache(paths: string[]): Promise<InvalidationResult> {
    if (!this.isEnabled() || !this.config.distributionId) {
      logger.warn('CDN invalidation skipped - not enabled or no distribution ID');
      return {
        invalidationId: 'none',
        status: 'skipped',
        paths,
      };
    }

    try {
      // Dynamic import to avoid loading AWS SDK if not needed
      const { CloudFrontClient, CreateInvalidationCommand } = await import(
        '@aws-sdk/client-cloudfront'
      );

      const client = new CloudFrontClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });

      // Ensure paths start with /
      const normalizedPaths = paths.map((p) => (p.startsWith('/') ? p : `/${p}`));

      const command = new CreateInvalidationCommand({
        DistributionId: this.config.distributionId,
        InvalidationBatch: {
          CallerReference: `invalidation-${Date.now()}`,
          Paths: {
            Quantity: normalizedPaths.length,
            Items: normalizedPaths,
          },
        },
      });

      const response = await client.send(command);

      logger.info(`CDN cache invalidated for ${paths.length} paths`);

      return {
        invalidationId: response.Invalidation?.Id || 'unknown',
        status: response.Invalidation?.Status || 'unknown',
        paths: normalizedPaths,
      };
    } catch (error) {
      logger.error({ err: error }, 'Failed to invalidate CDN cache');
      throw error;
    }
  }

  /**
   * Invalidate all CDN cache (use sparingly)
   */
  async invalidateAll(): Promise<InvalidationResult> {
    return this.invalidateCache(['/*']);
  }

  /**
   * Upload file to S3 and get CDN URL
   */
  async uploadAndGetCdnUrl(
    key: string,
    content: Buffer,
    contentType: string,
    options: SignedUrlOptions & { cacheControl?: string } = {}
  ): Promise<string> {
    // Upload to S3 with cache control
    const metadata: Record<string, string> = {};
    if (options.cacheControl) {
      metadata['Cache-Control'] = options.cacheControl;
    }

    await s3StorageService.uploadFile(key, content, contentType, metadata);

    // Return CDN URL
    return this.getUrl(key, options);
  }

  /**
   * Get public CDN URL (no signing)
   */
  getPublicUrl(key: string): string {
    if (!this.isEnabled()) {
      // Return S3 URL format (bucket must be public)
      const bucketInfo = s3StorageService.getBucketInfo();
      return `https://${bucketInfo.bucket}.s3.${bucketInfo.region}.amazonaws.com/${key}`;
    }

    return `https://${this.config.distributionDomain}/${key}`;
  }

  /**
   * Convert S3 URL to CDN URL
   */
  s3ToCdnUrl(s3Url: string): string {
    if (!this.isEnabled()) {
      return s3Url;
    }

    // Parse S3 URL formats:
    // s3://bucket/key
    // https://bucket.s3.region.amazonaws.com/key
    // https://s3.region.amazonaws.com/bucket/key

    const s3UriMatch = s3Url.match(/^s3:\/\/[^/]+\/(.+)$/);
    if (s3UriMatch) {
      return `https://${this.config.distributionDomain}/${s3UriMatch[1]}`;
    }

    const httpsMatch = s3Url.match(/amazonaws\.com\/(.+)$/);
    if (httpsMatch) {
      return `https://${this.config.distributionDomain}/${httpsMatch[1]}`;
    }

    // Return original if not an S3 URL
    return s3Url;
  }

  /**
   * Get recommended cache headers based on content type
   */
  getCacheHeaders(contentType: string): Record<string, string> {
    const headers: Record<string, string> = {};

    // Aggressive caching for static assets
    if (contentType.startsWith('image/')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else if (contentType.includes('javascript') || contentType.includes('css')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else if (contentType.includes('font')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else if (contentType === 'application/json') {
      headers['Cache-Control'] = 'public, max-age=60, stale-while-revalidate=300';
    } else if (contentType.startsWith('video/') || contentType.startsWith('audio/')) {
      headers['Cache-Control'] = 'public, max-age=86400';
    } else {
      // Default: short cache with revalidation
      headers['Cache-Control'] = 'public, max-age=300, stale-while-revalidate=600';
    }

    return headers;
  }

  /**
   * Get CDN status and configuration
   */
  getStatus(): {
    enabled: boolean;
    domain: string | null;
    distributionId: string | null;
    signingAvailable: boolean;
  } {
    return {
      enabled: this.isEnabled(),
      domain: this.config.distributionDomain || null,
      distributionId: this.config.distributionId || null,
      signingAvailable: this.canSignUrls(),
    };
  }

  // Private helper methods

  private signPolicy(policy: string): string {
    const sign = createSign('RSA-SHA1');
    sign.update(policy);
    const signature = sign.sign(this.config.privateKey, 'base64');
    return this.base64UrlEncode(signature);
  }

  private signString(str: string): string {
    const sign = createSign('RSA-SHA1');
    sign.update(str);
    const signature = sign.sign(this.config.privateKey, 'base64');
    return this.base64UrlEncode(signature);
  }

  private base64Encode(str: string): string {
    return Buffer.from(str).toString('base64');
  }

  private base64UrlEncode(str: string): string {
    // CloudFront requires URL-safe base64
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '~');
  }
}

export const cdnService = new CDNService();
