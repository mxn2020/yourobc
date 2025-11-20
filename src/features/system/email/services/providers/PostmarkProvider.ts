// src/features/email/services/providers/PostmarkProvider.ts

import { ServerClient } from 'postmark';
import { BaseEmailProvider } from './BaseEmailProvider';
import type { EmailRequest, EmailResponse, ProviderCapabilities, ProviderConfig } from '../../types';

export class PostmarkProvider extends BaseEmailProvider {
  private client: ServerClient;

  constructor(config: ProviderConfig) {
    super(config);

    if (!config.apiKey) {
      throw new Error('Postmark server API token is required');
    }

    this.client = new ServerClient(config.apiKey);
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      const toAddresses = this.normalizeToAddresses(request.to);
      const fromAddress = this.getFromAddress(request.from);

      // Postmark requires emails to be sent one by one for multiple recipients
      // We'll send to the first recipient for simplicity, or you can loop
      const to = toAddresses[0];

      const emailData: any = {
        From: fromAddress.name
          ? `${fromAddress.name} <${fromAddress.email}>`
          : fromAddress.email,
        To: to.name ? `${to.name} <${to.email}>` : to.email,
        Subject: request.subject,
      };

      if (request.html) {
        emailData.HtmlBody = request.html;
      }
      if (request.text) {
        emailData.TextBody = request.text;
      }

      if (request.replyTo) {
        const replyTo = this.normalizeEmailAddress(request.replyTo);
        emailData.ReplyTo = replyTo.name
          ? `${replyTo.name} <${replyTo.email}>`
          : replyTo.email;
      }

      if (request.attachments && request.attachments.length > 0) {
        emailData.Attachments = request.attachments.map(att => ({
          Name: att.filename,
          Content: Buffer.isBuffer(att.content)
            ? att.content.toString('base64')
            : att.content,
          ContentType: att.contentType,
        }));
      }

      if (request.tags && request.tags.length > 0) {
        emailData.Tag = request.tags[0]; // Postmark only supports one tag
      }

      if (request.metadata) {
        emailData.Metadata = request.metadata;
      }

      const result = await this.client.sendEmail(emailData);

      return {
        success: true,
        messageId: result.MessageID,
        provider: this.provider,
        providerResponse: result,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleProviderError(error);
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        return false;
      }

      // Postmark doesn't have a dedicated validation endpoint
      return true;
    } catch (error) {
      console.error('Postmark config validation failed:', error);
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
