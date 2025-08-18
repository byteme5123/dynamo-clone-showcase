
import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePlans } from '@/hooks/usePlans';
import { Skeleton } from '@/components/ui/skeleton';
import NotificationBar from '@/components/NotificationBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PlanCard from '@/components/PlanCard';
import PlanFilter from '@/components/PlanFilter';
import { filterPlansByType } from '@/utils/planFilters';

type PlanType = 'domestic' | 'special';

const Plans = () => {
  const { t } = useTranslation();
  const { data: plans, isLoading, error } = usePlans();
  const [activeTab, setActiveTab] = useState<PlanType>('domestic');

  console.log('Plans page: plans data:', plans);
  console.log('Plans page: isLoading:', isLoading);
  console.log('Plans page: error:', error);

  // Filter plans based on active tab
  const filteredPlans = filterPlansByType(plans || [], activeTab);
  
  console.log('Plans page: filteredPlans:', filteredPlans);
  console.log('Plans page: activeTab:', activeTab);
  console.log('Plans page: filteredPlans length:', filteredPlans?.length);

  // Show loading state when data is loading OR when we have no filtered plans yet
  if (isLoading || (!plans && !error)) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--plans-background))' }}>
        <NotificationBar />
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-[34px] font-bold font-poppins text-foreground mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-muted-foreground text-base mb-8">
              Get more data for less with our flexible plans. No contracts, no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 shadow-lg max-w-[280px] mx-auto">
                <Skeleton className="w-full h-72 mb-4 rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    console.error('Plans page: Error loading plans:', error);
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--plans-background))' }}>
        <NotificationBar />
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-[34px] font-bold font-poppins text-foreground mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-base text-destructive">
              Error loading plans. Please try again later.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--plans-background))' }}>
      <NotificationBar />
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-[34px] font-bold font-poppins text-foreground mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-muted-foreground text-base mb-8">
            Get more data for less with our flexible plans. No contracts, no hidden fees.
          </p>

          {/* Plan Type Toggle */}
          <PlanFilter activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto">
          {filteredPlans && filteredPlans.length > 0 ? (
            filteredPlans.slice(0, 6).map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                {activeTab === 'special' 
                  ? 'No special plans available at the moment.' 
                  : 'No plans available at the moment.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Plans;
