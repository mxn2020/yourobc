// src/features/boilerplate/integrations/components/ApiKeyForm.tsx

import { useState } from "react";
import { CreateApiKeyParams, CreateApiKeyResult } from "../types";
import { API_SCOPES } from "../types";
import { getRateLimitForTier } from "../config/integrations-config";
import { copyToClipboard } from "../utils";
import { useAuth } from "@/features/boilerplate/auth";

interface ApiKeyFormProps {
  onSubmit: (params: CreateApiKeyParams) => Promise<CreateApiKeyResult>;
  onCancel?: () => void;
}

/**
 * API Key Creation Form Component
 *
 * Form to create a new API key with scopes and rate limits
 *
 * @example
 * ```tsx
 * <ApiKeyForm
 *   onSubmit={async (params) => await createApiKey(params)}
 *   onCancel={() => setShowForm(false)}
 * />
 * ```
 */
export function ApiKeyForm({ onSubmit, onCancel }: ApiKeyFormProps) {
  const { auth, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    scopes: [] as string[],
    tier: "free" as "free" | "pro" | "enterprise",
    customRateLimit: false,
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 1000,
    expiresInDays: 365,
    allowedIps: "",
  });

  const handleScopeToggle = (scope: string) => {
    setFormData((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter((s) => s !== scope)
        : [...prev.scopes, scope],
    }));
  };

  const handleTierChange = (tier: "free" | "pro" | "enterprise") => {
    const limits = getRateLimitForTier(tier);
    setFormData((prev) => ({
      ...prev,
      tier,
      requestsPerMinute: limits.requestsPerMinute,
      requestsPerHour: limits.requestsPerHour,
      requestsPerDay: limits.requestsPerDay,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a name for the API key");
      return;
    }

    if (formData.scopes.length === 0) {
      alert("Please select at least one scope");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!auth?.id || !profile?.name) {
        alert("You must be logged in to create an API key");
        return;
      }

      const params: CreateApiKeyParams = {
        name: formData.name,
        scopes: formData.scopes,
        rateLimit: {
          requestsPerMinute: formData.requestsPerMinute,
          requestsPerHour: formData.requestsPerHour,
          requestsPerDay: formData.requestsPerDay,
        },
        expiresAt:
          formData.expiresInDays > 0
            ? Date.now() + formData.expiresInDays * 24 * 60 * 60 * 1000
            : undefined,
        allowedIps:
          formData.allowedIps.trim().length > 0
            ? formData.allowedIps.split(",").map((ip) => ip.trim())
            : undefined,
      };

      const result = await onSubmit(params);
      setCreatedKey(result.key);
    } catch (error) {
      console.error("Failed to create API key:", error);
      alert("Failed to create API key. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyKey = async () => {
    if (createdKey) {
      const success = await copyToClipboard(createdKey);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  // Show success screen after key creation
  if (createdKey) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3">
          ✓ API Key Created Successfully
        </h3>

        <div className="bg-white border border-green-300 rounded p-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Important:</strong> Copy this API key now. You won't be able to see it again!
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
              {createdKey}
            </code>
            <button
              onClick={handleCopyKey}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              {copySuccess ? "✓ Copied!" : "Copy Key"}
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            setCreatedKey(null);
            onCancel?.();
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Key Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Production API Key"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Scopes *</label>
        <div className="space-y-2">
          {Object.entries(API_SCOPES).map(([key, value]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.scopes.includes(value)}
                onChange={() => handleScopeToggle(value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{value}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rate Limit Tier
        </label>
        <div className="flex gap-2">
          {(["free", "pro", "enterprise"] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => handleTierChange(tier)}
              className={`flex-1 px-4 py-2 rounded transition-colors ${
                formData.tier === tier
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={formData.customRateLimit}
            onChange={(e) =>
              setFormData({ ...formData, customRateLimit: e.target.checked })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Custom Rate Limits</span>
        </label>

        {formData.customRateLimit && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Per Minute</label>
              <input
                type="number"
                value={formData.requestsPerMinute}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requestsPerMinute: parseInt(e.target.value) || 0,
                  })
                }
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Per Hour</label>
              <input
                type="number"
                value={formData.requestsPerHour}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requestsPerHour: parseInt(e.target.value) || 0,
                  })
                }
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Per Day</label>
              <input
                type="number"
                value={formData.requestsPerDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requestsPerDay: parseInt(e.target.value) || 0,
                  })
                }
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expires In (days)
        </label>
        <input
          type="number"
          value={formData.expiresInDays}
          onChange={(e) =>
            setFormData({
              ...formData,
              expiresInDays: parseInt(e.target.value) || 0,
            })
          }
          min="0"
          placeholder="365 (0 for no expiration)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Set to 0 for no expiration</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Allowed IPs (optional)
        </label>
        <input
          type="text"
          value={formData.allowedIps}
          onChange={(e) => setFormData({ ...formData, allowedIps: e.target.value })}
          placeholder="192.168.1.1, 10.0.0.1 (comma-separated)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to allow requests from any IP
        </p>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create API Key"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
