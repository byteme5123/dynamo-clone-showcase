import React, { useEffect, useState } from 'react';
import { X, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanExpiryModalProps {
  plan: {
    planName: string;
    expiryDate: string;
    status: 'expired' | 'expiring_soon';
    daysRemaining: number;
  };
  onClose: () => void;
}

export function PlanExpiryModal({ plan, onClose }: PlanExpiryModalProps) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowModal(true), 100);
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setTimeout(onClose, 300);
  };

  const handleRenew = () => {
    handleClose();
    window.location.href = '/plans';
  };

  const isExpired = plan.status === 'expired';
  const expiryDate = new Date(plan.expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        showModal ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-background rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 ${
          showModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isExpired ? 'bg-red-100' : 'bg-orange-100'
          }`}>
            {isExpired ? (
              <AlertCircle className="h-8 w-8 text-red-600" />
            ) : (
              <Clock className="h-8 w-8 text-orange-600" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-bold text-center mb-2 ${
          isExpired ? 'text-red-600' : 'text-orange-600'
        }`}>
          {isExpired ? 'Your Plan Has Expired' : 'Your Plan is Expiring Soon'}
        </h2>

        {/* Message */}
        <div className="text-center mb-6 space-y-2">
          <p className="text-muted-foreground">
            Your <span className="font-semibold text-foreground">{plan.planName}</span> plan 
            {isExpired ? ' expired on ' : ' will expire on '}
            <span className="font-semibold text-foreground">{expiryDate}</span>
          </p>
          
          {!isExpired && (
            <p className="text-lg font-semibold text-orange-600">
              Only {plan.daysRemaining} day{plan.daysRemaining !== 1 ? 's' : ''} remaining!
            </p>
          )}

          <p className="text-sm text-muted-foreground mt-4">
            {isExpired 
              ? 'Renew your plan now to continue enjoying uninterrupted service.'
              : 'Renew your plan now to avoid service interruption.'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleRenew}
            className="w-full"
            size="lg"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Renew Plan Now
          </Button>
          
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Remind Me Later
          </Button>
        </div>
      </div>
    </div>
  );
}
