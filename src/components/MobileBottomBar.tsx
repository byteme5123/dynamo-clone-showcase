import { Button } from '@/components/ui/button';
import { Phone, ShoppingCart, Zap } from 'lucide-react';

const MobileBottomBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 md:hidden">
      <div className="flex items-center justify-around py-2 px-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex flex-col items-center space-y-1 flex-1 h-auto py-2"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs">Plans</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex flex-col items-center space-y-1 flex-1 h-auto py-2"
        >
          <Phone className="w-5 h-5" />
          <span className="text-xs">Contact</span>
        </Button>
        
        <Button 
          variant="cta" 
          size="sm" 
          className="flex flex-col items-center space-y-1 flex-1 h-auto py-2"
        >
          <Zap className="w-5 h-5" />
          <span className="text-xs">Activate SIM</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileBottomBar;