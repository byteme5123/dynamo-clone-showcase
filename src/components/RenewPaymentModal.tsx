import { X, CreditCard, RefreshCw } from 'lucide-react';
import PayPalButton from './PayPalButton';

interface RenewPaymentModalProps {
  plan: {
    id: string;
    name: string;
    price: number;
    duration?: string;
    validity_days?: number;
  };
  onClose: () => void;
}

export function RenewPaymentModal({ plan, onClose }: RenewPaymentModalProps) {
  const formatDuration = () => {
    if (plan.duration) return plan.duration;
    if (plan.validity_days) {
      if (plan.validity_days === 30) return '30 days';
      if (plan.validity_days === 365) return '1 year';
      return `${plan.validity_days} days`;
    }
    return 'N/A';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-lg">
              <RefreshCw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Renew Plan</h2>
              <p className="text-sm text-muted-foreground">Complete your renewal payment</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plan Summary */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Plan:</span>
              <span className="font-semibold">{plan.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Duration:</span>
              <span className="font-semibold">{formatDuration()}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">${plan.price}</span>
            </div>
          </div>

          {/* Info Text */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 Your subscription will be extended from the current expiry date
            </p>
          </div>

          {/* PayPal Button */}
          <PayPalButton
            planId={plan.id}
            amount={plan.price}
            planName={plan.name}
            className="w-full"
          />

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full mt-3 px-6 py-3 border border-border hover:bg-muted rounded-lg transition font-medium"
          >
            Cancel
          </button>

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Secure payment processing via PayPal
          </p>
        </div>
      </div>
    </div>
  );
}
