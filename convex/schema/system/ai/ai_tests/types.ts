// convex/schema/boilerplate/ai/ai_tests/types.ts
// Type extractions from validators for ai_tests module

import { Infer } from 'convex/values';
import { aiTestsValidators } from './validators';

export type AITestType = Infer<typeof aiTestsValidators.type>;
export type AITestStatus = Infer<typeof aiTestsValidators.status>;
export type AITestParameters = Infer<typeof aiTestsValidators.parameters>;
export type AITestExpectedResults = Infer<typeof aiTestsValidators.expectedResults>;
export type AITestResult = Infer<typeof aiTestsValidators.testResult>;
export type AITestSummary = Infer<typeof aiTestsValidators.summary>;
export type AITestExtendedMetadata = Infer<typeof aiTestsValidators.extendedMetadata>;
