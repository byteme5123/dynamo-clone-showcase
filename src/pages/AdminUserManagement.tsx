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
  DollarSign,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();

  // Note: We can't delete auth.users directly, this is just for reference
  // In a real scenario, you'd need to use Supabase's admin API or RLS policies
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // This would need to be handled via a Supabase admin function
      // For now, we'll just show a message
      throw new Error('User deletion must be handled through Supabase admin functions');
    },
    onSuccess: () => {
      toast({
        title: 'User Deleted',
        description: 'User has been successfully deleted.',
      });
      refetch();
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete user.',
        variant: 'destructive'
      });
    },
  });

  // Fetch all users with their profiles
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      // Get profiles only (orders and transactions will be fetched separately)
      let query = supabase
        .from('profiles')
        .select('*');

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      // For each profile, get orders and transactions count
      const usersWithCounts = await Promise.all(
        (data || []).map(async (profile) => {
          const [ordersResult, transactionsResult] = await Promise.all([
            supabase.from('orders').select('id', { count: 'exact' }).eq('user_id', profile.id),
            supabase.from('transactions').select('id', { count: 'exact' }).eq('user_id', profile.id)
          ]);

          return {
            ...profile,
            ordersCount: ordersResult.count || 0,
            transactionsCount: transactionsResult.count || 0
          };
        })
      );

      return usersWithCounts;
    },
  });

  // Get detailed user info with orders and transactions
  const { data: selectedUserDetails, isLoading: userDetailsLoading } = useQuery({
    queryKey: ['user-details', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return null;

      // Get profile, orders, and transactions separately
      const [profileResult, ordersResult, transactionsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', selectedUser.id).single(),
        supabase.from('orders').select('*').eq('user_id', selectedUser.id).order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').eq('user_id', selectedUser.id).order('created_at', { ascending: false })
      ]);

      if (profileResult.error) throw profileResult.error;

      return {
        profile: profileResult.data,
        orders: ordersResult.data || [],
        transactions: transactionsResult.data || []
      };
    },
    enabled: !!selectedUser?.id,
  });

  const filteredUsers = users?.filter(user => 
    searchTerm === '' || 
    (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      paid: 'default',
      cancelled: 'destructive',
      active: 'default',
      inactive: 'secondary',
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading users: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, orders, and transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Users ({filteredUsers.length})</span>
              </CardTitle>
              <CardDescription>
                Click on a user to view detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedUser?.id === user.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {user.id.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {user.ordersCount || 0} orders
                        </Badge>
                        <Badge variant="secondary">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No users found matching your search' : 'No users found'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        <div>
          {selectedUser ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>User Details</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the user account and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(selectedUser.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete User
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userDetailsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : selectedUserDetails ? (
                  <Tabs defaultValue="info" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="info">Info</TabsTrigger>
                      <TabsTrigger value="orders">Orders</TabsTrigger>
                      <TabsTrigger value="payments">Payments</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                          <p>{selectedUserDetails.profile.first_name} {selectedUserDetails.profile.last_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">User ID</p>
                          <p className="font-mono text-sm">{selectedUser.id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Joined</p>
                          <p>{new Date(selectedUserDetails.profile.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                          <p>{new Date(selectedUserDetails.profile.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="orders" className="space-y-4">
                      {selectedUserDetails.orders?.length > 0 ? (
                        <div className="space-y-2">
                          {selectedUserDetails.orders.map((order: any) => (
                            <div key={order.id} className="border rounded p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">#{order.id.slice(0, 8)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    ${order.amount} {order.currency}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                {getStatusBadge(order.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No orders found</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="payments" className="space-y-4">
                      {selectedUserDetails.transactions?.length > 0 ? (
                        <div className="space-y-2">
                          {selectedUserDetails.transactions.map((transaction: any) => (
                            <div key={transaction.id} className="border rounded p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">#{transaction.id.slice(0, 8)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    ${transaction.amount} {transaction.currency}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(transaction.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                {getStatusBadge(transaction.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No transactions found</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Failed to load user details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a user to view detailed information
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;