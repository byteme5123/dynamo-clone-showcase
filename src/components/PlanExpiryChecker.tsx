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
      // Check if modal was already shown today
      const lastShown = localStorage.getItem('planExpiryModalShown');
      const today = new Date().toDateString();
      
      if (lastShown === today) return;

      // Check if user has a plan and expiry date
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

      // Show modal if expired or expiring soon
      if (status === 'expired' || status === 'expiring_soon') {
        setPlanData({
          planName: 'Your Current Plan',
          expiryDate: userProfile.plan_expiry_date,
          status,
          daysRemaining: Math.max(0, daysRemaining),
        });
        setShowModal(true);
        localStorage.setItem('planExpiryModalShown', today);
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
