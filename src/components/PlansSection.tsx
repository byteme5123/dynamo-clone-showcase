import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import planCardImage from '@/assets/dynamo-plan-card.png';

const PlansSection = () => {
  const { t } = useTranslation();
  
  const plans = [
    {
      image: planCardImage,
      title: '$25/mo Plan',
      description: `${t('plans.unlimited')} ${t('plans.talkText')} + 2GB ${t('plans.data')}`
    },
    {
      image: planCardImage,
      title: '$35/mo Plan', 
      description: `${t('plans.unlimited')} ${t('plans.talkText')} + 5GB ${t('plans.data')}`
    },
    {
      image: planCardImage,
      title: '$45/mo Plan',
      description: `${t('plans.unlimited')} ${t('plans.talkText')} + 10GB ${t('plans.data')}`
    },
    {
      image: planCardImage,
      title: '$55/mo Plan',
      description: `${t('plans.unlimited')} ${t('plans.talkText')} + ${t('plans.unlimited')} ${t('plans.data')}`
    }
  ];

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
                {t('plans.choosePlan')}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            {t('plans.supportText')}
          </p>
          <Button variant="outline" size="lg">
            {t('plans.compareAllPlans')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlansSection;