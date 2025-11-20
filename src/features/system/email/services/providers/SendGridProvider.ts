// src/features/email/services/providers/SendGridProvider.ts

import sgMail from '@sendgrid/mail';
import type { MailDataRequired } from '@sendgrid/mail';
import { BaseEmailProvider } from './BaseEmailProvider';
import type { EmailRequest, EmailResponse, ProviderCapabilities, ProviderConfig } from '../../types';

export class SendGridProvider extends BaseEmailProvider {
  constructor(config: ProviderConfig) {
    super(config);

    if (!config.apiKey) {
      throw new Error('SendGrid API key is required');
    }

    sgMail.setApiKey(config.apiKey);
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      const toAddresses = this.normalizeToAddresses(request.to);
      const fromAddress = this.getFromAddress(request.from);

      const emailData: Partial<MailDataRequired> = {
        from: {
          email: fromAddress.email,
          name: fromAddress.name,
        },
        to: toAddresses.map(addr => ({
          email: addr.email,
          name: addr.name,
        })),
        subject: request.subject,
      };

      // Add content
      if (request.html) {
        emailData.html = request.html;
      }
      if (request.text) {
        emailData.text = request.text;
      }

      // Add reply-to if provided
      if (request.replyTo) {
        const replyTo = this.normalizeEmailAddress(request.replyTo);
        emailData.replyTo = {
          email: replyTo.email,
          name: replyTo.name,
        };
      }

      // Add attachments if provided
      if (request.attachments && request.attachments.length > 0) {
        emailData.attachments = request.attachments.map(att => ({
          filename: att.filename,
          content: Buffer.isBuffer(att.content)
            ? att.content.toString('base64')
            : att.content,
          type: att.contentType,
        }));
      }

      // Add custom headers if provided
      if (request.headers) {
        emailData.headers = request.headers;
      }

      // Add categories (tags) if provided
      if (request.tags && request.tags.length > 0) {
        emailData.categories = request.tags;
      }

      // Add custom args (metadata) if provided
      if (request.metadata) {
        emailData.customArgs = request.metadata as Record<string, string>;
      }

      const [response] = await sgMail.send(emailData as MailDataRequired);

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
        provider: this.provider,
        providerResponse: {
          statusCode: response.statusCode,
          headers: response.headers,
        },
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleProviderError(error);
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      if (!this.config.apiKey || !this.config.apiKey.startsWith('SG.')) {
        return false;
      }

      // SendGrid doesn't have a validation endpoint,
      // but we can check if the API key format is correct
      return true;
    } catch (error) {
      console.error('SendGrid config validation failed:', error);
      return false;
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      maxRecipientsPerEmail: 1000,
      maxEmailsPerSecond: 100,
      supportsBulkSending: true,
      supportsTemplates: true,
      supportsAttachments: true,
      supportsScheduling: true,
      supportsAnalytics: true,
      supportsWebhooks: true,
    };
  }
}
