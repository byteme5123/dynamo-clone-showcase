import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  HelpCircle, 
  Star, 
  Images, 
  Settings, 
  Users, 
  FileText,
  Languages,
  Camera,
  Search
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { 
    name: 'Content Management', 
    icon: FileText,
    children: [
      { name: 'Plans', href: '/admin/plans', icon: Package },
      { name: 'Hero Slider', href: '/admin/slider', icon: Images },
      { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
      { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
    ]
  },
  { name: 'Contact Forms', href: '/admin/contacts', icon: MessageSquare },
  { name: 'Activate SIM Requests', href: '/admin/activate-sim', icon: MessageSquare },
  { name: 'Media Library', href: '/admin/media', icon: Camera },
  { name: 'Translations', href: '/admin/translations', icon: Languages },
  { name: 'SEO Settings', href: '/admin/seo', icon: Search },
  { name: 'Site Settings', href: '/admin/settings', icon: Settings },
  { name: 'Admin Users', href: '/admin/users', icon: Users },
];

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-foreground">Dynamo Admin</h1>
      </div>
      
      <nav className="px-4 space-y-2">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div className="space-y-1">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground">
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </div>
                <div className="ml-6 space-y-1">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.name}
                      to={child.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive(child.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <child.icon className="mr-3 h-4 w-4" />
                      {child.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;