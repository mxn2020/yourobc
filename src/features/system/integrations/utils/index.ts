// src/features/boilerplate/integrations/utils/index.ts

import { WebhookDeliveryStatus, IntegrationStatus, RateLimitStatus } from "../types";

// Re-export utility functions from config
export {
  formatRateLimit,
  sanitizeApiKey,
  isValidWebhookUrl,
  isValidRedirectUri,
} from "../config/integrations-config";

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
}

/**
 * Format duration in milliseconds to readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`;
  return `${(ms / 3600000).toFixed(2)}h`;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: WebhookDeliveryStatus | IntegrationStatus): string {
  switch (status) {
    case "delivered":
    case "connected":
      return "green";
    case "pending":
      return "yellow";
    case "failed":
    case "error":
      return "red";
    case "retrying":
    case "disconnected":
      return "gray";
    default:
      return "gray";
  }
}

/**
 * Get HTTP status code description
 */
export function getStatusCodeDescription(code: number): string {
  if (code >= 200 && code < 300) return "Success";
  if (code >= 300 && code < 400) return "Redirect";
  if (code >= 400 && code < 500) return "Client Error";
  if (code >= 500) return "Server Error";
  return "Unknown";
}

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Parse API scope into readable format
 */
export function formatScope(scope: string): string {
  const parts = scope.split(":");
  if (parts.length === 2) {
    return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} (${parts[1]})`;
  }
  return scope;
}

/**
 * Calculate rate limit percentage used
 */
export function getRateLimitPercentage(status: RateLimitStatus): number {
  return ((status.limit - status.remaining) / status.limit) * 100;
}

/**
 * Format rate limit status
 */
export function formatRateLimitStatus(status: RateLimitStatus): string {
  const used = status.limit - status.remaining;
  return `${used}/${status.limit} used`;
}

/**
 * Get time until rate limit resets
 */
export function getTimeUntilReset(resetTimestamp: number): string {
  const now = Date.now();
  const diff = resetTimestamp - now;

  if (diff <= 0) return "Reset";

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `Resets in ${hours}h`;
  if (minutes > 0) return `Resets in ${minutes}m`;
  return `Resets in ${seconds}s`;
}

/**
 * Validate webhook secret format
 */
export function isValidWebhookSecret(secret: string): boolean {
  return secret.length >= 16;
}

/**
 * Generate a random secret for webhooks
 */
export function generateWebhookSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Mask sensitive data in logs
 */
export function maskSensitiveData(data: any): any {
  if (typeof data !== "object" || data === null) return data;

  const masked = Array.isArray(data) ? [...data] : { ...data };
  const sensitiveKeys = ["password", "token", "secret", "api_key", "apiKey", "authorization"];

  for (const key in masked) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
      masked[key] = "***REDACTED***";
    } else if (typeof masked[key] === "object") {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
}

/**
 * Parse webhook event name into readable format
 */
export function formatEventName(eventName: string): string {
  return eventName
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Get webhook event category
 */
export function getEventCategory(eventName: string): string {
  const parts = eventName.split(".");
  return parts[0] || "unknown";
}

/**
 * Check if event matches pattern (supports wildcards)
 */
export function eventMatches(eventName: string, pattern: string): boolean {
  if (pattern === "*" || pattern === "**") return true;

  const regex = new RegExp(
    "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
  );
  return regex.test(eventName);
}

/**
 * Calculate webhook delivery success rate
 */
export function calculateSuccessRate(successful: number, total: number): number {
  if (total === 0) return 0;
  return (successful / total) * 100;
}

/**
 * Format OAuth scope for display
 */
export function formatOAuthScope(scope: string): { category: string; permission: string } {
  const parts = scope.split(":");
  return {
    category: parts[0] || "unknown",
    permission: parts[1] || "unknown",
  };
}

/**
 * Group scopes by category
 */
export function groupScopesByCategory(scopes: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  scopes.forEach((scope) => {
    const { category, permission } = formatOAuthScope(scope);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(permission);
  });

  return grouped;
}

/**
 * Check if IP address is in whitelist
 */
export function isIpAllowed(ip: string, allowedIps: string[] | undefined): boolean {
  if (!allowedIps || allowedIps.length === 0) return true;
  return allowedIps.includes(ip);
}

/**
 * Format IP address for display
 */
export function formatIpAddress(ip: string | undefined): string {
  if (!ip) return "Unknown";
  // Mask last octet for privacy
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.*`;
  }
  return ip;
}

/**
 * Get integration platform icon/color
 */
export function getIntegrationPlatformStyle(
  platform: string
): { icon: string; color: string } {
  switch (platform.toLowerCase()) {
    case "zapier":
      return { icon: "⚡", color: "#FF4A00" };
    case "make":
      return { icon: "🔧", color: "#7B68EE" };
    case "n8n":
      return { icon: "🔄", color: "#FF6D5A" };
    case "custom":
      return { icon: "🔌", color: "#6B7280" };
    default:
      return { icon: "🔗", color: "#6B7280" };
  }
}

/**
 * Validate redirect URI format
 */
export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(
  attemptNumber: number,
  initialDelay: number,
  backoffMultiplier: number,
  maxDelay: number
): number {
  const delay = initialDelay * Math.pow(backoffMultiplier, attemptNumber - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Format request/response for display
 */
export function formatHttpRequest(
  method: string,
  url: string,
  headers?: Record<string, string>,
  body?: any
): string {
  let formatted = `${method.toUpperCase()} ${url}\n`;

  if (headers) {
    formatted += "\nHeaders:\n";
    Object.entries(headers).forEach(([key, value]) => {
      formatted += `  ${key}: ${value}\n`;
    });
  }

  if (body) {
    formatted += "\nBody:\n";
    formatted += typeof body === "string" ? body : JSON.stringify(body, null, 2);
  }

  return formatted;
}
