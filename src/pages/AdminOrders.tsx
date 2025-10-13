import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  Trash2,
  CheckCircle,
  XCircle,
  ShoppingCart,
  DollarSign,
  Users as UsersIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExportExcelButton } from '@/components/admin/ExportExcelButton';
import { UserDetailsModal } from '@/components/admin/UserDetailsModal';

interface User {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  orders: Order[];
  totalSpent: number;
}

interface Order {
  id: string;
  plan_name: string;
  amount: number;
  currency: string;
  created_at: string;
  status: string;
  transaction_id: string;
}

export default function AdminOrders() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, filterVerified, dateRange]);

  const fetchUsers = async () => {
    try {
      // Fetch auth users using admin API
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      // Map auth users to our User interface
      const usersWithOrders = (authUsers || []).map((authUser: any) => {
        return {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Unknown',
          email: authUser.email || '',
          email_verified: authUser.email_confirmed_at ? true : false,
          created_at: authUser.created_at,
          orders: [], // Will be populated when payment_transactions table is available
          totalSpent: 0
        };
      });

      setUsers(usersWithOrders);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users and orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterVerified !== 'all') {
      filtered = filtered.filter(user =>
        filterVerified === 'verified' ? user.email_verified : !user.email_verified
      );
    }

    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(user => {
        const signupDate = new Date(user.created_at);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        return signupDate >= fromDate && signupDate <= toDate;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string, isVerified: boolean) => {
    if (isVerified) {
      toast({
        title: 'Cannot Delete',
        description: 'Cannot delete verified users!',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this unverified user?')) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== userId));
      toast({
        title: 'Success',
        description: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  const calculateTotalRevenue = () => {
    return filteredUsers.reduce((total, user) => total + user.totalSpent, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, orders, and export financial reports
          </p>
        </div>

        <ExportExcelButton 
          users={filteredUsers}
          dateRange={dateRange}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold text-foreground mt-2">{filteredUsers.length}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Verified Users</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {filteredUsers.filter(u => u.email_verified).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-3xl font-bold text-primary mt-2">
                {filteredUsers.reduce((sum, u) => sum + u.orders.length, 0)}
              </p>
            </div>
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-primary mt-2">
                ${calculateTotalRevenue().toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value as any)}
            className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>

          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="From Date"
          />

          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="To Date"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Signup Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.email_verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {user.orders.length}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      ${user.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!user.email_verified && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email_verified)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
