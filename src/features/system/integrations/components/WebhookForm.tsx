// src/features/boilerplate/integrations/components/WebhookForm.tsx

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { CreateWebhookParams, Webhook } from "../types";
import { WEBHOOK_EVENTS } from "../types";
import { isValidWebhookUrl, generateWebhookSecret } from "../utils";
import { useAuth } from "@/features/boilerplate/auth";

interface WebhookFormProps {
  webhook?: Webhook; // For editing
  onSubmit: (params: CreateWebhookParams) => Promise<Id<"webhooks">>;
  onCancel?: () => void;
}

/**
 * Webhook Creation/Edit Form Component
 */
export function WebhookForm({ webhook, onSubmit, onCancel }: WebhookFormProps) {
  const { auth, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    url: webhook?.url || "",
    events: webhook?.events || [],
    secret: webhook?.secret || "",
    isActive: webhook?.isActive ?? true,
    generateSecret: false,
  });

  const handleEventToggle = (event: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const handleGenerateSecret = () => {
    const secret = generateWebhookSecret();
    setFormData((prev) => ({
      ...prev,
      secret,
      generateSecret: true,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url.trim()) {
      alert("Please enter a webhook URL");
      return;
    }

    if (!isValidWebhookUrl(formData.url)) {
      alert("Please enter a valid HTTPS URL");
      return;
    }

    if (formData.events.length === 0) {
      alert("Please select at least one event");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!auth?.id || !profile?.name) {
        alert("You must be logged in to create a webhook");
        return;
      }

      const params: CreateWebhookParams = {
        name: `Webhook for ${formData.events.join(", ")}`,
        url: formData.url,
        events: formData.events,
        secret: formData.secret || undefined,
        isActive: formData.isActive,
      };

      await onSubmit(params);
      onCancel?.();
    } catch (error) {
      console.error("Failed to save webhook:", error);
      alert("Failed to save webhook. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventCategories = Object.entries(
    Object.entries(WEBHOOK_EVENTS).reduce((acc, [key, value]) => {
      const category = value.split(".")[0];
      if (!acc[category]) acc[category] = [];
      acc[category].push({ key, value });
      return acc;
    }, {} as Record<string, Array<{ key: string; value: string }>>)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Webhook URL *
        </label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://example.com/webhook"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Must be a valid HTTPS URL</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Events *</label>
        <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
          {eventCategories.map(([category, events]) => (
            <div key={category}>
              <h4 className="font-medium text-sm text-gray-900 mb-2 capitalize">
                {category} Events
              </h4>
              <div className="space-y-2">
                {events.map(({ key, value }) => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.events.includes(value)}
                      onChange={() => handleEventToggle(value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Selected: {formData.events.length} event{formData.events.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Webhook Secret (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.secret}
            onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
            placeholder="Leave empty to not use HMAC signatures"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <button
            type="button"
            onClick={handleGenerateSecret}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors whitespace-nowrap"
          >
            Generate
          </button>
        </div>
        {formData.generateSecret && formData.secret && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Secret generated. Save this value securely!
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Used to sign webhook payloads for verification
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
        <p className="text-xs text-gray-500 ml-6">
          Inactive webhooks won't receive events
        </p>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : webhook ? "Update Webhook" : "Create Webhook"}
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
