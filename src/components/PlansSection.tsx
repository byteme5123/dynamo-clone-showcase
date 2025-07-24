import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';

const PlansSection = () => {
  const plans = [
    {
      name: '5GB Plan',
      price: 20,
      originalPrice: 25,
      data: '5GB',
      features: [
        'Unlimited talk & text',
        '5GB high-speed data',
        'Mobile hotspot included',
        'International texting',
        '5G coverage'
      ],
      popular: false,
      discount: '20% OFF'
    },
    {
      name: '11GB Plan',
      price: 30,
      originalPrice: 40,
      data: '11GB',
      features: [
        'Unlimited talk & text',
        '11GB high-speed data',
        'Mobile hotspot included',
        'International calling credits',
        '5G coverage',
        'Premium support'
      ],
      popular: true,
      discount: '25% OFF'
    },
    {
      name: '17GB Plan',
      price: 40,
      originalPrice: 50,
      data: '17GB',
      features: [
        'Unlimited talk & text',
        '17GB high-speed data',
        'Unlimited mobile hotspot',
        'International calling included',
        '5G coverage',
        'Premium support',
        'Cloud storage'
      ],
      popular: false,
      discount: '20% OFF'
    },
    {
      name: 'Unlimited Plan',
      price: 50,
      originalPrice: 65,
      data: 'Unlimited',
      features: [
        'Unlimited talk & text',
        'Unlimited high-speed data',
        '100GB mobile hotspot',
        'International calling included',
        '5G coverage',
        'Premium support',
        'Cloud storage',
        'Streaming perks'
      ],
      popular: false,
      discount: '25% OFF'
    }
  ];

  return (
    <section id="plans" className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get more data for less with our flexible plans. No contracts, no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-background rounded-xl p-6 shadow-lg hover-lift relative ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="absolute top-4 right-4">
                <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                  {plan.discount}
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-primary">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <div className="text-sm text-muted-foreground line-through">
                  Was ${plan.originalPrice}/month
                </div>
                <div className="text-2xl font-bold text-secondary mt-2">{plan.data}</div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={plan.popular ? "cta" : "outline"} 
                className="w-full hover-lift"
              >
                Choose Plan
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include nationwide coverage and 24/7 customer support
          </p>
          <Button variant="outline" size="lg">
            Compare All Plans
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlansSection;