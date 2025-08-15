export const filterPlansByType = (plans: any[], activeTab: 'domestic' | 'special') => {
  return plans?.filter(plan => plan.plan_type === activeTab) || [];
};