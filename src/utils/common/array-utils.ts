// src/utils/common/array-utils.ts

/**
 * Remove duplicates from array based on a key function
 */
export function uniqueBy<T, K>(
  array: T[],
  keyFn: (item: T) => K
): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Remove duplicate primitives from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array items by key
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

/**
 * Sort array by multiple fields with directions
 */
export function sortBy<T>(
  array: T[],
  sortFields: Array<{
    field: keyof T | ((item: T) => unknown);
    direction: 'asc' | 'desc';
  }>
): T[] {
  return [...array].sort((a, b) => {
    for (const { field, direction } of sortFields) {
      const aValue = typeof field === 'function' ? field(a) : a[field];
      const bValue = typeof field === 'function' ? field(b) : b[field];

      let comparison = 0;

      // Handle null/undefined values
      if (aValue == null && bValue == null) {
        comparison = 0;
      } else if (aValue == null) {
        comparison = -1;
      } else if (bValue == null) {
        comparison = 1;
      }
      // Type-safe comparisons for known types
      else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
      }
      // Fallback for mixed or other types
      else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      if (comparison !== 0) {
        return direction === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });
}

/**
 * Paginate array
 */
export function paginate<T>(
  array: T[],
  page: number,
  pageSize: number
): {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
} {
  const totalItems = array.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    items: array.slice(startIndex, endIndex),
    totalItems,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Shuffle array randomly
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Take first n items from array
 */
export function take<T>(array: T[], n: number): T[] {
  return array.slice(0, Math.max(0, n));
}

/**
 * Take last n items from array
 */
export function takeLast<T>(array: T[], n: number): T[] {
  return array.slice(-Math.max(0, n));
}

/**
 * Drop first n items from array
 */
export function drop<T>(array: T[], n: number): T[] {
  return array.slice(Math.max(0, n));
}

/**
 * Drop last n items from array
 */
export function dropLast<T>(array: T[], n: number): T[] {
  return array.slice(0, -Math.max(0, n));
}

/**
 * Find intersection of multiple arrays
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return [...arrays[0]];
  
  const [first, ...rest] = arrays;
  return first.filter(item => 
    rest.every(array => array.includes(item))
  );
}

/**
 * Find union of multiple arrays (unique items)
 */
export function union<T>(...arrays: T[][]): T[] {
  const combined = arrays.flat();
  return Array.from(new Set(combined));
}

/**
 * Find difference between two arrays (items in first but not in second)
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  const set2 = new Set(array2);
  return array1.filter(item => !set2.has(item));
}

/**
 * Check if arrays are equal (shallow comparison)
 */
export function arraysEqual<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) return false;
  return array1.every((item, index) => item === array2[index]);
}

/**
 * Check if arrays are equal (deep comparison for objects)
 */
export function arraysDeepEqual<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) return false;
  return array1.every((item, index) => 
    JSON.stringify(item) === JSON.stringify(array2[index])
  );
}

/**
 * Flatten nested arrays
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((acc, item) => {
    if (Array.isArray(item)) {
      acc.push(...flatten(item));
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

/**
 * Compact array by removing falsy values
 */
export function compact<T>(array: (T | null | undefined | false | 0 | '')[]): T[] {
  return array.filter(Boolean) as T[];
}

/**
 * Move item in array from one index to another
 */
export function moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [movedItem] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, movedItem);
  return result;
}

/**
 * Insert item at specific index
 */
export function insertAt<T>(array: T[], index: number, item: T): T[] {
  const result = [...array];
  result.splice(index, 0, item);
  return result;
}

/**
 * Remove item at specific index
 */
export function removeAt<T>(array: T[], index: number): T[] {
  const result = [...array];
  result.splice(index, 1);
  return result;
}

/**
 * Update item at specific index
 */
export function updateAt<T>(array: T[], index: number, item: T): T[] {
  const result = [...array];
  result[index] = item;
  return result;
}

/**
 * Toggle item in array (add if not present, remove if present)
 */
export function toggleItem<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index === -1) {
    return [...array, item];
  } else {
    return array.filter((_, i) => i !== index);
  }
}

/**
 * Get random item from array
 */
export function sample<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get n random items from array
 */
export function sampleSize<T>(array: T[], n: number): T[] {
  const shuffled = shuffle(array);
  return take(shuffled, n);
}

/**
 * Sum array of numbers
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

/**
 * Get average of array of numbers
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return sum(numbers) / numbers.length;
}

/**
 * Get median of array of numbers
 */
export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
}

/**
 * Get min and max values from array
 */
export function minMax(numbers: number[]): { min: number; max: number } | null {
  if (numbers.length === 0) return null;
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers)
  };
}

/**
 * Count occurrences of each item in array
 */
export function countBy<T>(
  array: T[],
  keyFn?: (item: T) => string | number
): Record<string, number> {
  return array.reduce((counts, item) => {
    const key = keyFn ? keyFn(item).toString() : item?.toString() || '';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}

/**
 * Check if array includes all items
 */
export function includesAll<T>(array: T[], items: T[]): boolean {
  return items.every(item => array.includes(item));
}

/**
 * Check if array includes any of the items
 */
export function includesAny<T>(array: T[], items: T[]): boolean {
  return items.some(item => array.includes(item));
}

/**
 * Binary search in sorted array
 */
export function binarySearch<T>(
  sortedArray: T[],
  target: T,
  compareFn?: (a: T, b: T) => number
): number {
  let left = 0;
  let right = sortedArray.length - 1;
  
  const compare = compareFn || ((a: T, b: T) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const comparison = compare(sortedArray[mid], target);
    
    if (comparison === 0) {
      return mid;
    } else if (comparison < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1; // Not found
}