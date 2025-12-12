/**
 * API Key Validation Service
 * Real API validation by making test calls to each provider
 *
 * Features:
 * - Makes actual API calls to verify keys work
 * - Returns detailed validation results with account info
 * - Handles timeouts, rate limiting, and network errors
 * - Provides helpful error messages for debugging
 */

export interface ValidationResult {
  valid: boolean;
  message: string;
  details?: {
    accountName?: string;
    accountEmail?: string;
    plan?: string;
    credits?: number;
    organizationId?: string;
    [key: string]: any;
  };
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds

export class ApiKeyValidationService {
  /**
   * Validate OpenAI API key
   * Tests by calling GET /v1/models
   * Documentation: https://platform.openai.com/docs/api-reference/models/list
   */
  async validateOpenAI(apiKey: string): Promise<ValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          return {
            valid: false,
            message: "Invalid OpenAI API key - authentication failed",
          };
        } else if (response.status === 429) {
          return {
            valid: true,
            message: "OpenAI API key is valid but rate limit exceeded",
            details: {
              plan: "Rate limited - key is valid",
            },
          };
        }

        const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
        return {
          valid: false,
          message: `OpenAI API error (${response.status}): ${errorData.error?.message || "Unknown error"}`,
        };
      }

      const data = await response.json();
      return {
        valid: true,
        message: "OpenAI API key is valid",
        details: {
          plan: `${data.data?.length || 0} models available`,
        },
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          valid: false,
          message: "OpenAI API request timed out - please check your connection and try again",
        };
      }

      return {
        valid: false,
        message: `OpenAI validation failed: ${error.message || "Network error"}`,
      };
    }
  }

  /**
   * Validate Anthropic API key
   * Tests by calling POST /v1/messages with minimal request
   * Documentation: https://docs.anthropic.com/claude/reference/messages_post
   */
  async validateAnthropic(apiKey: string): Promise<ValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "test" }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const errorData = await response.json().catch(() => ({ error: { message: "Authentication failed" } }));
          return {
            valid: false,
            message: `Invalid Anthropic API key - ${errorData.error?.message || "authentication failed"}`,
          };
        } else if (response.status === 429) {
          return {
            valid: true,
            message: "Anthropic API key is valid but rate limit exceeded",
          };
        }

        const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
        return {
          valid: false,
          message: `Anthropic API error (${response.status}): ${errorData.error?.message || "Unknown error"}`,
        };
      }

      // Success - API key is valid
      return {
        valid: true,
        message: "Anthropic API key is valid",
        details: {
          plan: "Claude API access confirmed",
        },
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          valid: false,
          message: "Anthropic API request timed out - please check your connection and try again",
        };
      }

      return {
        valid: false,
        message: `Anthropic validation failed: ${error.message || "Network error"}`,
      };
    }
  }

  /**
   * Validate Stripe API key
   * Tests by calling GET /v1/balance
   * Documentation: https://stripe.com/docs/api/balance/balance_retrieve
   */
  async validateStripe(apiKey: string): Promise<ValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch("https://api.stripe.com/v1/balance", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          return {
            valid: false,
            message: "Invalid Stripe API key - authentication failed",
          };
        } else if (response.status === 429) {
          return {
            valid: true,
            message: "Stripe API key is valid but rate limit exceeded",
          };
        }

        const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
        return {
          valid: false,
          message: `Stripe API error (${response.status}): ${errorData.error?.message || "Unknown error"}`,
        };
      }

      const data = await response.json();
      const availableBalance = data.available?.[0]?.amount || 0;
      const currency = data.available?.[0]?.currency || "usd";

      return {
        valid: true,
        message: "Stripe API key is valid",
        details: {
          plan: data.livemode ? "Live mode" : "Test mode",
          credits: availableBalance / 100, // Convert cents to dollars
          currency: currency.toUpperCase(),
        },
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          valid: false,
          message: "Stripe API request timed out - please check your connection and try again",
        };
      }

      return {
        valid: false,
        message: `Stripe validation failed: ${error.message || "Network error"}`,
      };
    }
  }

  /**
   * Validate Vapi API key
   * Tests by calling GET /call with limit=1
   * Documentation: https://docs.vapi.ai/api-reference/calls/list-calls
   */
  async validateVapi(apiKey: string): Promise<ValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch("https://api.vapi.ai/call?limit=1", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return {
            valid: false,
            message: "Invalid Vapi API key - authentication failed",
          };
        } else if (response.status === 429) {
          return {
            valid: true,
            message: "Vapi API key is valid but rate limit exceeded",
          };
        }

        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        return {
          valid: false,
          message: `Vapi API error (${response.status}): ${typeof errorData === 'object' && errorData.error ? errorData.error : "Unknown error"}`,
        };
      }

      return {
        valid: true,
        message: "Vapi API key is valid",
        details: {
          plan: "Vapi voice AI access confirmed",
        },
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          valid: false,
          message: "Vapi API request timed out - please check your connection and try again",
        };
      }

      return {
        valid: false,
        message: `Vapi validation failed: ${error.message || "Network error"}`,
      };
    }
  }

  /**
   * Validate Apify API key
   * Tests by calling GET /v2/users/me
   * Documentation: https://docs.apify.com/api/v2#/reference/users/user/get-user
   */
  async validateApify(apiKey: string): Promise<ValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch("https://api.apify.com/v2/users/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return {
            valid: false,
            message: "Invalid Apify API key - authentication failed",
          };
        } else if (response.status === 429) {
          return {
            valid: true,
            message: "Apify API key is valid but rate limit exceeded",
          };
        }

        const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
        return {
          valid: false,
          message: `Apify API error (${response.status}): ${errorData.error?.message || "Unknown error"}`,
        };
      }

      const data = await response.json();
      const userData = data.data || {};
      const creditsRemaining = userData.usageCycle?.creditsRemaining || 0;

      return {
        valid: true,
        message: "Apify API key is valid",
        details: {
          accountEmail: userData.email,
          plan: userData.plan || "Unknown",
          credits: creditsRemaining,
        },
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          valid: false,
          message: "Apify API request timed out - please check your connection and try again",
        };
      }

      return {
        valid: false,
        message: `Apify validation failed: ${error.message || "Network error"}`,
      };
    }
  }

  /**
   * Validate Browserbase API key
   * Tests by calling GET /v1/sessions
   * Documentation: https://docs.browserbase.com/api-reference/sessions/list
   */
  async validateBrowserbase(apiKey: string): Promise<ValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch("https://www.browserbase.com/v1/sessions?limit=1", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return {
            valid: false,
            message: "Invalid Browserbase API key - authentication failed",
          };
        } else if (response.status === 429) {
          return {
            valid: true,
            message: "Browserbase API key is valid but rate limit exceeded",
          };
        }

        const errorText = await response.text().catch(() => "Unknown error");
        return {
          valid: false,
          message: `Browserbase API error (${response.status}): ${errorText}`,
        };
      }

      return {
        valid: true,
        message: "Browserbase API key is valid",
        details: {
          plan: "Browser automation access confirmed",
        },
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          valid: false,
          message: "Browserbase API request timed out - please check your connection and try again",
        };
      }

      return {
        valid: false,
        message: `Browserbase validation failed: ${error.message || "Network error"}`,
      };
    }
  }

  /**
   * Validate SendGrid API key
   * Tests by calling GET /v3/user/profile
   * Documentation: https://docs.sendgrid.com/api-reference/users-api/retrieve-your-account-profile
   */
  async validateSendgrid(apiKey: string): Promise<ValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch("https://api.sendgrid.com/v3/user/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const errorData = await response.json().catch(() => ({ errors: [{ message: "Authentication failed" }] }));
          return {
            valid: false,
            message: `Invalid SendGrid API key - ${errorData.errors?.[0]?.message || "authentication failed"}`,
          };
        } else if (response.status === 429) {
          return {
            valid: true,
            message: "SendGrid API key is valid but rate limit exceeded",
          };
        }

        const errorData = await response.json().catch(() => ({ errors: [{ message: "Unknown error" }] }));
        return {
          valid: false,
          message: `SendGrid API error (${response.status}): ${errorData.errors?.[0]?.message || "Unknown error"}`,
        };
      }

      const data = await response.json();
      return {
        valid: true,
        message: "SendGrid API key is valid",
        details: {
          accountEmail: data.email,
          accountName: `${data.first_name || ""} ${data.last_name || ""}`.trim() || undefined,
        },
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          valid: false,
          message: "SendGrid API request timed out - please check your connection and try again",
        };
      }

      return {
        valid: false,
        message: `SendGrid validation failed: ${error.message || "Network error"}`,
      };
    }
  }

  /**
   * Validate Twilio credentials
   * Tests by calling GET /Accounts/{AccountSid}.json
   * Documentation: https://www.twilio.com/docs/usage/api/account#read-an-account-resource
   */
  async validateTwilio(accountSid: string, authToken: string): Promise<ValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      // Twilio uses Basic Auth with AccountSid as username and AuthToken as password
      const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${credentials}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          return {
            valid: false,
            message: "Invalid Twilio credentials - authentication failed",
          };
        } else if (response.status === 429) {
          return {
            valid: true,
            message: "Twilio credentials are valid but rate limit exceeded",
          };
        }

        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        return {
          valid: false,
          message: `Twilio API error (${response.status}): ${errorData.message || "Unknown error"}`,
        };
      }

      const data = await response.json();
      return {
        valid: true,
        message: "Twilio credentials are valid",
        details: {
          accountName: data.friendly_name,
          plan: data.type || "Unknown",
          accountEmail: data.owner_account_sid === accountSid ? "Primary account" : "Subaccount",
        },
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          valid: false,
          message: "Twilio API request timed out - please check your connection and try again",
        };
      }

      return {
        valid: false,
        message: `Twilio validation failed: ${error.message || "Network error"}`,
      };
    }
  }

  /**
   * Validate Google API key
   * Tests by calling a simple API like geocoding or translation
   * Documentation: https://developers.google.com/maps/documentation/geocoding
   */
  async validateGoogle(apiKey: string): Promise<ValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      // Use geocoding API with a simple request
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${apiKey}`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.status === "REQUEST_DENIED") {
        return {
          valid: false,
          message: `Invalid Google API key - ${data.error_message || "authentication failed"}`,
        };
      }

      if (!response.ok) {
        return {
          valid: false,
          message: `Google API error (${response.status}): ${data.error_message || "Unknown error"}`,
        };
      }

      return {
        valid: true,
        message: "Google API key is valid",
        details: {
          plan: "Google Cloud Platform access confirmed",
        },
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          valid: false,
          message: "Google API request timed out - please check your connection and try again",
        };
      }

      return {
        valid: false,
        message: `Google validation failed: ${error.message || "Network error"}`,
      };
    }
  }

  /**
   * Validate GoHighLevel API key
   * Tests by calling GET /locations/
   * Documentation: https://highlevel.stoplight.io/docs/integrations/
   */
  async validateGohighlevel(apiKey: string): Promise<ValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch("https://rest.gohighlevel.com/v1/locations/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return {
            valid: false,
            message: "Invalid GoHighLevel API key - authentication failed",
          };
        } else if (response.status === 429) {
          return {
            valid: true,
            message: "GoHighLevel API key is valid but rate limit exceeded",
          };
        }

        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        return {
          valid: false,
          message: `GoHighLevel API error (${response.status}): ${errorData.message || "Unknown error"}`,
        };
      }

      const data = await response.json();
      return {
        valid: true,
        message: "GoHighLevel API key is valid",
        details: {
          plan: `${data.locations?.length || 0} location(s) accessible`,
        },
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          valid: false,
          message: "GoHighLevel API request timed out - please check your connection and try again",
        };
      }

      return {
        valid: false,
        message: `GoHighLevel validation failed: ${error.message || "Network error"}`,
      };
    }
  }

  /**
   * Main validation router - dispatches to the appropriate validator
   */
  async validate(provider: string, credentials: Record<string, string>): Promise<ValidationResult> {
    switch (provider.toLowerCase()) {
      case "openai":
        if (!credentials.apiKey) {
          return { valid: false, message: "API key is required" };
        }
        return this.validateOpenAI(credentials.apiKey);

      case "anthropic":
        if (!credentials.apiKey) {
          return { valid: false, message: "API key is required" };
        }
        return this.validateAnthropic(credentials.apiKey);

      case "stripe":
        if (!credentials.apiKey) {
          return { valid: false, message: "API key is required" };
        }
        return this.validateStripe(credentials.apiKey);

      case "vapi":
        if (!credentials.apiKey) {
          return { valid: false, message: "API key is required" };
        }
        return this.validateVapi(credentials.apiKey);

      case "apify":
        if (!credentials.apiKey) {
          return { valid: false, message: "API key is required" };
        }
        return this.validateApify(credentials.apiKey);

      case "browserbase":
        if (!credentials.apiKey) {
          return { valid: false, message: "API key is required" };
        }
        return this.validateBrowserbase(credentials.apiKey);

      case "sendgrid":
        if (!credentials.apiKey) {
          return { valid: false, message: "API key is required" };
        }
        return this.validateSendgrid(credentials.apiKey);

      case "twilio":
        if (!credentials.accountSid || !credentials.authToken) {
          return { valid: false, message: "Account SID and Auth Token are required" };
        }
        return this.validateTwilio(credentials.accountSid, credentials.authToken);

      case "google":
        if (!credentials.apiKey) {
          return { valid: false, message: "API key is required" };
        }
        return this.validateGoogle(credentials.apiKey);

      case "gohighlevel":
        if (!credentials.apiKey) {
          return { valid: false, message: "API key is required" };
        }
        return this.validateGohighlevel(credentials.apiKey);

      case "custom":
        // Custom APIs don't have validation
        return {
          valid: true,
          message: "Custom API key saved (validation not available)",
        };

      default:
        return {
          valid: false,
          message: `Validation not implemented for provider: ${provider}`,
        };
    }
  }
}

// Export singleton instance
export const apiKeyValidationService = new ApiKeyValidationService();
