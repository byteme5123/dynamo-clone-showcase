import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  MessageSquare, 
  HelpCircle, 
  Star, 
  Users,
  Eye,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalPlans: number;
  activePlans: number;
  totalContacts: number;
  newContacts: number;
  totalFaqs: number;
  totalTestimonials: number;
  featuredTestimonials: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPlans: 0,
    activePlans: 0,
    totalContacts: 0,
    newContacts: 0,
    totalFaqs: 0,
    totalTestimonials: 0,
    featuredTestimonials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch plans stats
        const { data: plans, error: plansError } = await supabase
          .from('plans')
          .select('is_active');
        
        // Fetch contacts stats
        const { data: contacts, error: contactsError } = await supabase
          .from('contact_forms')
          .select('created_at');
        
        // Fetch FAQs stats
        const { data: faqs, error: faqsError } = await supabase
          .from('faqs')
          .select('id');
        
        // Fetch testimonials stats
        const { data: testimonials, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('is_featured');

        if (plansError || contactsError || faqsError || testimonialsError) {
          console.error('Error fetching stats:', { plansError, contactsError, faqsError, testimonialsError });
          return;
        }

        // Calculate new contacts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const newContacts = contacts?.filter(contact => 
          new Date(contact.created_at) > sevenDaysAgo
        ).length || 0;

        setStats({
          totalPlans: plans?.length || 0,
          activePlans: plans?.filter(plan => plan.is_active).length || 0,
          totalContacts: contacts?.length || 0,
          newContacts,
          totalFaqs: faqs?.length || 0,
          totalTestimonials: testimonials?.length || 0,
          featuredTestimonials: testimonials?.filter(testimonial => testimonial.is_featured).length || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Plans',
      value: stats.totalPlans,
      description: `${stats.activePlans} active`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Contact Forms',
      value: stats.totalContacts,
      description: `${stats.newContacts} new this week`,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'FAQs',
      value: stats.totalFaqs,
      description: 'Total questions',
      icon: HelpCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Testimonials',
      value: stats.totalTestimonials,
      description: `${stats.featuredTestimonials} featured`,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const quickActions = [
    {
      title: 'Add New Plan',
      description: 'Create a new mobile plan',
      href: '/admin/plans/new',
      icon: Package,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'View Contacts',
      description: 'Review customer inquiries',
      href: '/admin/contacts',
      icon: MessageSquare,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Manage FAQs',
      description: 'Update frequently asked questions',
      href: '/admin/faqs',
      icon: HelpCircle,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Site Settings',
      description: 'Configure global settings',
      href: '/admin/settings',
      icon: Users,
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Dynamo Wireless admin dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => (
          <Card key={action.title} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-full text-white ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System initialized</p>
                  <p className="text-xs text-muted-foreground">Database and admin system ready</p>
                </div>
                <Badge variant="secondary">Just now</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Current system health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="default" className="bg-green-500">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <Badge variant="default" className="bg-green-500">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <Badge variant="default" className="bg-green-500">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;