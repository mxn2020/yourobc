// src/features/email/services/EmailService.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import { ProviderManager } from './ProviderManager';
import type {
  EmailRequest,
  EmailResponse,
  BulkEmailRequest,
  BulkEmailResponse,
  ProviderConfig,
  EmailProvider,
  SendEmailOptions,
} from '../types';
import type { Id } from '@/convex/_generated/dataModel';

export interface EmailServiceConfig {
  enableLogging?: boolean;
  defaultRetries?: number;
  defaultTimeout?: number;
}

/**
 * EmailService - Singleton service for sending emails
 * Manages email providers and provides a unified API for sending emails
 * Similar pattern to AIService
 */
export class EmailService {
  private static instance: EmailService | null = null;

  private readonly providerManager: ProviderManager;
  private readonly config: Required<EmailServiceConfig>;
  private isInitialized: boolean = false;

  private constructor(config: EmailServiceConfig = {}) {
    this.config = {
      enableLogging: config.enableLogging ?? true,
      defaultRetries: config.defaultRetries ?? 2,
      defaultTimeout: config.defaultTimeout ?? 30000,
    };

    this.providerManager = new ProviderManager();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: EmailServiceConfig): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService(config);
    }
    return EmailService.instance;
  }

  // ==========================================
  // QUERY OPTION FACTORIES
  // These methods return query options that can be used in both loaders and hooks
  // ensuring consistent query keys for SSR cache hits
  // ==========================================

  public getAllConfigsQueryOptions() {
    return convexQuery(api.lib.boilerplate.email.queries.getAllConfigs, {});
  }

  public getEmailStatsQueryOptions(days: number = 30) {
    return convexQuery(api.lib.boilerplate.email.queries.getEmailStats, { days });
  }

  public getAllTemplatesQueryOptions() {
    return convexQuery(api.lib.boilerplate.email.queries.getAllTemplates, {});
  }

  public getEmailLogsQueryOptions(limit: number = 50) {
    return convexQuery(api.lib.boilerplate.email.queries.getEmailLogs, { limit });
  }

  // ==========================================
  // QUERY HOOKS
  // ==========================================

  public useAllConfigs() {
    return useQuery({
      ...this.getAllConfigsQueryOptions(),
      staleTime: 60000, // 1 minute
    });
  }

  public useEmailStats(days: number = 30) {
    return useQuery({
      ...this.getEmailStatsQueryOptions(days),
      staleTime: 30000, // 30 seconds
    });
  }

  public useAllTemplates() {
    return useQuery({
      ...this.getAllTemplatesQueryOptions(),
      staleTime: 60000, // 1 minute
    });
  }

  public useEmailLogs(limit: number = 50) {
    return useQuery({
      ...this.getEmailLogsQueryOptions(limit),
      staleTime: 30000, // 30 seconds
    });
  }

  // ==========================================
  // EMAIL SENDING METHODS
  // ==========================================

  /**
   * Initialize the email service with a provider configuration
   */
  public async initialize(providerConfig: ProviderConfig): Promise<void> {
    try {
      this.providerManager.initializeProvider(providerConfig);
      this.isInitialized = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize email service: ${errorMessage}`);
    }
  }

  /**
   * Send a single email
   */
  public async sendEmail(
    request: EmailRequest,
    options: SendEmailOptions = {}
  ): Promise<EmailResponse> {
    this.ensureInitialized();

    const provider = this.providerManager.getActiveProvider();
    if (!provider) {
      throw new Error('No active email provider configured');
    }

    try {
      const result = await this.executeWithRetries(
        () => provider.sendEmail(request),
        options.maxRetries ?? this.config.defaultRetries
      );

      // Log the email if logging is enabled (implement logging later)
      if (this.config.enableLogging && !options.skipLogging) {
        // TODO: Log to Convex
        console.log('Email sent:', {
          to: request.to,
          subject: request.subject,
          messageId: result.messageId,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  /**
   * Send multiple emails in bulk
   */
  public async sendBulk(
    request: BulkEmailRequest,
    options: SendEmailOptions = {}
  ): Promise<BulkEmailResponse> {
    this.ensureInitialized();

    const provider = this.providerManager.getActiveProvider();
    if (!provider) {
      throw new Error('No active email provider configured');
    }

    try {
      const result = await provider.sendBulk(request);

      // Log bulk send if logging is enabled
      if (this.config.enableLogging && !options.skipLogging) {
        console.log('Bulk emails sent:', {
          totalSent: result.totalSent,
          totalFailed: result.totalFailed,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send bulk emails: ${errorMessage}`);
    }
  }

  /**
   * Switch to a different provider
   */
  public switchProvider(provider: EmailProvider): boolean {
    const switched = this.providerManager.switchProvider(provider);
    return switched !== null;
  }

  /**
   * Get the currently active provider type
   */
  public getActiveProvider(): EmailProvider | null {
    return this.providerManager.getActiveProviderType();
  }

  /**
   * Validate provider configuration
   */
  public async validateConfig(config: ProviderConfig): Promise<boolean> {
    return this.providerManager.validateProviderConfig(config);
  }

  /**
   * Test provider connection
   */
  public async testConnection(
    config: ProviderConfig,
    testEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.providerManager.testProviderConnection(config, testEmail);
  }

  /**
   * Health check for the email service
   */
  public healthCheck(): {
    status: 'healthy' | 'unhealthy';
    isInitialized: boolean;
    activeProvider: EmailProvider | null;
    timestamp: Date;
  } {
    return {
      status: this.isInitialized ? 'healthy' : 'unhealthy',
      isInitialized: this.isInitialized,
      activeProvider: this.providerManager.getActiveProviderType(),
      timestamp: new Date(),
    };
  }

  /**
   * Get service statistics
   */
  public getStats(): {
    isInitialized: boolean;
    activeProvider: EmailProvider | null;
    totalProviders: number;
  } {
    return {
      isInitialized: this.isInitialized,
      activeProvider: this.providerManager.getActiveProviderType(),
      totalProviders: this.providerManager.getAllProviders().size,
    };
  }

  /**
   * Reset the service (useful for testing)
   */
  public reset(): void {
    this.providerManager.clearAll();
    this.isInitialized = false;
  }

  // === PRIVATE METHODS ===

  /**
   * Ensure the service is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Email service not initialized. Call initialize() first.');
    }
  }

  /**
   * Execute function with retries
   */
  private async executeWithRetries<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    delay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError!;
  }
}

// Export singleton instance for both legacy email sending and new query hooks
export const emailService = EmailService.getInstance();
