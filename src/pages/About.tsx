import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Signal, CreditCard, MessageSquare, Zap, Smartphone, X, DollarSign, Wifi, UserCheck } from 'lucide-react';
import { useState } from 'react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';

const About = () => {
  const [showDestinations, setShowDestinations] = useState(false);

  const features = [
    {
      icon: Globe,
      title: 'International Friendly',
      description: 'Call 100+ countries without extra charges'
    },
    {
      icon: Signal,
      title: 'Reliable Network',
      description: 'Access to nationwide 5G networks'
    },
    {
      icon: CreditCard,
      title: 'No Hidden Fees',
      description: 'Transparent plans with no surprises'
    },
    {
      icon: MessageSquare,
      title: 'Bilingual Support',
      description: 'English and Spanish-speaking support'
    },
    {
      icon: Zap,
      title: 'Easy Top-Up',
      description: 'Recharge online or in-store'
    },
    {
      icon: Smartphone,
      title: 'Bring Your Own Phone',
      description: 'Keep your phone and number'
    }
  ];

  const noWorries = [
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
      <section className="relative h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)`
          }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </section>

      {/* Short Intro */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              We believe communication should be easy, affordable, and for everyone. Our mission is to empower communities with reliable and international-ready mobile service.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Features you'll enjoy.
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
              <a href="/plans">Shop Plans</a>
            </Button>
          </div>
        </div>
      </section>

      {/* What You Won't Worry About */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              What you won't have to worry about.
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
              International calling capabilities.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Unlimited international calling to over 100 destinations is included in most plans.
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
                    Popular destinations include: Mexico, Canada, India, China, Philippines, United Kingdom, Germany, France, Japan, South Korea, and many more countries across North America, South America, Europe, Asia, and Africa.
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
              Bring the phone you already have or buy a new one.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-primary text-primary-foreground overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Bring your phone.</h3>
                    <p className="mb-6">Switch and keep your device. Most unlocked phones work on our network.</p>
                    <Button variant="secondary" size="lg">
                      Get Started
                    </Button>
                  </div>
                  <div className="hidden md:block">
                    <img 
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
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
                    <h3 className="text-2xl font-bold mb-4">Buy a new one.</h3>
                    <p className="mb-6">Find the best device with financing options on new and pre-owned phones.</p>
                    <Button variant="secondary" size="lg">
                      Shop Phones
                    </Button>
                  </div>
                  <div className="hidden md:block">
                    <img 
                      src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
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
              Shop online or find your nearest store.
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="text-center">
                    <img 
                      src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                      alt="Shop online"
                      className="w-full max-w-sm mx-auto rounded-lg mb-4"
                    />
                    <Button variant="secondary" size="lg" className="w-full max-w-sm">
                      Shop Online
                    </Button>
                  </div>
                  <div className="text-center">
                    <img 
                      src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                      alt="Visit a store"
                      className="w-full max-w-sm mx-auto rounded-lg mb-4"
                    />
                    <Button variant="secondary" size="lg" className="w-full max-w-sm">
                      Find a Store
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
      <MobileBottomBar />
      {/* Add bottom padding to prevent content from being hidden behind mobile bottom bar */}
      <div className="h-16 md:h-0" />
    </div>
  );
};

export default About;