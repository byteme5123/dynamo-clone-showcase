import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';
import dynamoLogo from '@/assets/dynamo-wireless-logo.png';

const FigmaFooter = () => {
  const settings = useHomepageSettings();

  const planLinks = [
    { name: 'Prepaid Plans', href: '/plans' },
    { name: 'Business Plans', href: '/plans' },
    { name: 'International', href: '/plans' },
    { name: 'Compare Plans', href: '/plans' }
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/contact' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Store Locations', href: '/about' },
    { name: 'Coverage Map', href: '/coverage' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: settings?.footerFacebookUrl || '#', hoverColor: 'hover:text-blue-600' },
    { name: 'Twitter', icon: Twitter, href: settings?.footerTwitterUrl || '#', hoverColor: 'hover:text-blue-400' },
    { name: 'Instagram', icon: Instagram, href: settings?.footerInstagramUrl || '#', hoverColor: 'hover:text-pink-600' },
    { name: 'LinkedIn', icon: Linkedin, href: settings?.footerLinkedinUrl || '#', hoverColor: 'hover:text-blue-700' }
  ];

  return (
    <footer className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Left Column - Logo & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src={settings?.footerLogo || dynamoLogo}
                alt="Dynamo Wireless"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {settings?.footerDescription || 'America\'s most reliable wireless network with nationwide 5G coverage, unlimited plans, and exceptional customer service.'}
            </p>
            
            {/* Contact Info */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>Call: {settings?.footerPhone || '(1-800) DYNAMO'}</p>
              <p>Email: {settings?.footerEmail || 'support@dynamowireless.com'}</p>
            </div>
          </div>

          {/* Plans & Services Column */}
          <div>
            <h3 className="font-bold text-black mb-4">Plans & Services</h3>
            <ul className="space-y-2">
              {planLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-primary text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-bold text-black mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-primary text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social Column */}
          <div>
            <h3 className="font-bold text-black mb-4">Connect</h3>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`text-gray-500 ${social.hoverColor} transition-colors`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            
            {/* Newsletter Signup */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Stay updated with our latest offers</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="px-4 py-2 bg-primary text-white text-sm rounded-r-lg hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; 2025 Dynamo Wireless. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/accessibility" className="hover:text-primary transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FigmaFooter;