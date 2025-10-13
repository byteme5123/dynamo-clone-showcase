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
import { User, CreditCard, Package, Settings, LogOut, Loader2, RefreshCw, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { PasswordResetForm } from '@/components/PasswordResetForm';
import ProtectedRoute from '@/components/ProtectedRoute';

const Account = () => {
  const { user, userProfile, isAuthenticated, signOut, refreshUserData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
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
          <div className="space-y-4">
            {/* Recent Payment Success Banner */}
            {transactions && transactions.some(txn => 
              txn.status === 'completed' && 
              new Date(txn.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
            ) && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
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
            {userProfile?.plan_status === 'active' && currentPlan && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Current Active Plan</CardTitle>
                      <CardDescription>Your subscription details</CardDescription>
                    </div>
                    <Badge variant="default" className="text-sm">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Plan Name</p>
                      <p className="font-semibold text-lg">{currentPlan.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
                      <p className="font-semibold text-lg">
                        ${currentPlan.price} {currentPlan.currency?.toUpperCase() || 'USD'}
                      </p>
                    </div>
                    {currentPlan.data_limit && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Data Limit</p>
                        <p className="font-medium">{currentPlan.data_limit}</p>
                      </div>
                    )}
                    {currentPlan.validity_days && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Validity</p>
                        <p className="font-medium">{currentPlan.validity_days} days</p>
                      </div>
                    )}
                    {userProfile.plan_purchase_date && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Purchase Date</p>
                        <p className="font-medium">
                          {new Date(userProfile.plan_purchase_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {userProfile.plan_expiry_date && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Expiry Date</p>
                        <p className="font-medium">
                          {new Date(userProfile.plan_expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  {currentPlan.description && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Plan Details</p>
                      <p className="text-sm">{currentPlan.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>
                All your purchases and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
          {transactionsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.filter(txn => txn.status === 'completed').map((txn) => {
                    const isRecent = new Date(txn.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000;
                    return (
                      <div 
                        key={txn.id} 
                        className={`border rounded-lg p-4 ${isRecent ? 'border-green-200 bg-green-50' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium">
                                {txn.plan?.name || 'Unknown Plan'}
                              </p>
                              {isRecent && (
                                <Badge variant="default" className="bg-green-600 text-white text-xs">
                                  NEW
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Amount: </span>
                                <span className="font-medium">
                                  ${txn.amount} {txn.currency?.toUpperCase() || 'USD'}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date: </span>
                                <span>{new Date(txn.created_at).toLocaleDateString()}</span>
                              </div>
                              {txn.paypal_transaction_id && (
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Transaction ID: </span>
                                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                    {txn.paypal_transaction_id}
                                  </code>
                                </div>
                              )}
                            </div>
                            {isRecent && (
                              <div className="mt-2 p-2 bg-green-100 rounded text-sm text-green-800">
                                ✅ Payment completed successfully!
                              </div>
                            )}
                          </div>
                          {getStatusBadge(txn.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No purchases found</p>
                  <Link to="/plans">
                    <Button className="mt-4">Browse Plans</Button>
                  </Link>
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
    </div>
  );
};

const ProtectedAccount = () => (
  <ProtectedRoute>
    <Account />
  </ProtectedRoute>
);

export default ProtectedAccount;