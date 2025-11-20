// src/features/email/utils/template-compiler.ts

import { render } from '@react-email/components';
import type { RenderTemplateRequest, RenderTemplateResponse } from '../types';

/**
 * Compile template variables in a string
 * Replaces {{variableName}} with actual values
 */
export function compileTemplate(template: string, data: Record<string, unknown>): string {
  let compiled = template;

  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    compiled = compiled.replace(regex, String(value ?? ''));
  });

  return compiled;
}

/**
 * Render React Email component to HTML
 */
export async function renderReactEmailToHtml(
  component: React.ReactElement
): Promise<string> {
  try {
    const html = await render(component);
    return html;
  } catch (error) {
    throw new Error(`Failed to render email template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Compile template with data
 */
export function compileEmailTemplate(
  subject: string,
  htmlTemplate: string,
  textTemplate: string | undefined,
  data: Record<string, unknown>
): RenderTemplateResponse {
  return {
    subject: compileTemplate(subject, data),
    html: compileTemplate(htmlTemplate, data),
    text: textTemplate ? compileTemplate(textTemplate, data) : undefined,
  };
}

/**
 * Extract variables from template string
 * Finds all {{variableName}} patterns
 */
export function extractTemplateVariables(template: string): string[] {
  const regex = /{{\\s*([a-zA-Z0-9_]+)\\s*}}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Validate template data against required variables
 */
export function validateTemplateData(
  requiredVariables: string[],
  data: Record<string, unknown>
): {
  valid: boolean;
  missingVariables: string[];
} {
  const missingVariables = requiredVariables.filter(
    variable => !(variable in data) || data[variable] === undefined || data[variable] === null
  );

  return {
    valid: missingVariables.length === 0,
    missingVariables,
  };
}
