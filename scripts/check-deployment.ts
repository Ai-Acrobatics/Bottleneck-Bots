/**
 * CLI Script for Vercel Deployment Verification
 * Usage: pnpm run deploy:check [deploymentId]
 */

import 'dotenv/config';
import VercelDeploymentChecker, { checkLatestDeployment } from './vercel-deployment-checker';
import { DeploymentFilterOptions } from './vercel-api-types';

const args = process.argv.slice(2);

async function main(): Promise<void> {
  try {
    const token = process.env.VERCEL_TOKEN || process.env.VERCEL_ACCESS_TOKEN || process.env.VERCEL_OIDC_TOKEN;

    if (!token) {
      console.error('Error: VERCEL_TOKEN, VERCEL_ACCESS_TOKEN, or VERCEL_OIDC_TOKEN environment variable not set');
      process.exit(1);
    }

    const deploymentId = args[0];
    const filter = args[1] as 'prod' | 'preview' | undefined;

    const checker = new VercelDeploymentChecker({ accessToken: token });

    let result;

    if (deploymentId && deploymentId !== '') {
      console.log(`Checking deployment: ${deploymentId}...\n`);
      result = await checker.checkDeployment(deploymentId);
    } else {
      const filters: DeploymentFilterOptions = {};

      if (filter === 'prod') {
        filters.target = 'production';
      } else if (filter === 'preview') {
        filters.target = 'preview';
      }

      console.log(`Checking latest ${filter ? filter + ' ' : ''}deployment...\n`);
      result = await checkLatestDeployment(filters);
    }

    console.log(checker.formatResult(result));

    if (result.status === 'SUCCESS') {
      process.exit(0);
    } else if (result.status === 'FAILED') {
      console.error(`\nDeployment failed with status: ${result.status}`);
      process.exit(1);
    } else if (result.status === 'BUILDING' || result.status === 'QUEUED') {
      console.warn(`\nDeployment still ${result.status.toLowerCase()}, check again later`);
      process.exit(2);
    } else {
      console.error(`\nUnexpected deployment status: ${result.status}`);
      process.exit(1);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

main();
