import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';

const FigmaCTASection = () => {
  const settings = useHomepageSettings();

  const keyPoints = [
    {
      number: settings?.ctaPoint1Number || "2 min",
      label: settings?.ctaPoint1Label || "Quick Setup"
    },
    {
      number: settings?.ctaPoint2Number || "$0",
      label: settings?.ctaPoint2Label || "Activation Fee"
    },
    {
      number: settings?.ctaPoint3Number || "24/7",
      label: settings?.ctaPoint3Label || "Support"
    }
  ];

  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 text-center">
        
        {/* Main Title */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          {settings?.ctaTitle || 'Ready to Switch to Dynamo Wireless?'}
        </h2>
        
        {/* Subtitle */}
        <p className="text-white text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
          {settings?.ctaSubtitle || 'Join thousands of satisfied customers who\'ve made the switch to better coverage, more data, and unbeatable prices.'}
        </p>
        
        {/* Key Points Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
          {keyPoints.map((point, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {point.number}
              </div>
              <div className="text-white text-sm font-medium">
                {point.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="secondary"
            size="lg"
            className="bg-black text-white hover:bg-gray-800 rounded-xl px-8 py-4 text-lg font-medium"
            asChild
          >
            <Link to={settings?.ctaPrimaryButtonUrl || '/activate'}>
              {settings?.ctaPrimaryButtonText || 'Make a Switch'}
            </Link>
          </Button>
          
          <Link 
            to={settings?.ctaSecondaryButtonUrl || '/plans'}
            className="text-white hover:underline text-lg font-medium"
          >
            {settings?.ctaSecondaryButtonText || 'Learn about offers'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FigmaCTASection;