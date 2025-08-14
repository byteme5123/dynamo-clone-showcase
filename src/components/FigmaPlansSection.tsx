import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { usePlans } from '@/hooks/usePlans';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const FigmaPlansSection = () => {
  const { t } = useTranslation();
  const { data: plans, isLoading, error } = usePlans();

  if (isLoading && !plans) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-gray-600 text-lg">
              Get more data for less with our flexible plans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border">
                <Skeleton className="w-full h-48 mb-4 rounded-lg" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-8 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-lg text-red-600">
              Error loading plans. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-gray-600 text-lg">
            Get more data for less with our flexible plans.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {plans?.slice(0, 5).map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover-lift relative text-center border border-gray-100"
            >
              {/* Plan Image */}
              <div className="mb-6">
                <img
                  src={plan.image_url || '/src/assets/dynamo-plan-card.png'}
                  alt={`${plan.name} SIM card package`}
                  loading="lazy"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              
              {/* Plan Title */}
              <h3 className="text-xl font-bold text-black mb-2">
                {plan.name}
              </h3>
              
              {/* Price */}
              <div className="text-2xl font-bold text-primary mb-4">
                {plan.currency}{plan.price}
              </div>
              
              {/* Features List */}
              <div className="text-left mb-6 space-y-2">
                {plan.features?.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-start text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA Button */}
              <Button 
                variant="default" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-lg py-3"
                asChild
              >
                {plan.external_link ? (
                  <a href={plan.external_link} target="_blank" rel="noopener noreferrer">
                    Choose Plan
                  </a>
                ) : (
                  <Link to={`/plans/${plan.slug}`}>
                    Choose Plan
                  </Link>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FigmaPlansSection;