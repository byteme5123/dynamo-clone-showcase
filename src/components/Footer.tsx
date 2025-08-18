import { Facebook, Twitter, Instagram, Youtube, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import logoImage from '@/assets/dynamo-wireless-logo.png';

const Footer = () => {
  const { setLanguage } = useLanguage();
  const { t } = useTranslation();
  
  const footerLinks = {
    [t('footer.categories.Plans & Services')]: [
      t('footer.links.Mobile Plans'),
      t('footer.links.International Calling'),
      t('footer.links.Business Plans'),
      t('footer.links.Government Programs'),
      t('footer.links.Add-ons')
    ],
    [t('footer.categories.Support')]: [
      t('footer.links.Help Center'),
      t('footer.links.Contact Us'),
      t('footer.links.Coverage Map'),
      t('footer.links.Store Locator'),
      t('footer.links.Activate SIM')
    ],
    [t('footer.categories.Company')]: [
      t('footer.links.About Us'),
      t('footer.links.Careers'),
      t('footer.links.Press'),
      t('footer.links.Investor Relations'),
      t('footer.links.Partner with Us')
    ],
    [t('footer.categories.Legal')]: [
      t('footer.links.Terms of Service'),
      t('footer.links.Privacy Policy'),
      t('footer.links.Accessibility'),
      t('footer.links.Open Internet'),
      t('footer.links.Legal Notices')
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' }
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/abb5ee4d-66fd-40a4-8c6f-899521b74171.png" 
                alt="Dynamo Wireless" 
                className="h-20 w-auto object-contain"
              />
            </div>
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            
            {/* App Download Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">{t('footer.downloadApp')}</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 hover:bg-white/20">
                  {t('footer.appStore')}
                </Button>
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 hover:bg-white/20">
                  {t('footer.googlePlay')}
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-semibold text-sm">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-secondary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright and Links */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-secondary-foreground/80">
                {t('footer.copyright')}
              </p>
              <div className="flex space-x-4 text-sm">
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground">
                  {t('footer.privacy')}
                </a>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground">
                  {t('footer.terms')}
                </a>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground">
                  {t('footer.accessibility')}
                </a>
              </div>
            </div>

            {/* Social Links and Language */}
            <div className="flex items-center space-x-4">
              {/* Social Media */}
              <div className="flex space-x-2">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="w-8 h-8 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-secondary-foreground/20 transition-colors"
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{t('footer.language')}</span>
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('es')}>Español</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;