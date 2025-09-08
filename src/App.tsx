
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import SessionWarning from "@/components/SessionWarning";
import SessionTracker from "@/components/SessionTracker";
import Index from "./pages/Index";
import About from "./pages/About";
import WirelessPBX from "./pages/WirelessPBX";
import Plans from "./pages/Plans";
import PlanDetail from "./pages/PlanDetail";
import ActivateSIM from "./pages/ActivateSIM";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPlans from "./pages/AdminPlans";
import AdminPlanForm from "./pages/AdminPlanForm";
import AdminHeroSlides from "./pages/AdminHeroSlides";
import AdminActivateSimRequests from "./pages/AdminActivateSimRequests";
import AdminContacts from "./pages/AdminContacts";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminFaqs from "./pages/AdminFaqs";
import AdminLayout from "./components/admin/AdminLayout";
import AdminMedia from "./pages/AdminMedia";
import AdminTranslations from "./pages/AdminTranslations";
import AdminSeo from "./pages/AdminSeo";
import AdminSettings from "./pages/AdminSettings";
import AdminUsers from "./pages/AdminUsers";
import AdminWirelessPBX from "./pages/AdminWirelessPBX";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminHomepageNotification from "./pages/AdminHomepageNotification";
import AdminHomepageBranding from "./pages/AdminHomepageBranding";
import AdminHomepageFeatures from "./pages/AdminHomepageFeatures";
import AdminHomepageCoverage from "./pages/AdminHomepageCoverage";
import AdminHomepageCTA from "./pages/AdminHomepageCTA";
import AdminHomepageFooter from "./pages/AdminHomepageFooter";
import AdminAbout from "./pages/AdminAbout";
import AdminContact from "./pages/AdminContact";
import AdminPayPalSettings from "./pages/AdminPayPalSettings";

// Optimized QueryClient for maximum performance and instant loading
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh much longer
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache much longer
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors or if we've already retried once
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 1;
      },
      retryDelay: 300, // Very fast retry
      refetchOnWindowFocus: false, // Never refetch on focus - causes slowdowns
      refetchOnReconnect: false, // Don't refetch on reconnect - use cached data
      refetchOnMount: false, // Never refetch on mount if data exists - instant loading
      networkMode: 'online', // Only run queries when online
      refetchInterval: false, // No background refetching
    },
    mutations: {
      retry: 1,
      retryDelay: 300,
      networkMode: 'online',
    },
  },
});

const App = () => (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <SessionWarning />
              <SessionTracker />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/wireless-pbx" element={<WirelessPBX />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/plans/:slug" element={<PlanDetail />} />
                  <Route path="/activate" element={<ActivateSIM />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-cancel" element={<PaymentCancel />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/*" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="plans" element={<AdminPlans />} />
                    <Route path="plans/new" element={<AdminPlanForm />} />
                    <Route path="plans/edit/:id" element={<AdminPlanForm />} />
                    <Route path="wireless-pbx" element={<AdminWirelessPBX />} />
                    <Route path="hero-slides" element={<AdminHeroSlides />} />
                    <Route path="testimonials" element={<AdminTestimonials />} />
                    <Route path="faqs" element={<AdminFaqs />} />
                    <Route path="contacts" element={<AdminContacts />} />
                    <Route path="activate-sim" element={<AdminActivateSimRequests />} />
                    <Route path="media" element={<AdminMedia />} />
                    <Route path="translations" element={<AdminTranslations />} />
                    <Route path="seo" element={<AdminSeo />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="user-management" element={<AdminUserManagement />} />
                    <Route path="slider" element={<AdminHeroSlides />} />
                    <Route path="homepage/notification" element={<AdminHomepageNotification />} />
                    <Route path="homepage/branding" element={<AdminHomepageBranding />} />
                    <Route path="homepage/features" element={<AdminHomepageFeatures />} />
                    <Route path="homepage/coverage" element={<AdminHomepageCoverage />} />
                    <Route path="homepage/cta" element={<AdminHomepageCTA />} />
                    <Route path="homepage/footer" element={<AdminHomepageFooter />} />
                    <Route path="about" element={<AdminAbout />} />
                    <Route path="contact" element={<AdminContact />} />
                    <Route path="paypal" element={<AdminPayPalSettings />} />
                  </Route>
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
);

export default App;
