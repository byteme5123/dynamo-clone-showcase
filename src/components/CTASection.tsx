import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Smartphone } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-16 hero-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center text-white space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Ready to Switch to Dynamo Wireless?
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Join thousands of satisfied customers who've made the switch to better coverage, 
            more data, and unbeatable prices.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="xl" className="hover-lift">
              <Smartphone className="w-5 h-5 mr-2" />
              Activate Your SIM
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button variant="outline" size="xl" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Phone className="w-5 h-5 mr-2" />
              Call (1-800) DYNAMO
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">2 min</div>
              <div className="text-white/80">Quick Setup</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">$0</div>
              <div className="text-white/80">Activation Fee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-white/80">Support</div>
            </div>
          </div>

          <p className="text-sm text-white/70">
            Keep your current phone number when you switch. No contracts, cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;