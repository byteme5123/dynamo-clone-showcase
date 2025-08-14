
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import WirelessPBX from "./pages/WirelessPBX";
import Plans from "./pages/Plans";
import PlanDetail from "./pages/PlanDetail";
import ActivateSIM from "./pages/ActivateSIM";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
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
                <Route path="slider" element={<AdminHeroSlides />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
