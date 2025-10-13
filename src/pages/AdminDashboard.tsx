import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminPlans } from '@/hooks/usePlans';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Users, MessageSquare, FileText, Loader2, Package, HelpCircle, Star, DollarSign, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { data: plans } = useAdminPlans();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set up real-time subscriptions
  useEffect(() => {
    const ordersChannel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        console.log('Orders updated, refreshing dashboard...');
        setRefreshTrigger(prev => prev + 1);
      })
      .subscribe();

    const transactionsChannel = supabase
      .channel('dashboard-transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        console.log('Transactions updated, refreshing dashboard...');
        setRefreshTrigger(prev => prev + 1);
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('dashboard-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        console.log('Profiles updated, refreshing dashboard...');
        setRefreshTrigger(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats', refreshTrigger],
    queryFn: async () => {
      const [
        plansResult, 
        testimonialsResult, 
        contactFormsResult, 
        activateSimResult, 
        faqsResult, 
        heroSlidesResult,
        profilesResult,
        ordersResult,
        transactionsResult
      ] = await Promise.all([
        supabase.from('plans').select('id, is_active', { count: 'exact' }),
        supabase.from('testimonials').select('id, is_featured', { count: 'exact' }),
        supabase.from('contact_forms').select('id, created_at', { count: 'exact' }),
        supabase.from('activate_sim_requests').select('id', { count: 'exact', head: true }),
        supabase.from('faqs').select('id', { count: 'exact', head: true }),
        supabase.from('hero_slides').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('orders').select('amount, status, created_at').eq('status', 'completed'),
        supabase.from('transactions').select('amount, status, created_at').eq('status', 'completed'),
      ]);

      // Calculate new contacts (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newContacts = contactFormsResult.data?.filter(contact => 
        new Date(contact.created_at) > sevenDaysAgo
      ).length || 0;

      // Calculate revenue
      const allOrders = [...(ordersResult.data || []), ...(transactionsResult.data || [])];
      const totalRevenue = allOrders.reduce((sum, order) => sum + (parseFloat(order.amount as any) || 0), 0);
      
      // Revenue this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      const thisMonthOrders = allOrders.filter(order => 
        new Date(order.created_at) >= firstDayOfMonth
      );
      const revenueThisMonth = thisMonthOrders.reduce((sum, order) => sum + (parseFloat(order.amount as any) || 0), 0);

      return {
        totalPlans: plansResult.count || 0,
        activePlans: plansResult.data?.filter(plan => plan.is_active).length || 0,
        totalTestimonials: testimonialsResult.count || 0,
        featuredTestimonials: testimonialsResult.data?.filter(t => t.is_featured).length || 0,
        totalContactForms: contactFormsResult.count || 0,
        newContacts,
        totalActivateSim: activateSimResult.count || 0,
        totalFaqs: faqsResult.count || 0,
        totalHeroSlides: heroSlidesResult.count || 0,
        totalUsers: profilesResult.count || 0,
        totalOrders: allOrders.length,
        totalRevenue,
        revenueThisMonth,
      };
    },
  });

  const { data: recentContacts } = useQuery({
    queryKey: ['recent-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_forms')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here's an overview of your content.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.totalRevenue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.revenueThisMonth || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPlans || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.activePlans || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTestimonials || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.featuredTestimonials || 0} featured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Forms</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContactForms || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newContacts || 0} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SIM Activations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalActivateSim || 0}</div>
            <p className="text-xs text-muted-foreground">Activation requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Contact Forms</CardTitle>
            <CardDescription>Latest form submissions from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentContacts?.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between border-b pb-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.email}</p>
                    <p className="text-xs text-muted-foreground">{contact.subject || 'No subject'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={contact.status === 'new' ? 'default' : 'secondary'}>
                      {contact.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {!recentContacts?.length && (
                <p className="text-muted-foreground text-center py-4">No recent contact forms</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Link 
                to="/admin/orders" 
                className="flex items-center p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <ShoppingCart className="h-4 w-4 mr-3" />
                <span className="text-sm">View All Orders</span>
              </Link>
              <Link 
                to="/admin/plans/new" 
                className="flex items-center p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <Activity className="h-4 w-4 mr-3" />
                <span className="text-sm">Add New Plan</span>
              </Link>
              <Link 
                to="/admin/slider" 
                className="flex items-center p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <FileText className="h-4 w-4 mr-3" />
                <span className="text-sm">Manage Hero Slides</span>
              </Link>
              <Link 
                to="/admin/testimonials" 
                className="flex items-center p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <Star className="h-4 w-4 mr-3" />
                <span className="text-sm">Add Testimonial</span>
              </Link>
              <Link 
                to="/admin/contacts" 
                className="flex items-center p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <MessageSquare className="h-4 w-4 mr-3" />
                <span className="text-sm">View Messages</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;