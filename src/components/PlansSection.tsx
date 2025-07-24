import { Button } from '@/components/ui/button';
import planCardImage from '@/assets/dynamo-plan-card.png';

const PlansSection = () => {
  const plans = [
    {
      image: planCardImage,
      title: '$25/mo Plan',
      description: 'UNLIMITED Talk & Text + 2GB Data'
    },
    {
      image: planCardImage,
      title: '$35/mo Plan', 
      description: 'UNLIMITED Talk & Text + 5GB Data'
    },
    {
      image: planCardImage,
      title: '$45/mo Plan',
      description: 'UNLIMITED Talk & Text + 10GB Data'
    },
    {
      image: planCardImage,
      title: '$55/mo Plan',
      description: 'UNLIMITED Talk & Text + UNLIMITED Data'
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
              className="bg-background rounded-xl p-6 shadow-lg hover-lift relative text-center"
            >
              <div className="mb-4">
                <img
                  src={plan.image}
                  alt={plan.title}
                  className="w-full h-auto max-w-[200px] mx-auto object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{plan.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <Button variant="cta" className="w-full hover-lift">
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