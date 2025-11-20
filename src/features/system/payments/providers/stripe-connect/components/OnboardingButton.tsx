// src/features/system/payments/providers/stripe-connect/components/OnboardingButton.tsx
/**
 * Stripe Connect Onboarding Button
 *
 * Button to start or continue Stripe Connect account onboarding
 */

import { Button } from '@/components/ui';
import { useStripeConnectAccount } from '../hooks/useStripeConnectAccount';
import { useStripeConnectOnboarding } from '../hooks/useStripeConnectOnboarding';
import { ExternalLink } from 'lucide-react';

interface OnboardingButtonProps {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'md' | 'sm' | 'lg';
  className?: string;
  onSuccess?: () => void;
}

/**
 * Button component for Stripe Connect onboarding
 *
 * Automatically detects account state and shows appropriate action:
 * - No account: "Create Connected Account"
 * - Account exists but not onboarded: "Complete Onboarding"
 * - Account onboarded but restricted: "Update Account Information"
 *
 * @example
 * ```tsx
 * <OnboardingButton onSuccess={() => console.log('Onboarded!')} />
 * ```
 */
export function OnboardingButton({
  variant = 'primary',
  size = 'md',
  className,
  onSuccess,
}: OnboardingButtonProps) {
  const { exists, needsOnboarding, onboardingCompleted, isRestricted, account } =
    useStripeConnectAccount();
  const { createAccount, generateOnboardingLink, isCreating, error } = useStripeConnectOnboarding();

  const handleClick = async () => {
    let result;

    if (!exists) {
      // Create new account
      result = await createAccount({
        name: account?.clientName || 'My Business',
        email: account?.clientEmail || '',
      });
    } else {
      // Generate onboarding link for existing account
      result = await generateOnboardingLink();
    }

    if (result.success && result.url) {
      // Redirect to Stripe onboarding
      window.location.href = result.url;

      // Call success callback after a delay (user will be redirected)
      if (onSuccess) {
        setTimeout(onSuccess, 100);
      }
    } else if (result.error) {
      console.error('Onboarding error:', result.error);
    }
  };

  // Don't show button if account is fully set up and active
  if (onboardingCompleted && !isRestricted && !needsOnboarding) {
    return null;
  }

  // Determine button text
  let buttonText = 'Create Connected Account';
  if (exists && !onboardingCompleted) {
    buttonText = 'Complete Onboarding';
  } else if (isRestricted) {
    buttonText = 'Update Account Information';
  }

  return (
    <div>
      <Button
        onClick={handleClick}
        disabled={isCreating}
        variant={variant}
        size={size}
        className={className}
      >
        {isCreating ? (
          'Loading...'
        ) : (
          <>
            {buttonText}
            <ExternalLink className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
