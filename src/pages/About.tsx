import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Signal, CreditCard, MessageSquare, Zap, Smartphone, X, DollarSign, Wifi, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAboutHeroSlides } from '@/hooks/useHeroSlides';
import { useAboutPageSettings } from '@/hooks/useAboutPageSettings';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import FigmaFooter from '@/components/FigmaFooter';
import MobileBottomBar from '@/components/MobileBottomBar';
import * as Icons from 'lucide-react';

const About = () => {
  const [showDestinations, setShowDestinations] = useState(false);
  const { data: heroSlides } = useAboutHeroSlides();
  const settings = useAboutPageSettings();
  const heroSlide = heroSlides?.[0]; // Get the first (and should be only) about hero slide

  // Dynamic features from database
  const features = settings ? [
    {
      icon: (Icons as any)[settings.feature1Icon] || Globe,
      title: settings.feature1Title || 'International Friendly',
      description: settings.feature1Description || 'Call 100+ countries without extra charges'
    },
    {
      icon: (Icons as any)[settings.feature2Icon] || Signal,
      title: settings.feature2Title || 'Reliable Network',
      description: settings.feature2Description || 'Access to nationwide 5G networks'
    },
    {
      icon: (Icons as any)[settings.feature3Icon] || CreditCard,
      title: settings.feature3Title || 'No Hidden Fees',
      description: settings.feature3Description || 'Transparent plans with no surprises'
    },
    {
      icon: (Icons as any)[settings.feature4Icon] || MessageSquare,
      title: settings.feature4Title || 'Bilingual Support',
      description: settings.feature4Description || 'English and Spanish-speaking support'
    },
    {
      icon: (Icons as any)[settings.feature5Icon] || Zap,
      title: settings.feature5Title || 'Easy Top-Up',
      description: settings.feature5Description || 'Recharge online or in-store'
    },
    {
      icon: (Icons as any)[settings.feature6Icon] || Smartphone,
      title: settings.feature6Title || 'Bring Your Own Phone',
      description: settings.feature6Description || 'Keep your phone and number'
    }
  ] : [
    // Fallback features if settings not loaded
    { icon: Globe, title: 'International Friendly', description: 'Call 100+ countries without extra charges' },
    { icon: Signal, title: 'Reliable Network', description: 'Access to nationwide 5G networks' },
    { icon: CreditCard, title: 'No Hidden Fees', description: 'Transparent plans with no surprises' },
    { icon: MessageSquare, title: 'Bilingual Support', description: 'English and Spanish-speaking support' },
    { icon: Zap, title: 'Easy Top-Up', description: 'Recharge online or in-store' },
    { icon: Smartphone, title: 'Bring Your Own Phone', description: 'Keep your phone and number' }
  ];

  const noWorries = settings ? [
    { icon: (Icons as any)[settings.noWorry1Icon] || X, text: settings.noWorry1Text || 'No overage charges' },
    { icon: (Icons as any)[settings.noWorry2Icon] || DollarSign, text: settings.noWorry2Text || 'No hidden fees' },
    { icon: (Icons as any)[settings.noWorry3Icon] || Wifi, text: settings.noWorry3Text || 'No 5G extra cost' },
    { icon: (Icons as any)[settings.noWorry4Icon] || UserCheck, text: settings.noWorry4Text || 'No credit checks' }
  ] : [
    // Fallback no worries if settings not loaded
    { icon: X, text: 'No overage charges' },
    { icon: DollarSign, text: 'No hidden fees' },
    { icon: Wifi, text: 'No 5G extra cost' },
    { icon: UserCheck, text: 'No credit checks' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroSlide?.image_url || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'})`
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Hero Content Overlay */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {heroSlide?.title || "About Dynamo Wireless"}
            </h1>
            {heroSlide?.subtitle && (
              <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                {heroSlide.subtitle}
              </p>
            )}
            {heroSlide?.cta_text && heroSlide?.cta_url && (
              <Button size="xl" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link to={heroSlide.cta_url}>
                  {heroSlide.cta_text}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Short Intro */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {settings?.introText || 'We believe communication should be easy, affordable, and for everyone. Our mission is to empower communities with reliable and international-ready mobile service.'}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {settings?.featuresTitle || 'Features you\'ll enjoy.'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover-scale">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <a href={settings?.featuresCtaUrl || '/plans'}>{settings?.featuresCtaText || 'Shop Plans'}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* What You Won't Worry About */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              {settings?.noWorriesTitle || 'What you won\'t have to worry about.'}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {noWorries.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-destructive-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* International Calling */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              {settings?.internationalTitle || 'International calling capabilities.'}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {settings?.internationalDescription || 'Unlimited international calling to over 100 destinations is included in most plans.'}
            </p>
            
            <Button 
              variant="outline" 
              onClick={() => setShowDestinations(!showDestinations)}
              className="mb-8"
            >
              {showDestinations ? 'Hide' : 'See'} list of 100+ destinations
            </Button>

            {showDestinations && (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">
                    {settings?.internationalDestinationsText || 'Popular destinations include: Mexico, Canada, India, China, Philippines, United Kingdom, Germany, France, Japan, South Korea, and many more countries across North America, South America, Europe, Asia, and Africa.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Phone Options */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {settings?.phoneOptionsTitle || 'Bring the phone you already have or buy a new one.'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-primary text-primary-foreground overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">{settings?.bringPhoneTitle || 'Bring your phone.'}</h3>
                    <p className="mb-6">{settings?.bringPhoneDescription || 'Switch and keep your device. Most unlocked phones work on our network.'}</p>
                    <Button variant="secondary" size="lg" asChild>
                      <Link to={settings?.bringPhoneButtonUrl || '/activate'}>
                        {settings?.bringPhoneButtonText || 'Get Started'}
                      </Link>
                    </Button>
                  </div>
                  <div className="hidden md:block">
                    <img 
                      src={settings?.bringPhoneImageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"} 
                      alt="Bring your phone"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-destructive text-destructive-foreground overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">{settings?.buyPhoneTitle || 'Buy a new one.'}</h3>
                    <p className="mb-6">{settings?.buyPhoneDescription || 'Find the best device with financing options on new and pre-owned phones.'}</p>
                    <Button variant="secondary" size="lg" asChild>
                      <Link to={settings?.buyPhoneButtonUrl || '/phones'}>
                        {settings?.buyPhoneButtonText || 'Shop Phones'}
                      </Link>
                    </Button>
                  </div>
                  <div className="hidden md:block">
                    <img 
                      src={settings?.buyPhoneImageUrl || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"} 
                      alt="Buy a new phone"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Store Finder CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              {settings?.storeFinderTitle || 'Shop online or find your nearest store.'}
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="text-center">
                    <img 
                      src={settings?.shopOnlineImageUrl || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"} 
                      alt="Shop online"
                      className="w-full max-w-sm mx-auto rounded-lg mb-4"
                    />
                    <Button variant="secondary" size="lg" className="w-full max-w-sm" asChild>
                      <Link to={settings?.shopOnlineButtonUrl || '/plans'}>
                        {settings?.shopOnlineButtonText || 'Shop Online'}
                      </Link>
                    </Button>
                  </div>
                  <div className="text-center">
                    <img 
                      src={settings?.findStoreImageUrl || "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"} 
                      alt="Visit a store"
                      className="w-full max-w-sm mx-auto rounded-lg mb-4"
                    />
                    <Button variant="secondary" size="lg" className="w-full max-w-sm" asChild>
                      <Link to={settings?.findStoreButtonUrl || '/stores'}>
                        {settings?.findStoreButtonText || 'Find a Store'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <FigmaFooter />
      <MobileBottomBar />
      {/* Add bottom padding to prevent content from being hidden behind mobile bottom bar */}
      <div className="h-16 md:h-0" />
    </div>
  );
};

export default About;