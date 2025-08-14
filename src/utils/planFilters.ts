export const filterPlansByType = (plans: any[], activeTab: 'domestic' | 'special') => {
  return plans?.filter(plan => {
    if (activeTab === 'domestic') {
      return plan.plan_type === 'prepaid' || plan.plan_type === 'postpaid';
    } else {
      // For special plans, look for international or special keywords in name/features
      return plan.name.toLowerCase().includes('special') || 
             plan.name.toLowerCase().includes('international') ||
             plan.features?.some((f: string) => 
               f.toLowerCase().includes('international') || 
               f.toLowerCase().includes('special')
             );
    }
  }) || [];
};