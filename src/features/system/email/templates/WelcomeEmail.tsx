// src/features/email/templates/WelcomeEmail.tsx

import { Text, Button, Heading } from '@react-email/components';
import * as React from 'react';
import { BaseEmailTemplate } from './BaseEmailTemplate';

export interface WelcomeEmailProps {
  userName: string;
  loginUrl?: string;
}

/**
 * Welcome email template for new users
 */
export function WelcomeEmail({ userName, loginUrl }: WelcomeEmailProps) {
  return (
    <BaseEmailTemplate previewText={`Welcome to our platform, ${userName}!`}>
      <Heading
        style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#333333',
          marginTop: '0',
          marginBottom: '20px',
        }}
      >
        Welcome, {userName}! 👋
      </Heading>

      <Text style={{ fontSize: '16px', color: '#555555', lineHeight: '1.6' }}>
        We're thrilled to have you on board. Your account has been successfully created and
        you're ready to get started.
      </Text>

      <Text style={{ fontSize: '16px', color: '#555555', lineHeight: '1.6' }}>
        Here are a few things you can do to get started:
      </Text>

      <ul style={{ fontSize: '16px', color: '#555555', lineHeight: '1.8', paddingLeft: '20px' }}>
        <li>Complete your profile</li>
        <li>Explore our features</li>
        <li>Connect with your team</li>
      </ul>

      {loginUrl && (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <Button
            href={loginUrl}
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
            Get Started
          </Button>
        </div>
      )}

      <Text style={{ fontSize: '14px', color: '#777777', marginTop: '30px' }}>
        If you have any questions, feel free to reach out to our support team. We're here to
        help!
      </Text>
    </BaseEmailTemplate>
  );
}
