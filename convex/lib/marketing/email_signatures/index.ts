// convex/lib/marketing/email_signatures/index.ts

export { EMAIL_SIGNATURE_CONSTANTS } from './constants';
export * from './types';

export { getEmailSignatures, getEmailSignature } from './queries';
export { createEmailSignature, updateEmailSignature, deleteEmailSignature } from './mutations';
export { validateEmailSignatureData, generateSignatureHTML } from './utils';
export { canViewSignature, canEditSignature, canDeleteSignature, requireViewAccess, requireEditAccess, requireDeleteAccess } from './permissions';
