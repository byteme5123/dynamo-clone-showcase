import { Globe } from 'lucide-react';
import internationalImage from '@/assets/international-connectivity.jpg';

const InternationalSection = () => {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <div className="flex justify-center lg:justify-start">
            <img
              src={internationalImage}
              alt="International connectivity"
              className="w-full max-w-md h-auto object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Right Content */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Affordable nationwide and international connectivity.
              </h2>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Stay connected with friends and family around the world with our affordable international calling plans. 
              Enjoy crystal-clear calls and competitive rates to over 100 countries.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">International Calling</h3>
                <p className="text-sm text-muted-foreground">
                  Low rates to 100+ countries
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Global Roaming</h3>
                <p className="text-sm text-muted-foreground">
                  Stay connected while traveling
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Customer service in multiple languages
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">No Contracts</h3>
                <p className="text-sm text-muted-foreground">
                  Flexible month-to-month plans
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InternationalSection;