
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import dynamoLogo from '@/assets/dynamo-wireless-logo.png';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={dynamoLogo} 
              alt="Dynamo Wireless" 
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t('navbar.home')}
            </Link>
            <Link 
              to="/about" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t('navbar.about')}
            </Link>
            <Link 
              to="/plans" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t('navbar.plans')}
            </Link>
            <Link 
              to="/wireless-pbx" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Wireless PBX
            </Link>
            <Link 
              to="/contact" 
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {t('navbar.contact')}
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.home')}
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.about')}
              </Link>
              <Link
                to="/plans"
                className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.plans')}
              </Link>
              <Link
                to="/wireless-pbx"
                className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Wireless PBX
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.contact')}
              </Link>
              
              {/* Mobile Auth Section */}
              <div className="border-t border-border pt-3 mt-3">
                {user ? (
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link
                      to="/auth/login"
                      className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth/register"
                      className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
