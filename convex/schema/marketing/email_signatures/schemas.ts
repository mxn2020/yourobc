// convex/schema/marketing/email_signatures/schemas.ts
// Schema exports for email_signatures module

import { emailSignaturesTable, signatureTemplatesTable } from './email_signatures';

export const marketingEmailSignaturesSchemas = {
  marketingEmailSignatures: emailSignaturesTable,
  marketingSignatureTemplates: signatureTemplatesTable,
};
