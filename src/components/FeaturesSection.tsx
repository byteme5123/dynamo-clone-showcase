import { Wifi, MessageSquare, Smartphone, Globe2, Signal, Shield } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Signal,
      title: '5G Network',
      description: 'Lightning-fast 5G speeds nationwide'
    },
    {
      icon: MessageSquare,
      title: 'Unlimited Text',
      description: 'Send unlimited texts to anyone'
    },
    {
      icon: Wifi,
      title: 'Free Hotspot',
      description: 'Mobile hotspot included in all plans'
    },
    {
      icon: Globe2,
      title: 'International',
      description: 'Affordable international calling'
    },
    {
      icon: Smartphone,
      title: 'Easy Setup',
      description: 'Quick activation in minutes'
    },
    {
      icon: Shield,
      title: 'Secure Network',
      description: 'Protected with advanced security'
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our plans come packed with features to keep you connected wherever you go.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg hover-lift cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;