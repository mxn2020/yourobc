// src/features/email/services/providers/MailgunProvider.ts

import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { BaseEmailProvider } from './BaseEmailProvider';
import type { EmailRequest, EmailResponse, ProviderCapabilities, ProviderConfig } from '../../types';

// Mailgun types - defined locally due to complex package structure
interface MailgunMessageData {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachment?: Array<{ filename: string; data: Buffer | string }>;
  [key: string]: any; // Allow dynamic keys for custom headers, tags, and variables
}

export class MailgunProvider extends BaseEmailProvider {
  private client: any; // Using any to avoid type conflicts with mailgun.js complex type structure
  private domain: string;

  constructor(config: ProviderConfig) {
    super(config);

    if (!config.apiKey || !config.domain) {
      throw new Error('Mailgun API key and domain are required');
    }

    const mailgun = new Mailgun(formData);
    this.client = mailgun.client({
      username: 'api',
      key: config.apiKey,
    });
    this.domain = config.domain;
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      const toAddresses = this.normalizeToAddresses(request.to);
      const fromAddress = this.getFromAddress(request.from);

      const emailData: MailgunMessageData = {
        from: fromAddress.name
          ? `${fromAddress.name} <${fromAddress.email}>`
          : fromAddress.email,
        to: toAddresses.map(addr =>
          addr.name ? `${addr.name} <${addr.email}>` : addr.email
        ),
        subject: request.subject,
      };

      if (request.html) {
        emailData.html = request.html;
      }
      if (request.text) {
        emailData.text = request.text;
      }

      if (request.replyTo) {
        const replyTo = this.normalizeEmailAddress(request.replyTo);
        emailData['h:Reply-To'] = replyTo.name
          ? `${replyTo.name} <${replyTo.email}>`
          : replyTo.email;
      }

      if (request.attachments && request.attachments.length > 0) {
        emailData.attachment = request.attachments.map(att => ({
          filename: att.filename,
          data: att.content,
        }));
      }

      if (request.tags && request.tags.length > 0) {
        emailData['o:tag'] = request.tags;
      }

      if (request.metadata) {
        // Mailgun custom variables
        Object.entries(request.metadata).forEach(([key, value]) => {
          emailData[`v:${key}`] = value as string;
        });
      }

      const result = await this.client.messages.create(this.domain, emailData);

      return {
        success: true,
        messageId: result.id,
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
      if (!this.config.apiKey || !this.config.domain) {
        return false;
      }

      // Mailgun validation can be done by checking domain status
      // For now, we just validate presence of required fields
      return true;
    } catch (error) {
      console.error('Mailgun config validation failed:', error);
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
