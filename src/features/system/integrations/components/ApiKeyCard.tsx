// src/features/system/integrations/components/ApiKeyCard.tsx

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ApiKey } from "../types";
import { formatDate, formatRateLimit, sanitizeApiKey, copyToClipboard } from "../utils";
import { INTEGRATIONS_CONFIG } from "../config/integrations-config";

interface ApiKeyCardProps {
  apiKey: ApiKey;
  onRevoke: (keyId: Id<"apiKeys">) => Promise<void>;
  onViewDetails?: (keyId: Id<"apiKeys">) => void;
}

/**
 * API Key Card Component
 *
 * Displays an API key with its details and actions
 *
 * @example
 * ```tsx
 * <ApiKeyCard
 *   apiKey={apiKey}
 *   onRevoke={async (keyId) => await revokeApiKey(keyId)}
 *   onViewDetails={(keyId) => navigate(`/integrations/api-keys/${keyId}`)}
 * />
 * ```
 */
export function ApiKeyCard({ apiKey, onRevoke, onViewDetails }: ApiKeyCardProps) {
  const [isRevoking, setIsRevoking] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleRevoke = async () => {
    if (!confirm(`Are you sure you want to revoke the API key "${apiKey.name}"?`)) {
      return;
    }

    setIsRevoking(true);
    try {
      await onRevoke(apiKey._id);
    } catch (error) {
      console.error("Failed to revoke API key:", error);
      alert("Failed to revoke API key. Please try again.");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopyPrefix = async () => {
    const success = await copyToClipboard(apiKey.keyPrefix);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const isRevoked = !!apiKey.revokedAt;
  const isExpired = apiKey.expiresAt ? apiKey.expiresAt < Date.now() : false;
  const isActive = !isRevoked && !isExpired;

  return (
    <div
      className={`border rounded-lg p-4 ${
        isRevoked
          ? "border-red-300 bg-red-50"
          : isExpired
          ? "border-yellow-300 bg-yellow-50"
          : "border-gray-300 bg-white"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{apiKey.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {sanitizeApiKey(apiKey.keyPrefix)}
            </code>
            <button
              onClick={handleCopyPrefix}
              className="text-xs text-blue-600 hover:text-blue-800"
              title="Copy API key prefix"
            >
              {copySuccess ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRevoked && (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
              Revoked
            </span>
          )}
          {isExpired && !isRevoked && (
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
              Expired
            </span>
          )}
          {isActive && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
              Active
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div>
          <span className="font-medium">Scopes:</span>{" "}
          <span className="text-gray-800">
            {apiKey.scopes.length > 0 ? apiKey.scopes.join(", ") : "None"}
          </span>
        </div>

        <div>
          <span className="font-medium">Rate Limit:</span>{" "}
          <span className="text-gray-800">{formatRateLimit(apiKey.rateLimit)}</span>
        </div>

        <div>
          <span className="font-medium">Created:</span>{" "}
          <span className="text-gray-800">{formatDate(apiKey.createdAt)}</span>
        </div>

        {apiKey.expiresAt && (
          <div>
            <span className="font-medium">Expires:</span>{" "}
            <span className={isExpired ? "text-red-600 font-medium" : "text-gray-800"}>
              {formatDate(apiKey.expiresAt)}
            </span>
          </div>
        )}

        {apiKey.lastUsedAt && (
          <div>
            <span className="font-medium">Last Used:</span>{" "}
            <span className="text-gray-800">{formatDate(apiKey.lastUsedAt)}</span>
          </div>
        )}

        {apiKey.allowedIps && apiKey.allowedIps.length > 0 && (
          <div>
            <span className="font-medium">Allowed IPs:</span>{" "}
            <span className="text-gray-800">{apiKey.allowedIps.join(", ")}</span>
          </div>
        )}

        {apiKey.totalRequests !== undefined && (
          <div>
            <span className="font-medium">Total Requests:</span>{" "}
            <span className="text-gray-800">{apiKey.totalRequests.toLocaleString()}</span>
          </div>
        )}

        {isRevoked && apiKey.revokedAt && (
          <div>
            <span className="font-medium text-red-600">Revoked:</span>{" "}
            <span className="text-red-600">{formatDate(apiKey.revokedAt)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(apiKey._id)}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
          >
            View Details
          </button>
        )}

        {isActive && (
          <button
            onClick={handleRevoke}
            disabled={isRevoking}
            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRevoking ? "Revoking..." : "Revoke"}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * API Key List Component
 *
 * Displays a list of API keys
 *
 * @example
 * ```tsx
 * <ApiKeyList
 *   apiKeys={apiKeys}
 *   onRevoke={revokeApiKey}
 *   emptyMessage="No API keys yet. Create one to get started."
 * />
 * ```
 */
export function ApiKeyList({
  apiKeys,
  onRevoke,
  onViewDetails,
  emptyMessage = "No API keys found.",
}: {
  apiKeys: ApiKey[];
  onRevoke: (keyId: Id<"apiKeys">) => Promise<void>;
  onViewDetails?: (keyId: Id<"apiKeys">) => void;
  emptyMessage?: string;
}) {
  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {apiKeys.map((apiKey) => (
        <ApiKeyCard
          key={apiKey._id}
          apiKey={apiKey}
          onRevoke={onRevoke}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
