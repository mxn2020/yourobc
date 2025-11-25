// convex/schema/yourobc/supporting/counters/types.ts
import { Infer } from 'convex/values';
import { countersValidators } from './validators';

export type CounterType = Infer<typeof countersValidators.counterType>;
