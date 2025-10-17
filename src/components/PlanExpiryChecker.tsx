import React, { useEffect, useState } from 'react';
import { PlanExpiryModal } from './PlanExpiryModal';
import { useAuth } from '@/contexts/AuthContext';

export function PlanExpiryChecker() {
  const [planData, setPlanData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const { userProfile, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !userProfile) return;
    
    checkPlanExpiry();
  }, [isAuthenticated, userProfile]);

  const checkPlanExpiry = () => {
    try {
      if (!userProfile?.plan_expiry_date || !userProfile?.current_plan_id) return;
      
      const now = new Date();
      const expiryDate = new Date(userProfile.plan_expiry_date);
      const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: 'active' | 'expired' | 'expiring_soon' = 'active';
      if (daysRemaining < 0) {
        status = 'expired';
      } else if (daysRemaining <= 7) {
        status = 'expiring_soon';
      }
      
      // Show modal if plan is expired or expiring soon
      // Modal will reappear on every page load until renewed
      if (status === 'expired' || status === 'expiring_soon') {
        setPlanData({
          planName: 'Your Current Plan',
          planId: userProfile.current_plan_id,
          planPrice: 49.99, // This should come from the plan data
          expiryDate: userProfile.plan_expiry_date,
          status,
          daysRemaining: Math.max(0, daysRemaining),
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Failed to check plan expiry:', error);
    }
  };

  if (!showModal || !planData) return null;

  return (
    <PlanExpiryModal
      plan={planData}
      onClose={() => setShowModal(false)}
    />
  );
}
