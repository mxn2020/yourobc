// src/features/email/templates/NotificationEmail.tsx

import { Text, Button, Heading, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';

export interface NotificationEmailProps {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  userName?: string;
}

/**
 * Generic notification email template
 */
export function NotificationEmail({
  title,
  message,
  actionUrl,
  actionText = 'View Details',
  userName,
}: NotificationEmailProps) {
  return (
    <BaseEmailTemplate previewText={title}>
      {userName && (
        <Text style={{ fontSize: '16px', color: '#555555', marginBottom: '10px' }}>
          Hi {userName},
        </Text>
      )}

      <Heading
        style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#333333',
          marginTop: '0',
          marginBottom: '20px',
        }}
      >
        {title}
      </Heading>

      <Section
        style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '6px',
          borderLeft: '4px solid #0066cc',
        }}
      >
        <Text
          style={{
            fontSize: '16px',
            color: '#555555',
            lineHeight: '1.6',
            margin: '0',
            whiteSpace: 'pre-wrap',
          }}
        >
          {message}
        </Text>
      </Section>

      {actionUrl && (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <Button
            href={actionUrl}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#0066cc',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            {actionText}
          </Button>
        </div>
      )}

      <Text
        style={{
          fontSize: '14px',
          color: '#777777',
          marginTop: '30px',
          fontStyle: 'italic',
        }}
      >
        This is an automated notification from your account.
      </Text>
    </BaseEmailTemplate>
  );
}
