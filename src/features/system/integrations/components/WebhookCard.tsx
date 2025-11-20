// src/features/boilerplate/integrations/components/WebhookCard.tsx

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Webhook, TestWebhookResult } from "../types";
import { formatDate, formatEventName, getStatusColor } from "../utils";

interface WebhookCardProps {
  webhook: Webhook;
  onTest: (webhookId: Id<"webhooks">) => Promise<TestWebhookResult>;
  onUpdate?: (webhookId: Id<"webhooks">) => void;
  onDelete: (webhookId: Id<"webhooks">) => Promise<void>;
  onViewDetails?: (webhookId: Id<"webhooks">) => void;
}

/**
 * Webhook Card Component
 *
 * Displays a webhook with its details and actions
 */
export function WebhookCard({
  webhook,
  onTest,
  onUpdate,
  onDelete,
  onViewDetails,
}: WebhookCardProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [testResult, setTestResult] = useState<TestWebhookResult | null>(null);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await onTest(webhook._id);
      setTestResult(result);
    } catch (error) {
      console.error("Failed to test webhook:", error);
      alert("Failed to test webhook. Please try again.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete webhook "${webhook.url}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(webhook._id);
    } catch (error) {
      console.error("Failed to delete webhook:", error);
      alert("Failed to delete webhook. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 break-all">{webhook.url}</h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                webhook.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {webhook.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div>
          <span className="font-medium">Events:</span>{" "}
          <div className="flex flex-wrap gap-1 mt-1">
            {webhook.events.map((event) => (
              <span
                key={event}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
              >
                {formatEventName(event)}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="font-medium">Created:</span>{" "}
          <span className="text-gray-800">{formatDate(webhook.createdAt)}</span>
        </div>

        {webhook.lastTriggeredAt && (
          <div>
            <span className="font-medium">Last Triggered:</span>{" "}
            <span className="text-gray-800">{formatDate(webhook.lastTriggeredAt)}</span>
          </div>
        )}

        {webhook.successfulDeliveries !== undefined && webhook.failedDeliveries !== undefined && (
          <div>
            <span className="font-medium">Success Rate:</span>{" "}
            <span className="text-gray-800">
              {webhook.successfulDeliveries + webhook.failedDeliveries > 0
                ? `${(
                    (webhook.successfulDeliveries /
                      (webhook.successfulDeliveries + webhook.failedDeliveries)) *
                    100
                  ).toFixed(1)}%`
                : "N/A"}{" "}
              ({webhook.successfulDeliveries} / {webhook.successfulDeliveries + webhook.failedDeliveries})
            </span>
          </div>
        )}

        {webhook.secret && (
          <div>
            <span className="font-medium">Secret:</span>{" "}
            <span className="text-gray-800">Configured ✓</span>
          </div>
        )}
      </div>

      {testResult && (
        <div className="mt-3 p-3 rounded text-sm bg-green-50 border border-green-200">
          <p className="font-medium mb-1">Test Result: ✓ Success</p>
          <p className="text-xs text-gray-600">{testResult.message}</p>
          <p className="text-xs text-gray-500 mt-1">Delivery ID: {testResult.deliveryId}</p>
        </div>
      )}

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleTest}
          disabled={isTesting || !webhook.isActive}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTesting ? "Testing..." : "Test"}
        </button>

        {onUpdate && (
          <button
            onClick={() => onUpdate(webhook._id)}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
          >
            Edit
          </button>
        )}

        {onViewDetails && (
          <button
            onClick={() => onViewDetails(webhook._id)}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
          >
            View Deliveries
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="ml-auto px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

/**
 * Webhook List Component
 */
export function WebhookList({
  webhooks,
  onTest,
  onUpdate,
  onDelete,
  onViewDetails,
  emptyMessage = "No webhooks found.",
}: {
  webhooks: Webhook[];
  onTest: (webhookId: Id<"webhooks">) => Promise<TestWebhookResult>;
  onUpdate?: (webhookId: Id<"webhooks">) => void;
  onDelete: (webhookId: Id<"webhooks">) => Promise<void>;
  onViewDetails?: (webhookId: Id<"webhooks">) => void;
  emptyMessage?: string;
}) {
  if (webhooks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {webhooks.map((webhook) => (
        <WebhookCard
          key={webhook._id}
          webhook={webhook}
          onTest={onTest}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
