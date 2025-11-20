// src/features/boilerplate/lib/auth-permissions.ts
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, userAc } from "better-auth/plugins/admin/access";

// Merge default admin plugin statements with your custom ones
const statement = {
  ...defaultStatements,

  // Project management
  project: [
    "create", "read", "update", "delete",
    "share", "publish", "archive", "export"
  ],

  // Content management
  content: [
    "create", "read", "update", "delete",
    "moderate", "publish", "schedule", "featured"
  ],

  // Analytics & reporting
  analytics: ["view", "export", "dashboard", "custom_reports"],

  // System administration
  settings: ["view", "update", "reset", "backup"],
  audit: ["view", "export", "purge"],

  // Billing & finance
  billing: ["view", "manage", "process", "refund", "export"],

} as const;

const ac = createAccessControl(statement);

// Define all your custom roles
export const superadminRole = ac.newRole({
  ...adminAc.statements,
  project: ["create", "read", "update", "delete"],
  content: ["create", "read", "update", "delete", "moderate"],
  analytics: ["view", "export"],
  billing: ["view", "manage"],
});

export const adminRole = ac.newRole({
  ...adminAc.statements,
  project: ["create", "read", "update", "delete"],
  content: ["create", "read", "update", "delete", "moderate"],
});

export const userRole = ac.newRole({
  ...userAc.statements,
  project: ["read"],
  content: ["read"],
});

export const moderatorRole = ac.newRole({
  project: ["read"],
  content: ["create", "read", "update", "delete", "moderate"],
});

export const editorRole = ac.newRole({
  project: ["create", "read", "update"],
  content: ["create", "read", "update", "publish"],
});

export const analystRole = ac.newRole({
  project: ["read"],
  content: ["read"],
  analytics: ["view", "export", "dashboard"],
  audit: ["view"],
});


export const guestRole = ac.newRole({
  project: ["read"],
  content: ["read"],
});

export { ac };