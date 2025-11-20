// src/features/email/services/ProviderManager.ts

import type { EmailProvider, ProviderConfig } from '../types';
import {
  BaseEmailProvider,
  ResendProvider,
  SendGridProvider,
  SESProvider,
  PostmarkProvider,
  MailgunProvider,
} from './providers';

/**
 * ProviderManager handles creating and managing email provider instances
 * Similar to the AI service provider management pattern
 */
export class ProviderManager {
  private providers: Map<EmailProvider, BaseEmailProvider> = new Map();
  private activeProvider: EmailProvider | null = null;

  /**
   * Initialize a provider with the given configuration
   */
  initializeProvider(config: ProviderConfig): BaseEmailProvider {
    try {
      let provider: BaseEmailProvider;

      switch (config.provider) {
        case 'resend':
          provider = new ResendProvider(config);
          break;
        case 'sendgrid':
          provider = new SendGridProvider(config);
          break;
        case 'ses':
          provider = new SESProvider(config);
          break;
        case 'postmark':
          provider = new PostmarkProvider(config);
          break;
        case 'mailgun':
          provider = new MailgunProvider(config);
          break;
        default:
          throw new Error(`Unsupported email provider: ${config.provider}`);
      }

      // Store the provider instance
      this.providers.set(config.provider, provider);
      this.activeProvider = config.provider;

      return provider;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize ${config.provider} provider: ${errorMessage}`);
    }
  }

  /**
   * Get the currently active provider
   */
  getActiveProvider(): BaseEmailProvider | null {
    if (!this.activeProvider) {
      return null;
    }
    return this.providers.get(this.activeProvider) || null;
  }

  /**
   * Get a specific provider by type
   */
  getProvider(provider: EmailProvider): BaseEmailProvider | null {
    return this.providers.get(provider) || null;
  }

  /**
   * Switch to a different provider
   */
  switchProvider(provider: EmailProvider): BaseEmailProvider | null {
    const providerInstance = this.providers.get(provider);
    if (providerInstance) {
      this.activeProvider = provider;
      return providerInstance;
    }
    return null;
  }

  /**
   * Check if a provider is initialized
   */
  hasProvider(provider: EmailProvider): boolean {
    return this.providers.has(provider);
  }

  /**
   * Get the active provider type
   */
  getActiveProviderType(): EmailProvider | null {
    return this.activeProvider;
  }

  /**
   * Remove a provider instance
   */
  removeProvider(provider: EmailProvider): boolean {
    if (this.activeProvider === provider) {
      this.activeProvider = null;
    }
    return this.providers.delete(provider);
  }

  /**
   * Clear all providers
   */
  clearAll(): void {
    this.providers.clear();
    this.activeProvider = null;
  }

  /**
   * Get all initialized providers
   */
  getAllProviders(): Map<EmailProvider, BaseEmailProvider> {
    return new Map(this.providers);
  }

  /**
   * Validate configuration for a specific provider
   */
  async validateProviderConfig(config: ProviderConfig): Promise<boolean> {
    try {
      const provider = this.initializeProvider(config);
      return await provider.validateConfig();
    } catch (error) {
      console.error(`Provider config validation failed:`, error);
      return false;
    }
  }

  /**
   * Test provider connection
   */
  async testProviderConnection(
    config: ProviderConfig,
    testEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const provider = this.initializeProvider(config);
      return await provider.testConnection(testEmail);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
