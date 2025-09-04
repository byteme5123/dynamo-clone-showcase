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
import { Navigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { PasswordResetForm } from '@/components/PasswordResetForm';

const Account = () => {
  const { user, isAuthenticated, signOut, refreshUserData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch user's orders with proper caching
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['user-orders', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          plans (
            name,
            description,
            price,
            currency
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds for faster updates
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: true, // Enable refetch on focus
  });

  // Fetch user's transactions with proper caching
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['user-transactions', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          plans (
            name,
            price,
            currency
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds for faster updates
    gcTime: 10 * 60 * 1000, // 10 minutes  
    retry: 2,
    refetchOnWindowFocus: true, // Enable refetch on focus
  });

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Refresh user context data and queries simultaneously
      await Promise.all([
        refreshUserData(),
        refetchOrders(),
        refetchTransactions(),
      ]);
      
      toast({
        title: "Data Refreshed",
        description: "Your account data has been refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle payment success return and setup real-time updates
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success') === 'true') {
      // Clear the parameter
      window.history.replaceState({}, '', '/account');
      // Silent refresh without toast notification
      Promise.all([
        refreshUserData(),
        queryClient.invalidateQueries({ queryKey: ['user-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['user-transactions'] })
      ]).catch(console.error);
    }

    // Listen for PayPal popup messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PAYPAL_SUCCESS') {
        // Invalidate and refetch all user data
        queryClient.invalidateQueries({ queryKey: ['user-orders'] });
        queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
        refreshUserData();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient, refreshUserData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh user data in context immediately after update
      await refreshUserData();

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed Out',
      description: 'You have been signed out successfully.',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      paid: 'default',
      pending: 'secondary',
      failed: 'destructive',
      completed: 'default',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
              <p className="text-muted-foreground">
                Welcome back, {user.first_name || user.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={refreshData}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              <Link to="/">
                <Button variant="outline">← Back to Home</Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>My Plans</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Order History</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Payment History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and email preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profileData.first_name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, first_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, last_name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowPasswordReset(!showPasswordReset)}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      {showPasswordReset ? 'Cancel' : 'Change Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {showPasswordReset && (
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    We'll send a password reset link to your email address
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordResetForm />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Email Verification</span>
                  {user.email_verified ? (
                    <Badge variant="default">Verified</Badge>
                  ) : (
                    <Badge variant="destructive">Unverified</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Account Created</span>
                  <span className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plans</CardTitle>
                <CardDescription>
                  View and manage your active mobile plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : orders?.filter(order => order.status === 'paid').length ? (
                  <div className="space-y-4">
                    {orders
                      .filter(order => order.status === 'paid')
                      .map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{order.plans?.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {order.plans?.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {order.plans?.currency?.toUpperCase()} {order.plans?.price}
                              </p>
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Purchased on {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No active plans found</p>
                    <Link to="/plans">
                      <Button className="mt-4">Browse Plans</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View all your past orders and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : orders?.length ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">
                              Order #{order.id.slice(0, 8)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {order.plans?.name || 'Plan'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {order.currency?.toUpperCase()} {order.amount}
                            </p>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Ordered: {new Date(order.created_at).toLocaleDateString()}</span>
                          {order.paypal_order_id && (
                            <span>PayPal ID: {order.paypal_order_id.slice(0, 12)}...</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No orders found</p>
                    <Link to="/plans">
                      <Button className="mt-4">Start Shopping</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  View all your payment transactions and receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : transactions?.length ? (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">
                              Transaction #{transaction.id.slice(0, 8)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {transaction.plans?.name || 'Payment'}
                            </p>
                          </div>  
                          <div className="text-right">
                            <p className="font-semibold">
                              {transaction.currency?.toUpperCase()} {transaction.amount}
                            </p>
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Date: {new Date(transaction.created_at).toLocaleDateString()}</span>
                          <span>Method: {transaction.payment_method || 'PayPal'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No payment history found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;