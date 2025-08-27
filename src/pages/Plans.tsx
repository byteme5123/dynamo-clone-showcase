
import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePlans } from '@/hooks/usePlans';
import { Skeleton } from '@/components/ui/skeleton';
import NotificationBar from '@/components/NotificationBar';
import Navbar from '@/components/Navbar';
import FigmaFooter from '@/components/FigmaFooter';
import PlanCard from '@/components/PlanCard';
import PlanFilter from '@/components/PlanFilter';
import SupabaseTest from '@/components/SupabaseTest';
import { filterPlansByType } from '@/utils/planFilters';
import { Button } from '@/components/ui/button';

type PlanType = 'domestic' | 'special';

const Plans = () => {
  const { t } = useTranslation();
  const { data: plans, isLoading, error, refetch, isError, isPending, isFetching } = usePlans();
  const [activeTab, setActiveTab] = useState<PlanType>('domestic');
  const [showDebug, setShowDebug] = useState(false);

  // Enhanced logging for debugging
  console.log('=== PLANS PAGE DEBUG ===');
  console.log('📊 Plans query status:', {
    isLoading,
    isPending,
    isFetching,
    isError,
    error,
    plans: plans?.length || 0,
    plansData: plans
  });

  // Filter plans based on active tab
  const filteredPlans = filterPlansByType(plans || [], activeTab);
  
  console.log('🔍 Filtered plans:', {
    activeTab,
    filteredCount: filteredPlans?.length || 0,
    filteredPlans
  });

  // Manual refresh function
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refetch();
  };

  // Show loading state
  if (isLoading || isPending) {
    console.log('⏳ Showing loading state');
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
            
            {/* Debug Section */}
            <div className="mb-8">
              <Button onClick={() => setShowDebug(!showDebug)} variant="outline" size="sm">
                {showDebug ? 'Hide Debug' : 'Show Debug'}
              </Button>
              {showDebug && (
                <div className="mt-4 space-y-4">
                  <SupabaseTest />
                  <div className="text-left text-sm bg-muted p-4 rounded">
                    <p><strong>Loading State:</strong> {isLoading ? 'Yes' : 'No'}</p>
                    <p><strong>Pending State:</strong> {isPending ? 'Yes' : 'No'}</p>
                    <p><strong>Fetching State:</strong> {isFetching ? 'Yes' : 'No'}</p>
                    <p><strong>Error State:</strong> {isError ? 'Yes' : 'No'}</p>
                    <p><strong>Error:</strong> {error?.message || 'None'}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <Button onClick={handleRefresh} variant="outline">
                Refresh Plans
              </Button>
            </div>
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
        <FigmaFooter />
      </div>
    );
  }

  // Show error state
  if (isError || error) {
    console.error('❌ Plans page error:', error);
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--plans-background))' }}>
        <NotificationBar />
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-[34px] font-bold font-poppins text-foreground mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-base text-destructive mb-4">
              Error loading plans: {error?.message || 'Unknown error'}
            </p>
            
            {/* Debug Section */}
            <div className="mb-8">
              <Button onClick={() => setShowDebug(!showDebug)} variant="outline" size="sm">
                {showDebug ? 'Hide Debug' : 'Show Debug'}
              </Button>
              {showDebug && (
                <div className="mt-4">
                  <SupabaseTest />
                </div>
              )}
            </div>
            
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
        <FigmaFooter />
      </div>
    );
  }

  console.log('✅ Rendering plans page with data');

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
          
          {isFetching && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Refreshing plans...</p>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 max-w-7xl mx-auto">
          {filteredPlans && filteredPlans.length > 0 ? (
            filteredPlans.slice(0, 6).map((plan, index) => (
              <div 
                key={`${plan.id}-${index}`} 
                className="flex justify-center items-start mb-6 lg:mb-8"
              >
                <PlanCard plan={plan} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                {activeTab === 'special' 
                  ? 'No special plans available at the moment.' 
                  : 'No plans available at the moment.'
                }
              </p>
              <Button onClick={handleRefresh} variant="outline">
                Refresh Plans
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <FigmaFooter />
    </div>
  );
};

export default Plans;
