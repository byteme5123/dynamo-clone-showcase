
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { usePlans } from '@/hooks/usePlans';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import planCardImage from '@/assets/dynamo-plan-card.png';

const PlansSection = () => {
  const { t } = useTranslation();
  const { data: plans, isLoading, error } = usePlans();

  if (isLoading && !plans) {
    return (
      <section id="plans" className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('plans.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('plans.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-background rounded-xl p-6 shadow-lg">
                <Skeleton className="w-full h-32 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="plans" className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('plans.title')}
            </h2>
            <p className="text-lg text-destructive">
              Error loading plans. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="plans" className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('plans.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('plans.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans?.map((plan) => (
            <div
              key={plan.id}
              className="bg-background rounded-xl p-6 shadow-lg hover-lift relative text-center"
            >
              <div className="mb-4">
                <img
                  src={plan.image_url || planCardImage}
                  alt={plan.name}
                  loading="eager"
                  className="w-full h-auto max-w-[200px] mx-auto object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {plan.currency} {plan.price}/mo Plan
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>
              <Button variant="cta" className="w-full hover-lift" asChild>
                {plan.external_link ? (
                  <a href={plan.external_link} target="_blank" rel="noopener noreferrer">
                    {t('plans.choosePlan')}
                  </a>
                ) : (
                  <Link to={`/plans/${plan.slug}`}>
                    {t('plans.choosePlan')}
                  </Link>
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            {t('plans.supportText')}
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link to="/plans">
              {t('plans.compareAllPlans')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
