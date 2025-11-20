// src/features/boilerplate/payments/providers/stripe-connect/components/CreateProductForm.tsx
/**
 * Create Product Form
 *
 * Form to create products and prices on connected accounts
 */

import { useState } from 'react';
import { Button, Input, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useStripeConnectProducts } from '../hooks/useStripeConnectProducts';

interface CreateProductFormProps {
  onSuccess?: (productId: string) => void;
  onCancel?: () => void;
}

/**
 * Form component for creating products on connected accounts
 *
 * @example
 * ```tsx
 * <CreateProductForm
 *   onSuccess={(id) => console.log('Created:', id)}
 *   onCancel={() => setShowForm(false)}
 * />
 * ```
 */
export function CreateProductForm({ onSuccess, onCancel }: CreateProductFormProps) {
  const { createProduct, isCreating, error } = useStripeConnectProducts();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'usd',
    billingType: 'one_time',
    recurringInterval: 'month',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert price to cents
    const priceInCents = Math.round(parseFloat(formData.price) * 100);

    if (isNaN(priceInCents) || priceInCents <= 0) {
      alert('Please enter a valid price');
      return;
    }

    const result = await createProduct({
      name: formData.name,
      description: formData.description,
      price: priceInCents,
      currency: formData.currency,
      recurring:
        formData.billingType === 'recurring'
          ? { interval: formData.recurringInterval as any }
          : undefined,
    });

    if (result.success && result.productId) {
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        currency: 'usd',
        billingType: 'one_time',
        recurringInterval: 'month',
      });

      if (onSuccess) {
        onSuccess(result.productId);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Premium Plan"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description of your product..."
              rows={3}
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="99.00"
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="gbp">GBP</SelectItem>
                  <SelectItem value="cad">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Billing Type */}
          <div>
            <label htmlFor="billingType" className="block text-sm font-medium text-gray-700 mb-1">
              Billing Type *
            </label>
            <Select value={formData.billingType} onValueChange={(value) => setFormData({ ...formData, billingType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_time">One-time Payment</SelectItem>
                <SelectItem value="recurring">Recurring Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recurring Interval (conditional) */}
          {formData.billingType === 'recurring' && (
            <div>
              <label htmlFor="recurringInterval" className="block text-sm font-medium text-gray-700 mb-1">
                Billing Interval
              </label>
              <Select value={formData.recurringInterval} onValueChange={(value) => setFormData({ ...formData, recurringInterval: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isCreating} className="flex-1">
              {isCreating ? 'Creating...' : 'Create Product'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
