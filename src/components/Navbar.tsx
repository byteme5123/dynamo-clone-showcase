import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';
import { useSafeAuth } from '@/contexts/AuthContext';
import logoImage from '@/assets/dynamo-wireless-logo.png';

const Navbar = () => {
  // Force refresh - unified auth context
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const settings = useHomepageSettings();
  const { isAuthenticated } = useSafeAuth();

  // Function to trigger Google Translate
  const triggerGoogleTranslate = (lang: 'en' | 'es') => {
    setLanguage(lang);
    
    // Function to trigger translation
    const performTranslation = (attempts = 0) => {
      if (attempts > 20) {
        console.log('Google Translate not available');
        return;
      }

      // Method 1: Try to find and use the select element (most reliable)
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      // Method 2: Try to find the banner element
      const googleTranslateElement = document.getElementById('google_translate_element');
      if (googleTranslateElement) {
        const select = googleTranslateElement.querySelector('select') as HTMLSelectElement;
        if (select) {
          select.value = lang;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }
      }

      // Method 3: Try frame method as fallback
      const frame = document.querySelector('.goog-te-menu-frame') as HTMLIFrameElement;
      if (frame) {
        try {
          const innerDoc = frame.contentDocument || frame.contentWindow?.document;
          if (innerDoc) {
            const langLinks = innerDoc.querySelectorAll('.goog-te-menu2-item span.text');
            langLinks.forEach((link: any) => {
              const text = link.textContent.toLowerCase();
              if ((lang === 'es' && text.includes('spanish')) || 
                  (lang === 'en' && text.includes('english'))) {
                (link.parentElement as HTMLElement).click();
              }
            });
            return;
          }
        } catch (e) {
          console.log('Frame method failed, trying again...');
        }
      }

      // If nothing worked, try again
      setTimeout(() => performTranslation(attempts + 1), 200);
    };

    // Start translation attempt
    performTranslation();
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'WirelessPBX', href: '/wireless-pbx' },
    { name: 'Plans', href: '/plans' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 h-[70px]">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img 
                src={settings?.navbarLogo || logoImage} 
                alt="Dynamo Wireless" 
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-black hover:underline transition-all duration-200 font-bold text-sm px-3 py-2"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <span className="text-sm font-medium">
                    {language === 'en' ? 'EN' : 'ES'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
                <DropdownMenuItem 
                  onClick={() => triggerGoogleTranslate('en')}
                  className={language === 'en' ? 'bg-gray-100' : ''}
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => triggerGoogleTranslate('es')}
                  className={language === 'es' ? 'bg-gray-100' : ''}
                >
                  Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <span>My Account</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
                  <DropdownMenuItem asChild>
                    <Link to="/account">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button 
                      onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/';
                      }}
                      className="w-full text-left"
                    >
                      Logout
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-black hover:text-primary transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-2 space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-1 px-3 py-2 text-black hover:text-primary transition-colors">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">{language === 'en' ? 'Language' : 'Idioma'}</span>
                    <ChevronDown className="w-3 h-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border shadow-lg">
                    <DropdownMenuItem onClick={() => triggerGoogleTranslate('en')}>English</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => triggerGoogleTranslate('es')}>Español</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="px-3">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <Link 
                        to="/account" 
                        className="block px-3 py-2 text-black hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link 
                        to="/plans" 
                        className="block px-3 py-2 text-black hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Plans
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                      </Button>
                      <Button variant="default" className="w-full" asChild>
                        <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;