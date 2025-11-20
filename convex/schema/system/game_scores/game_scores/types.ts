// convex/schema/boilerplate/game_scores/game_scores/types.ts
// Type extractions from validators for game_scores module

import { gameScoresValidators } from './validators';
import { Infer } from 'convex/values';

export type GameScoreDifficulty = Infer<typeof gameScoresValidators.difficulty>;
export type GameScoreMetadata = Infer<typeof gameScoresValidators.metadata>;
