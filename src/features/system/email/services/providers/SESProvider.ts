// src/features/email/services/providers/SESProvider.ts

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { BaseEmailProvider } from './BaseEmailProvider';
import type { EmailRequest, EmailResponse, ProviderCapabilities, ProviderConfig } from '../../types';

export class SESProvider extends BaseEmailProvider {
  private client: SESClient;

  constructor(config: ProviderConfig) {
    super(config);

    if (!config.apiKey || !config.apiSecret || !config.region) {
      throw new Error('AWS SES requires access key ID, secret access key, and region');
    }

    this.client = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.apiKey,
        secretAccessKey: config.apiSecret,
      },
    });
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      const toAddresses = this.normalizeToAddresses(request.to);
      const fromAddress = this.getFromAddress(request.from);

      const destination = {
        ToAddresses: toAddresses.map(addr => addr.email),
      };

      const message: any = {
        Subject: {
          Data: request.subject,
          Charset: 'UTF-8',
        },
        Body: {},
      };

      if (request.html) {
        message.Body.Html = {
          Data: request.html,
          Charset: 'UTF-8',
        };
      }

      if (request.text) {
        message.Body.Text = {
          Data: request.text,
          Charset: 'UTF-8',
        };
      }

      const source = fromAddress.name
        ? `${fromAddress.name} <${fromAddress.email}>`
        : fromAddress.email;

      const command = new SendEmailCommand({
        Source: source,
        Destination: destination,
        Message: message,
        ReplyToAddresses: request.replyTo
          ? [typeof request.replyTo === 'string' ? request.replyTo : request.replyTo.email]
          : undefined,
      });

      const response = await this.client.send(command);

      return {
        success: true,
        messageId: response.MessageId,
        provider: this.provider,
        providerResponse: response,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleProviderError(error);
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret || !this.config.region) {
        return false;
      }

      // AWS credentials are validated when making the first request
      // For now, we just check if all required fields are present
      return true;
    } catch (error) {
      console.error('AWS SES config validation failed:', error);
      return false;
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      maxRecipientsPerEmail: 50,
      maxEmailsPerSecond: 14,
      supportsBulkSending: true,
      supportsTemplates: true,
      supportsAttachments: true,
      supportsScheduling: false,
      supportsAnalytics: true,
      supportsWebhooks: true,
    };
  }
}
