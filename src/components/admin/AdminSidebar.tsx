
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Star,
  Image,
  Globe,
  Search,
  Phone,
  Megaphone,
  Home,
  CreditCard,
  ShoppingCart,
  Mail,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Plans',
    href: '/admin/plans',
    icon: Package,
  },
  {
    title: 'Payment Settings',
    href: '/admin/payment-settings',
    icon: CreditCard,
  },
  {
    title: 'Wireless PBX',
    href: '/admin/wireless-pbx',
    icon: Phone,
  },
  {
    title: 'Hero Slides',
    href: '/admin/hero-slides',
    icon: Image,
  },
  {
    title: 'Testimonials',
    href: '/admin/testimonials',
    icon: Star,
  },
  {
    title: 'FAQs',
    href: '/admin/faqs',
    icon: HelpCircle,
  },
  {
    title: 'Contact Forms',
    href: '/admin/contacts',
    icon: Mail,
  },
  {
    title: 'Activate SIM',
    href: '/admin/activate-sim',
    icon: ShoppingCart,
  },
  {
    title: 'Media',
    href: '/admin/media',
    icon: Image,
  },
  {
    title: 'Translations',
    href: '/admin/translations',
    icon: Globe,
  },
  {
    title: 'SEO',
    href: '/admin/seo',
    icon: Search,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
];

const homepageItems = [
  { title: 'Notification', href: '/admin/homepage/notification', icon: Megaphone },
  { title: 'Branding', href: '/admin/homepage/branding', icon: Home },
  { title: 'Features', href: '/admin/homepage/features', icon: Star },
  { title: 'Coverage', href: '/admin/homepage/coverage', icon: Globe },
  { title: 'CTA', href: '/admin/homepage/cta', icon: FileText },
  { title: 'Footer', href: '/admin/homepage/footer', icon: Settings },
];

const pageItems = [
  { title: 'About', href: '/admin/about', icon: FileText },
  { title: 'Contact', href: '/admin/contact', icon: Mail },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-card border-r min-h-screen p-4">
      <div className="space-y-6">
        {/* Main Menu */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Main Menu
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Homepage Sections */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Homepage
          </h3>
          <nav className="space-y-1">
            {homepageItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Page Management */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Pages
          </h3>
          <nav className="space-y-1">
            {pageItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
