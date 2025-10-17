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
      // TEST MODE - Use real plan ID from user's profile
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3); // 3 days from now
      
      // Use the actual plan ID from user profile if available
      const testPlanId = userProfile?.current_plan_id || '0a4a8e95-2e69-47b2-aa51-0d6796860fbe';
      
      setPlanData({
        planName: 'Premium Unlimited Plan',
        planId: testPlanId,
        planPrice: 49.99,
        expiryDate: tomorrow.toISOString(),
        status: 'expiring_soon',
        daysRemaining: 3,
      });
      setShowModal(true);
      
      // ORIGINAL CODE COMMENTED FOR TESTING
      // const lastShown = localStorage.getItem('planExpiryModalShown');
      // const today = new Date().toDateString();
      // if (lastShown === today) return;
      // if (!userProfile?.plan_expiry_date || !userProfile?.current_plan_id) return;
      // const now = new Date();
      // const expiryDate = new Date(userProfile.plan_expiry_date);
      // const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      // let status: 'active' | 'expired' | 'expiring_soon' = 'active';
      // if (daysRemaining < 0) {
      //   status = 'expired';
      // } else if (daysRemaining <= 7) {
      //   status = 'expiring_soon';
      // }
      // if (status === 'expired' || status === 'expiring_soon') {
      //   setPlanData({
      //     planName: 'Your Current Plan',
      //     expiryDate: userProfile.plan_expiry_date,
      //     status,
      //     daysRemaining: Math.max(0, daysRemaining),
      //     planId: userProfile.current_plan_id,
      //   });
      //   setShowModal(true);
      //   localStorage.setItem('planExpiryModalShown', today);
      // }
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
