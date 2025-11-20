// convex/lib/shared/utils/publicId.ts

import { PUBLIC_ID_CONFIG, getPrefix, type PublicIdTable } from '@/shared/config/publicId';

/**
 * Generate a public ID using the configured strategy
 */
export function generatePublicId(table: PublicIdTable): string {
  const prefix = PUBLIC_ID_CONFIG.includePrefix ? getPrefix(table) : '';
  const separator = PUBLIC_ID_CONFIG.includePrefix ? '_' : '';

  let id: string;

  switch (PUBLIC_ID_CONFIG.strategy) {
    case 'uuid':
      id = generateUuidId();
      break;
    case 'nanoid':
      id = generateNanoId(PUBLIC_ID_CONFIG.length || 16);
      break;
    case 'stripe':
      id = generateStripeStyleId(PUBLIC_ID_CONFIG.length || 16);
      break;
    case 'ulid':
      id = generateUlidId();
      break;
    case 'short':
      id = generateShortId(PUBLIC_ID_CONFIG.length || 8);
      break;
    case 'readable':
      id = generateReadableId(PUBLIC_ID_CONFIG.length || 2);
      break;
    default:
      id = generateUuidId();
  }

  return `${prefix}${separator}${id}`;
}

/**
 * UUID-based ID (default)
 * Format: Take first 12 chars of UUID without hyphens
 */
function generateUuidId(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 12);
}

/**
 * NanoID-style ID
 * URL-safe characters only
 */
function generateNanoId(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';

  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }

  return id;
}

/**
 * Stripe-style ID
 * Lowercase alphanumeric, no ambiguous characters
 */
function generateStripeStyleId(length: number): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'; // No ambiguous: 0,o,1,l,i
  let id = '';

  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }

  return id;
}

/**
 * ULID-style ID
 * Lexicographically sortable, timestamp-encoded
 */
function generateUlidId(): string {
  const timestamp = Date.now().toString(36);
  const random = generateNanoId(16);
  return `${timestamp}${random}`.substring(0, 26).toLowerCase();
}

/**
 * Short ID
 * For when brevity matters most
 */
function generateShortId(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';

  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }

  return id;
}

/**
 * Readable ID (Docker-style)
 * Format: adjective_noun (e.g., 'admiring_galileo')
 * Uses length parameter to control word count:
 * - length 2: adjective_noun
 * - length 3+: adjective_adjective_noun
 */
function generateReadableId(length: number = 2): string {
  const adjectives = [
    'admiring', 'adoring', 'affectionate', 'agile', 'amazing',
    'awesome', 'beautiful', 'blissful', 'bold', 'brave',
    'charming', 'clever', 'cool', 'compassionate', 'confident',
    'dazzling', 'determined', 'devoted', 'eager', 'ecstatic',
    'elastic', 'elegant', 'eloquent', 'epic', 'exciting',
    'fervent', 'festive', 'flamboyant', 'focused', 'friendly',
    'gallant', 'gifted', 'gracious', 'happy', 'hopeful',
    'inspiring', 'intelligent', 'jolly', 'jovial', 'keen',
    'kind', 'laughing', 'loving', 'lucid', 'magical',
    'majestic', 'modest', 'musing', 'mystical', 'nifty',
    'noble', 'optimistic', 'peaceful', 'pensive', 'practical',
    'precious', 'quirky', 'radiant', 'relaxed', 'remarkable',
    'romantic', 'serene', 'sharp', 'stoic', 'stupendous',
    'tender', 'thirsty', 'trusting', 'upbeat', 'vibrant',
    'vigilant', 'vigorous', 'wizardly', 'wonderful', 'xenial',
    'youthful', 'zealous', 'zen'
  ];

  const nouns = [
    'albattani', 'allen', 'almeida', 'antonelli', 'agnesi',
    'archimedes', 'ardinghelli', 'aryabhata', 'austin', 'babbage',
    'banach', 'banzai', 'bardeen', 'bartik', 'bassi',
    'beaver', 'bell', 'benz', 'bhabha', 'bhaskara',
    'black', 'blackburn', 'blackwell', 'bohr', 'booth',
    'borg', 'bose', 'bouman', 'boyd', 'brahmagupta',
    'brattain', 'brown', 'buck', 'burnell', 'cannon',
    'carson', 'cartwright', 'carver', 'cerf', 'chandrasekhar',
    'chaplygin', 'chatelet', 'chatterjee', 'chebyshev', 'cohen',
    'chaum', 'clarke', 'colden', 'cori', 'cray',
    'curie', 'curran', 'darwin', 'davinci', 'dewdney',
    'dhawan', 'diffie', 'dijkstra', 'dirac', 'driscoll',
    'dubinsky', 'easley', 'edison', 'einstein', 'elbakyan',
    'elgamal', 'elion', 'ellis', 'engelbart', 'euclid',
    'euler', 'faraday', 'feistel', 'fermat', 'fermi',
    'feynman', 'franklin', 'gagarin', 'galileo', 'gates',
    'gauss', 'germain', 'goldberg', 'goldstine', 'goldwasser',
    'golick', 'goodall', 'gould', 'greider', 'grothendieck',
    'haibt', 'hamilton', 'haslett', 'hawking', 'hellman',
    'heisenberg', 'hermann', 'herschel', 'hertz', 'heyrovsky',
    'hodgkin', 'hofstadter', 'hoover', 'hopper', 'hugle',
    'hypatia', 'ishizaka', 'jackson', 'jang', 'jennings',
    'jepsen', 'johnson', 'joliot', 'jones', 'kalam',
    'kapitsa', 'kare', 'keller', 'kepler', 'khayyam',
    'khorana', 'kilby', 'kirch', 'knuth', 'kowalevski',
    'lalande', 'lamarr', 'lamport', 'leakey', 'leavitt',
    'lederberg', 'lehmann', 'lewin', 'lichterman', 'liskov',
    'lovelace', 'lumiere', 'mahavira', 'margulis', 'matsumoto',
    'maxwell', 'mayer', 'mccarthy', 'mcclintock', 'mclaren',
    'mclean', 'mcnulty', 'mendel', 'mendeleev', 'meitner',
    'meninsky', 'merkle', 'mestorf', 'mirzakhani', 'moore',
    'morse', 'murdock', 'moser', 'napier', 'nash',
    'neumann', 'newton', 'nightingale', 'nobel', 'noether',
    'northcutt', 'noyce', 'panini', 'pare', 'pascal',
    'pasteur', 'payne', 'perlman', 'pike', 'poincare',
    'poitras', 'proskuriakova', 'ptolemy', 'raman', 'ramanujan',
    'ride', 'montalcini', 'ritchie', 'rhodes', 'robinson',
    'roentgen', 'rosalind', 'rubin', 'saha', 'sammet',
    'sanderson', 'satoshi', 'shamir', 'shannon', 'shaw',
    'shirley', 'shockley', 'shtern', 'sinoussi', 'snyder',
    'solomon', 'spence', 'stallman', 'stonebraker', 'sutherland',
    'swanson', 'swartz', 'swirles', 'taussig', 'tereshkova',
    'tesla', 'tharp', 'thompson', 'torvalds', 'tu',
    'turing', 'varahamihira', 'vaughan', 'visvesvaraya', 'volhard',
    'villani', 'wescoff', 'wilbur', 'wiles', 'williams',
    'williamson', 'wilson', 'wing', 'wozniak', 'wright',
    'wu', 'yalow', 'yonath', 'zhukovsky'
  ];

  const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  if (length >= 3) {
    // Three words: adjective_adjective_noun
    return `${getRandomItem(adjectives)}_${getRandomItem(adjectives)}_${getRandomItem(nouns)}`;
  } else {
    // Two words: adjective_noun (default)
    return `${getRandomItem(adjectives)}_${getRandomItem(nouns)}`;
  }
}

/**
 * Check uniqueness of public ID in database
 * Returns the generated ID if unique, or regenerates up to maxRetries times
 */
export async function generateUniquePublicId(
  ctx: any,
  table: PublicIdTable,
  maxRetries: number = 5
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const publicId = generatePublicId(table);

    // Check if ID already exists
    const existing = await ctx.db
      .query(table)
      .withIndex('by_publicId', (q: any) => q.eq('publicId', publicId))
      .first();

    if (!existing) {
      return publicId;
    }
  }

  throw new Error(`Failed to generate unique public ID for ${table} after ${maxRetries} attempts`);
}

/**
 * Parse a public ID to extract table prefix
 */
export function parsePublicId(publicId: string): { prefix: string; id: string } | null {
  if (!PUBLIC_ID_CONFIG.includePrefix) {
    return { prefix: '', id: publicId };
  }

  const parts = publicId.split('_');
  if (parts.length !== 2) {
    return null;
  }

  return {
    prefix: parts[0],
    id: parts[1],
  };
}
