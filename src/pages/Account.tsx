import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User, CreditCard, Package, Settings, LogOut, Loader2, RefreshCw, Key, Home, Calendar, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { PasswordResetForm } from '@/components/PasswordResetForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RenewPaymentModal } from '@/components/RenewPaymentModal';

const Account = () => {
  const { user, userProfile, isAuthenticated, signOut, refreshUserData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
  });

  // Update profile data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
      });
    }
  }, [userProfile]);

  // Fetch user's current active plan
  const { data: currentPlan, isLoading: planLoading, refetch: refetchPlan } = useQuery({
    queryKey: ['current-plan', userProfile?.current_plan_id],
    queryFn: async () => {
      if (!userProfile?.current_plan_id) return null;
      
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', userProfile.current_plan_id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.current_plan_id,
  });

  // Fetch user's orders with proper caching
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          plan:plans(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user's transactions
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['user-transactions', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          plan:plans(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Listen for PayPal messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'PAYPAL_PAYMENT_SUCCESS') {
        console.log('Payment success message received:', event.data);
        // Refresh orders, transactions, and plan
        refetchPlan();
        refetchOrders();
        refetchTransactions();
        refreshUserData();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refetchPlan, refetchOrders, refetchTransactions, refreshUserData]);

  // Handle payment success from URL callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success') === 'true') {
      console.log('Payment success detected from URL');
      
      // Show success toast with enhanced message
      toast({
        title: '🎉 Welcome back!',
        description: 'Your payment has been processed successfully. Your new plan is now active and ready to use!',
      });
      
      // Refresh data to show the new purchase
      setTimeout(() => {
        refetchPlan();
        refetchOrders();
        refetchTransactions();
        refreshUserData();
      }, 500);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refetchPlan, refetchOrders, refetchTransactions, refreshUserData, toast]);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshUserData(),
        refetchPlan(),
        refetchOrders(),
        refetchTransactions(),
        queryClient.invalidateQueries({ queryKey: ['current-plan'] }),
        queryClient.invalidateQueries({ queryKey: ['user-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['user-transactions'] }),
      ]);
      
      toast({
        title: 'Data Refreshed',
        description: 'Your account information has been updated.',
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh account data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      await refreshUserData();
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Calculate plan status based on expiry date
  const calculatePlanStatus = () => {
    if (!userProfile?.plan_expiry_date) return null;
    
    const now = new Date();
    const expiryDate = new Date(userProfile.plan_expiry_date);
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: 'active' | 'expired' | 'expiring_soon' = 'active';
    
    if (daysRemaining < 0) {
      status = 'expired';
    } else if (daysRemaining <= 7) {
      status = 'expiring_soon';
    }
    
    return {
      status,
      daysRemaining: Math.max(0, daysRemaining),
      expiryDate: userProfile.plan_expiry_date,
    };
  };

  const planStatus = calculatePlanStatus();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      paid: 'default',
      cancelled: 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getPlanStatusBadge = (status: 'active' | 'expired' | 'expiring_soon') => {
    const config = {
      active: { variant: 'default' as const, label: 'Active', className: 'bg-green-600' },
      expiring_soon: { variant: 'secondary' as const, label: 'Expiring Soon', className: 'bg-orange-500 text-white' },
      expired: { variant: 'destructive' as const, label: 'Expired', className: 'bg-red-600' },
    };
    
    const { variant, label, className } = config[status];
    
    return (
      <Badge variant={variant} className={className}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-sm text-muted-foreground">
            Account since {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            asChild
            variant="outline"
            size="sm"
          >
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
          <Button 
            onClick={refreshData} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>My Plans</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Payment History</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          first_name: e.target.value
                        }))}
                        disabled={isUpdating}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          last_name: e.target.value
                        }))}
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                      />
                      <Badge 
                        variant={user?.email_confirmed_at ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {user?.email_confirmed_at ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isUpdating}
                    className="w-full"
                  >
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Reset Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Password</span>
                </CardTitle>
                <CardDescription>
                  Reset your account password
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showPasswordReset ? (
                  <Button
                    onClick={() => setShowPasswordReset(true)}
                    variant="outline"
                  >
                    Reset Password
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <PasswordResetForm />
                    <Button
                      onClick={() => setShowPasswordReset(false)}
                      variant="ghost"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <div className="space-y-6">
            {/* Recent Payment Success Banner */}
            {transactions && transactions.some(txn => 
              txn.status === 'completed' && 
              new Date(txn.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
            ) && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🎉</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Payment Successful!
                    </h3>
                    <p className="text-green-700 mb-3">
                      Your payment has been processed and your plan is now active. A confirmation email with invoice has been sent to your registered email address.
                    </p>
                    <div className="flex flex-wrap gap-2">
                       <Link to="/activate">
                        <Button size="sm" variant="default">
                          Activate SIM Card
                        </Button>
                      </Link>
                      <Link to="/plans">
                        <Button size="sm" variant="outline">
                          Browse More Plans
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Current Active Plan */}
            {currentPlan && userProfile?.current_plan_id ? (
              <Card className="border-2 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Current Plan</CardTitle>
                      <CardDescription>Your subscription details</CardDescription>
                    </div>
                    {planStatus && getPlanStatusBadge(planStatus.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Expiry Alert */}
                  {planStatus && (planStatus.status === 'expired' || planStatus.status === 'expiring_soon') && (
                    <div className={`rounded-lg p-4 flex items-start space-x-3 ${
                      planStatus.status === 'expired' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-orange-50 border border-orange-200'
                    }`}>
                      {planStatus.status === 'expired' ? (
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          planStatus.status === 'expired' ? 'text-red-900' : 'text-orange-900'
                        }`}>
                          {planStatus.status === 'expired' 
                            ? 'Your plan has expired' 
                            : `Your plan expires in ${planStatus.daysRemaining} day${planStatus.daysRemaining !== 1 ? 's' : ''}`
                          }
                        </p>
                        <p className={`text-sm mt-1 ${
                          planStatus.status === 'expired' ? 'text-red-700' : 'text-orange-700'
                        }`}>
                          {planStatus.status === 'expired'
                            ? 'Renew your plan to continue enjoying uninterrupted service.'
                            : 'Renew now to avoid service interruption.'
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Plan Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Plan Name</p>
                      </div>
                      <p className="font-semibold text-xl">{currentPlan.name}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Price</p>
                      </div>
                      <p className="font-semibold text-xl">
                        ${currentPlan.price} {currentPlan.currency?.toUpperCase() || 'USD'}
                      </p>
                    </div>

                    {userProfile.plan_purchase_date && (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Purchase Date</p>
                        </div>
                        <p className="font-medium">
                          {new Date(userProfile.plan_purchase_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}

                    {userProfile.plan_expiry_date && (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Expiry Date</p>
                        </div>
                        <p className="font-medium">
                          {new Date(userProfile.plan_expiry_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}

                    {currentPlan.data_limit && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Data Limit</p>
                        <p className="font-medium">{currentPlan.data_limit}</p>
                      </div>
                    )}
                    
                    {currentPlan.validity_days && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Validity</p>
                        <p className="font-medium">{currentPlan.validity_days} days</p>
                      </div>
                    )}
                  </div>

                  {/* Plan Features */}
                  {currentPlan.features && Array.isArray(currentPlan.features) && currentPlan.features.length > 0 && (
                    <div className="pt-4 border-t space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground">Plan Features</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {currentPlan.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentPlan.description && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Plan Details</p>
                      <p className="text-sm">{currentPlan.description}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    {planStatus && (planStatus.status === 'expired' || planStatus.status === 'expiring_soon') && (
                      <Button
                        onClick={() => setShowRenewModal(true)}
                        className="flex-1"
                        size="lg"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Renew Plan Now
                      </Button>
                    )}
                    <Button
                      onClick={() => navigate('/plans')}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Browse More Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No Active Plan</h3>
                      <p className="text-muted-foreground text-sm">
                        You don't have an active plan yet. Browse our plans to get started.
                      </p>
                    </div>
                    <Button onClick={() => navigate('/plans')} size="lg">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Browse Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Purchase History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Purchase History</span>
                </CardTitle>
                <CardDescription>
                  Complete history of all your plan purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : transactions && transactions.filter(txn => txn.status === 'completed').length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 text-sm font-semibold">Plan</th>
                          <th className="text-left p-3 text-sm font-semibold">Amount</th>
                          <th className="text-left p-3 text-sm font-semibold">Purchase Date</th>
                          <th className="text-left p-3 text-sm font-semibold hidden md:table-cell">Transaction ID</th>
                          <th className="text-left p-3 text-sm font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.filter(txn => txn.status === 'completed').map((txn) => {
                          const isRecent = new Date(txn.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000;
                          return (
                            <tr 
                              key={txn.id} 
                              className={`border-b hover:bg-muted/50 transition-colors ${
                                isRecent ? 'bg-green-50' : ''
                              }`}
                            >
                              <td className="p-3">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{txn.plan?.name || 'Unknown Plan'}</span>
                                  {isRecent && (
                                    <Badge variant="default" className="bg-green-600 text-white text-xs">
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="font-semibold">
                                  ${txn.amount} {txn.currency?.toUpperCase() || 'USD'}
                                </span>
                              </td>
                              <td className="p-3 text-sm">
                                {new Date(txn.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                              <td className="p-3 text-sm hidden md:table-cell">
                                {txn.paypal_transaction_id ? (
                                  <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {txn.paypal_transaction_id.slice(0, 16)}...
                                  </code>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="p-3">
                                <Badge variant="default" className="bg-green-600">
                                  Completed
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No plan history available</h3>
                      <p className="text-muted-foreground text-sm">
                        You haven't purchased any plans yet.
                      </p>
                    </div>
                    <Button onClick={() => navigate('/plans')} variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Browse Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                All your payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            Transaction #{transaction.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${transaction.amount} {transaction.currency?.toUpperCase() || 'USD'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                          {transaction.paypal_transaction_id && (
                            <p className="text-xs text-muted-foreground">
                              PayPal ID: {transaction.paypal_transaction_id}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payment history found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Renew Payment Modal */}
      {showRenewModal && currentPlan && (
        <RenewPaymentModal
          plan={{
            id: currentPlan.id,
            name: currentPlan.name,
            price: currentPlan.price,
            validity_days: currentPlan.validity_days
          }}
          onClose={() => setShowRenewModal(false)}
        />
      )}
    </div>
  );
};

const ProtectedAccount = () => (
  <ProtectedRoute>
    <Account />
  </ProtectedRoute>
);

export default ProtectedAccount;