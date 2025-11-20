// src/features/boilerplate/[module_name]/types/index.ts

import type { Doc, Id } from "@/convex/_generated/dataModel";

// ==========================================
// ENTITY TYPES
// ==========================================

export type [Entity] = Doc<"[tableName]">;
export type [Entity]Id = Id<"[tableName]">;

// ==========================================
// CREATE/UPDATE DATA TYPES
// ==========================================

export interface Create[Entity]Data {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  visibility?: "private" | "team" | "public";
  category?: string;
  tags?: string[];
  startDate?: number;
  dueDate?: number;
  settings?: {
    allowComments?: boolean;
    emailNotifications?: boolean;
    requireApproval?: boolean;
    autoArchive?: boolean;
  };
  extendedMetadata?: {
    // Add entity-specific extended metadata fields
    [key: string]: any;
  };
}

export interface Update[Entity]Data {
  title?: string;
  description?: string;
  status?: [Entity]["status"];
  priority?: [Entity]["priority"];
  visibility?: [Entity]["visibility"];
  category?: string;
  tags?: string[];
  startDate?: number;
  dueDate?: number;
  progress?: number;
  settings?: Partial<[Entity]["settings"]>;
  extendedMetadata?: Partial<[Entity]["extendedMetadata"]>;
}

// ==========================================
// QUERY OPTIONS
// ==========================================

export interface [Entities]ListOptions {
  // Filtering
  status?: string | string[];
  priority?: string | string[];
  category?: string;
  tags?: string[];
  search?: string;
  visibility?: "private" | "team" | "public";
  ownerId?: Id<"userProfiles">;
  includeArchived?: boolean;

  // Sorting
  sortBy?: "title" | "createdAt" | "updatedAt" | "dueDate" | "priority" | "status";
  sortOrder?: "asc" | "desc";

  // Pagination
  limit?: number;
  offset?: number;
  cursor?: string;
}

// ==========================================
// QUERY RESPONSE TYPES
// ==========================================

export interface [Entities]QueryResult {
  [entities]: [Entity][];
  total: number;
  hasMore: boolean;
  cursor?: string;
}

export interface [Entity]StatsResult {
  total: number;
  active: number;
  completed: number;
  archived: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byStatus: {
    [key: string]: number;
  };
  overdue: number;
  dueThisWeek: number;
  dueThisMonth: number;
}

export interface User[Entities]Result {
  owned: [Entity][];
  collaborated: [Entity][];
  total: number;
}

// ==========================================
// MEMBER/COLLABORATOR TYPES (if applicable)
// ==========================================

export type [Entity]Member = Doc<"[tableName]Members">;
export type [Entity]MemberId = Id<"[tableName]Members">;

export interface Add[Entity]MemberData {
  {entity}Id: [Entity]Id;
  userId: Id<"userProfiles">;
  role: "owner" | "admin" | "member" | "viewer";
}

export interface Update[Entity]MemberData {
  role?: "owner" | "admin" | "member" | "viewer";
  permissions?: string[];
}

// ==========================================
// VALIDATION TYPES
// ==========================================

export interface [Entity]ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface [Entity]FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
  startDate?: string;
  category?: string;
  [key: string]: string | undefined;
}
