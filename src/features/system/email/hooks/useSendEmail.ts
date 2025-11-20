// src/features/email/hooks/useSendEmail.ts

import { useMutation } from '@tanstack/react-query';
import { useConvexMutation } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/features/boilerplate/auth';
import type { EmailRequest, EmailResponse, SendEmailOptions } from '../types';
import { validateEmailRequest } from '../utils';
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook to send an email
 * This is the main hook you'll use throughout your app to send emails
 */
export function useSendEmail() {
  const { auth } = useAuth();
  const logEmail = useConvexMutation(api.lib.boilerplate.email.mutations.logEmail);

  return useMutation({
    mutationFn: async ({
      request,
      options = {},
    }: {
      request: EmailRequest;
      options?: SendEmailOptions;
    }): Promise<EmailResponse> => {
      // Validate request
      const validation = validateEmailRequest(request);
      if (!validation.valid) {
        throw new Error(`Invalid email request: ${validation.errors.join(', ')}`);
      }

      // Import EmailService dynamically
      const { emailService } = await import('../services/EmailService');

      // Send the email
      const result = await emailService.sendEmail(request, options);

      // Log the email if logging is enabled (and not already logged by service)
      if (!options.skipLogging && result.success) {
        const recipients = Array.isArray(request.to) ? request.to : [request.to];
        const recipientEmails = recipients.map(r => (typeof r === 'string' ? r : r.email));

        await logEmail({
          provider: result.provider,
          to: recipientEmails,
          from: typeof request.from === 'string' ? request.from : request.from?.email || '',
          replyTo:
            typeof request.replyTo === 'string' ? request.replyTo : request.replyTo?.email,
          subject: request.subject,
          htmlPreview: request.html?.substring(0, 500),
          textPreview: request.text?.substring(0, 500),
          templateId: request.templateId as Id<"emailTemplates"> | undefined,
          templateData: request.templateData,
          status: 'sent',
          messageId: result.messageId,
          providerResponse: result.providerResponse,
          context: request.context,
          triggeredBy: request.triggeredBy || undefined,
          metadata: request.metadata,
        });
      }

      return result;
    },
  });
}

/**
 * Hook to send a simple email (simplified API)
 */
export function useSendSimpleEmail() {
  const sendEmail = useSendEmail();

  return useMutation({
    mutationFn: async ({
      to,
      subject,
      html,
      text,
    }: {
      to: string | string[];
      subject: string;
      html?: string;
      text?: string;
    }) => {
      return sendEmail.mutateAsync({
        request: {
          to,
          subject,
          html,
          text,
        },
      });
    },
  });
}

/**
 * Hook to send an email using a template
 */
export function useSendTemplateEmail() {
  const { auth } = useAuth();
  const sendEmail = useSendEmail();
  const incrementUsage = useConvexMutation(api.lib.boilerplate.email.mutations.incrementTemplateUsage);

  return useMutation({
    mutationFn: async ({
      to,
      templateId,
      templateSlug,
      data,
      context,
    }: {
      to: string | string[];
      templateId?: Id<"emailTemplates">;
      templateSlug?: string;
      data: Record<string, unknown>;
      context?: string;
    }) => {
      // Get template from database
      // For now, we'll pass the template info to the email request
      // In a full implementation, you'd fetch the template from Convex

      const result = await sendEmail.mutateAsync({
        request: {
          to,
          subject: '', // Will be filled from template
          templateId: templateId || templateSlug,
          templateData: data,
          context,
        },
      });

      // Increment template usage counter
      if (templateId) {
        await incrementUsage({
          templateId,
        });
      }

      return result;
    },
  });
}
