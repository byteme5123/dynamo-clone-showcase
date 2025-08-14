import { Smartphone, Zap, MessageCircle, Globe, Wifi } from 'lucide-react';

const FigmaFeaturesSection = () => {
  const features = [
    {
      icon: Smartphone,
      title: "Access to America's largest 5G network"
    },
    {
      icon: Zap,
      title: "5G High speed data"
    },
    {
      icon: MessageCircle,
      title: "Unlimited talk & text"
    },
    {
      icon: Globe,
      title: "Unlimited calling to 100+ destinations"
    },
    {
      icon: Wifi,
      title: "Free mobile hotspot"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Our affordable wireless plans include:
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4">
              {/* Icon Circle */}
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center hover-lift">
                <feature.icon className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              
              {/* Feature Title */}
              <p className="text-black text-sm font-medium leading-tight max-w-[140px] mx-auto">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FigmaFeaturesSection;