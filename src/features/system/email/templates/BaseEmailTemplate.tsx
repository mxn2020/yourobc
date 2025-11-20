// src/features/email/templates/BaseEmailTemplate.tsx

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';
import * as React from 'react';

export interface BaseEmailTemplateProps {
  children: React.ReactNode;
  previewText?: string;
  footerText?: string;
  unsubscribeUrl?: string;
}

/**
 * Base email template with consistent styling and structure
 * All other templates should extend or use this as a base
 */
export function BaseEmailTemplate({
  children,
  previewText = 'Email from Your App',
  footerText = '© 2025 Your Company. All rights reserved.',
  unsubscribeUrl,
}: BaseEmailTemplateProps) {
  return (
    <Html>
      <Head>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background-color: #f6f6f6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .header {
            padding: 40px 20px;
            text-align: center;
            background-color: #0066cc;
            color: #ffffff;
          }
          .content {
            padding: 40px 30px;
          }
          .footer {
            padding: 20px 30px;
            text-align: center;
            background-color: #f6f6f6;
            font-size: 12px;
            color: #999999;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0066cc;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
          }
        `}</style>
      </Head>
      <Body style={{ backgroundColor: '#f6f6f6', padding: '20px 0' }}>
        {previewText && (
          <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
            {previewText}
          </div>
        )}
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Section style={{ padding: '40px 30px' }}>{children}</Section>

          <Hr style={{ borderColor: '#e5e5e5', margin: '0' }} />

          <Section
            style={{
              padding: '20px 30px',
              textAlign: 'center',
              backgroundColor: '#f9f9f9',
            }}
          >
            <Text
              style={{
                fontSize: '12px',
                color: '#999999',
                margin: '0 0 10px 0',
              }}
            >
              {footerText}
            </Text>
            {unsubscribeUrl && (
              <Link
                href={unsubscribeUrl}
                style={{
                  fontSize: '12px',
                  color: '#0066cc',
                  textDecoration: 'underline',
                }}
              >
                Unsubscribe
              </Link>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
