import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-woman-phone.jpg';

const HeroSection = () => {
  const plans = [
    { data: '5GB', price: 20, originalData: '4GB' },
    { data: '11GB', price: 30, originalData: '7GB' },
    { data: '17GB', price: 40, originalData: '16GB' },
    { data: 'UNLIMITED', price: 50, originalData: 'UNLIMITED', subtitle: '100GB MOBILE HOTSPOT', note: '45GB of premium data speed, then 2G' }
  ];

  return (
    <section className="hero-gradient py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8 slide-up">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Even more data!
            </h1>
            
            {/* Plan Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur rounded-lg p-4 text-center hover-lift cursor-pointer"
                >
                  <div className="text-primary text-xs font-medium mb-1">
                    {plan.originalData}
                  </div>
                  <div className="text-secondary text-2xl font-bold mb-1">
                    {plan.data}
                  </div>
                  <div className="text-secondary text-lg">
                    <span className="text-sm">$</span>
                    <span className="font-bold">{plan.price}</span>
                    <span className="text-xs">/mo</span>
                  </div>
                  {plan.subtitle && (
                    <div className="text-primary text-xs font-medium mt-1">
                      {plan.subtitle}
                    </div>
                  )}
                  {plan.note && (
                    <div className="text-muted-foreground text-xs mt-1">
                      {plan.note}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button variant="hero" size="xl" className="hover-lift">
              See plans
            </Button>
          </div>

          {/* Right Image */}
          <div className="flex justify-center lg:justify-end fade-in">
            <img
              src={heroImage}
              alt="Woman using smartphone"
              className="max-w-md w-full h-auto object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;