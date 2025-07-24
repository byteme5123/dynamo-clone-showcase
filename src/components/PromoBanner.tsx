import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary text-primary-foreground py-3 px-4 relative">
      <div className="container mx-auto text-center">
        <p className="text-sm font-medium">
          Get up to 25% off when you purchase a 3 month plan!{' '}
          <span className="ml-2 font-bold">
            <Button
              variant="link"
              className="text-primary-foreground underline p-0 h-auto font-bold hover:text-primary-foreground/90"
            >
              My Account
            </Button>
            {' '}
            <Button
              variant="link" 
              className="text-primary-foreground underline p-0 h-auto font-bold hover:text-primary-foreground/90 ml-4"
            >
              Activate
            </Button>
          </span>
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/10 h-6 w-6"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PromoBanner;