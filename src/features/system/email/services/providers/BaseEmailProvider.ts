// src/features/email/services/providers/BaseEmailProvider.ts

import type {
  EmailRequest,
  EmailResponse,
  EmailProvider,
  ProviderConfig,
  ProviderCapabilities,
  BulkEmailRequest,
  BulkEmailResponse,
} from '../../types';

/**
 * Abstract base class for all email providers
 * Each provider (Resend, SendGrid, etc.) extends this class
 */
export abstract class BaseEmailProvider {
  protected config: ProviderConfig;
  protected provider: EmailProvider;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.provider = config.provider;
  }

  /**
   * Send a single email
   * Must be implemented by each provider
   */
  abstract sendEmail(request: EmailRequest): Promise<EmailResponse>;

  /**
   * Send multiple emails in bulk
   * Can be overridden by providers with native bulk support
   */
  async sendBulk(request: BulkEmailRequest): Promise<BulkEmailResponse> {
    const batchSize = request.batchSize || 10;
    const results: EmailResponse[] = [];
    let totalSent = 0;
    let totalFailed = 0;

    // Process in batches
    for (let i = 0; i < request.emails.length; i += batchSize) {
      const batch = request.emails.slice(i, i + batchSize);
      const batchPromises = batch.map(email =>
        this.sendEmail(email).catch(error => ({
          success: false,
          provider: this.provider,
          error: error.message,
          timestamp: Date.now(),
        } as EmailResponse))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      batchResults.forEach(result => {
        if (result.success) {
          totalSent++;
        } else {
          totalFailed++;
        }
      });

      // Add small delay between batches to avoid rate limiting
      if (i + batchSize < request.emails.length) {
        await this.delay(100);
      }
    }

    return {
      success: totalFailed === 0,
      totalSent,
      totalFailed,
      results,
    };
  }

  /**
   * Validate provider configuration
   * Must be implemented by each provider
   */
  abstract validateConfig(): Promise<boolean>;

  /**
   * Get provider capabilities
   * Must be implemented by each provider
   */
  abstract getCapabilities(): ProviderCapabilities;

  /**
   * Test connection by sending a test email
   */
  async testConnection(testEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.sendEmail({
        to: testEmail,
        subject: `Test Email from ${this.provider}`,
        html: `<p>This is a test email from your ${this.provider} configuration.</p>`,
        text: `This is a test email from your ${this.provider} configuration.`,
        context: 'email_provider_test',
      });

      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update provider configuration
   */
  updateConfig(newConfig: Partial<ProviderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfigSafe(): Omit<ProviderConfig, 'apiKey' | 'apiSecret'> {
    const { apiKey, apiSecret, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Normalize email addresses to consistent format
   */
  protected normalizeEmailAddress(address: string | { email: string; name?: string }): {
    email: string;
    name?: string;
  } {
    if (typeof address === 'string') {
      return { email: address };
    }
    return address;
  }

  /**
   * Normalize to array to consistent format
   */
  protected normalizeToAddresses(
    to: string | string[] | { email: string; name?: string } | { email: string; name?: string }[]
  ): Array<{ email: string; name?: string }> {
    if (Array.isArray(to)) {
      return to.map(addr => this.normalizeEmailAddress(addr));
    }
    return [this.normalizeEmailAddress(to)];
  }

  /**
   * Get 'from' address with fallback to config
   */
  protected getFromAddress(from?: string | { email: string; name?: string }): {
    email: string;
    name?: string;
  } {
    if (from) {
      return this.normalizeEmailAddress(from);
    }
    return {
      email: this.config.fromEmail,
      name: this.config.fromName,
    };
  }

  /**
   * Validate email format
   */
  protected isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Utility delay function
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle provider-specific errors
   */
  protected handleProviderError(error: unknown): EmailResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      success: false,
      provider: this.provider,
      error: errorMessage,
      timestamp: Date.now(),
    };
  }
}
