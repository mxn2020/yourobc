// src/features/email/services/providers/ResendProvider.ts

import { Resend } from 'resend';
import { BaseEmailProvider } from './BaseEmailProvider';
import type { EmailRequest, EmailResponse, ProviderCapabilities, ProviderConfig } from '../../types';

export class ResendProvider extends BaseEmailProvider {
  private client: Resend;

  constructor(config: ProviderConfig) {
    super(config);

    if (!config.apiKey) {
      throw new Error('Resend API key is required');
    }

    this.client = new Resend(config.apiKey);
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      const toAddresses = this.normalizeToAddresses(request.to);
      const fromAddress = this.getFromAddress(request.from);

      // Resend only supports single recipient or array of strings
      const to = toAddresses.map(addr =>
        addr.name ? `${addr.name} <${addr.email}>` : addr.email
      );

      const from = fromAddress.name
        ? `${fromAddress.name} <${fromAddress.email}>`
        : fromAddress.email;

      const emailData: any = {
        from,
        to,
        subject: request.subject,
      };

      // Add HTML or text content
      if (request.html) {
        emailData.html = request.html;
      }
      if (request.text) {
        emailData.text = request.text;
      }

      // Add reply-to if provided
      if (request.replyTo) {
        const replyTo = this.normalizeEmailAddress(request.replyTo);
        emailData.reply_to = replyTo.name
          ? `${replyTo.name} <${replyTo.email}>`
          : replyTo.email;
      }

      // Add attachments if provided
      if (request.attachments && request.attachments.length > 0) {
        emailData.attachments = request.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
        }));
      }

      // Add tags if provided
      if (request.tags && request.tags.length > 0) {
        emailData.tags = request.tags.map(tag => ({ name: tag, value: tag }));
      }

      const result = await this.client.emails.send(emailData);

      if ('error' in result && result.error) {
        throw new Error(result.error.message);
      }

      return {
        success: true,
        messageId: result.data?.id,
        provider: this.provider,
        providerResponse: result.data,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleProviderError(error);
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      // Resend doesn't have a dedicated validation endpoint,
      // so we check if the API key is present and properly formatted
      if (!this.config.apiKey || !this.config.apiKey.startsWith('re_')) {
        return false;
      }

      // Try to get API key info (this will fail if key is invalid)
      // For now, we just return true if API key is present
      return true;
    } catch (error) {
      console.error('Resend config validation failed:', error);
      return false;
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      maxRecipientsPerEmail: 50,
      maxEmailsPerSecond: 10,
      supportsBulkSending: true,
      supportsTemplates: true,
      supportsAttachments: true,
      supportsScheduling: false,
      supportsAnalytics: true,
      supportsWebhooks: true,
    };
  }
}
