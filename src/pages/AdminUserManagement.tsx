import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Search, 
  Filter, 
  Eye, 
  CreditCard, 
  Package, 
  Loader2,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();

  // Fetch all users with their orders and transactions
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select(`
          *,
          orders (
            id,
            amount,
            currency,
            status,
            created_at,
            plans (
              name,
              description
            )
          ),
          transactions (
            id,
            amount,
            currency,
            status,
            created_at,
            payment_method
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const [usersResult, ordersResult, transactionsResult] = await Promise.all([
        supabase.from('users').select('id, email_verified, created_at', { count: 'exact' }),
        supabase.from('orders').select('id, status, amount', { count: 'exact' }),
        supabase.from('transactions').select('id, status, amount', { count: 'exact' }),
      ]);

      const totalUsers = usersResult.count || 0;
      const verifiedUsers = usersResult.data?.filter(u => u.email_verified).length || 0;
      const newUsersThisMonth = usersResult.data?.filter(u => {
        const userDate = new Date(u.created_at);
        const now = new Date();
        return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
      }).length || 0;

      const totalOrders = ordersResult.count || 0;
      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

      return {
        totalUsers,
        verifiedUsers,
        newUsersThisMonth,
        totalOrders,
        totalRevenue,
      };
    },
  });

  const calculateUserStats = (user: any) => {
    const orders = user.orders || [];
    const transactions = user.transactions || [];

    const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.amount || 0), 0);
    const completedOrders = orders.filter((order: any) => order.status === 'paid').length;
    const activeOrders = orders.filter((order: any) => order.status === 'paid');

    return {
      totalSpent,
      completedOrders,
      activeOrders: activeOrders.length,
    };
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, view their plans, and track payment history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.verifiedUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.newUsersThisMonth || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(userStats?.totalRevenue || 0).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Search</CardTitle>
          <CardDescription>Search users by name or email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users?.length || 0})</CardTitle>
            <CardDescription>Click on a user to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {users?.map((user) => {
                const stats = calculateUserStats(user);
                return (
                  <div 
                    key={user.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                      selectedUser?.id === user.id ? 'bg-muted border-primary' : ''
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">
                          {user.first_name} {user.last_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        {user.email_verified ? (
                          <Badge variant="default">Verified</Badge>
                        ) : (
                          <Badge variant="destructive">Unverified</Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{stats.completedOrders} orders</span>
                      <span>${stats.totalSpent.toFixed(2)} spent</span>
                      <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
              {!users?.length && (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Details */}
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>
              {selectedUser ? 'View detailed information and activity' : 'Select a user to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <p className="text-sm">{selectedUser.first_name} {selectedUser.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <div>
                        {selectedUser.email_verified ? (
                          <Badge variant="default">Verified</Badge>
                        ) : (
                          <Badge variant="destructive">Unverified</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Joined</label>
                      <p className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{calculateUserStats(selectedUser).completedOrders}</div>
                      <div className="text-sm text-muted-foreground">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">${calculateUserStats(selectedUser).totalSpent.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{calculateUserStats(selectedUser).activeOrders}</div>
                      <div className="text-sm text-muted-foreground">Active Plans</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedUser.orders?.map((order: any) => (
                      <div key={order.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{order.plans?.name || 'Plan'}</h5>
                            <p className="text-sm text-muted-foreground">
                              Order #{order.id.slice(0, 8)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${order.amount}</p>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {!selectedUser.orders?.length && (
                      <div className="text-center py-4">
                        <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">No orders found</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedUser.transactions?.map((transaction: any) => (
                      <div key={transaction.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">Payment #{transaction.id.slice(0, 8)}</h5>
                            <p className="text-sm text-muted-foreground">
                              {transaction.payment_method || 'PayPal'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${transaction.amount}</p>
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {!selectedUser.transactions?.length && (
                      <div className="text-center py-4">
                        <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">No transactions found</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Select a user to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserManagement;