import { CheckCircle } from 'lucide-react';
import whyChooseImage from '@/assets/why-choose-us.jpg';

const WhyDynamoSection = () => {
  const benefits = [
    'No annual contracts or hidden fees',
    'Nationwide 5G coverage',
    'International calling included',
    'Free mobile hotspot',
    'Unlimited talk and text',
    '24/7 customer support'
  ];

  return (
    <section id="about" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Why Dynamo Wireless?
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Experience the power of reliable, fast, and affordable wireless service. 
              We're committed to keeping you connected with transparent pricing and exceptional coverage.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="bg-muted rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold text-foreground">
                Trusted by thousands of customers
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Coverage</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">5★</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center lg:justify-end">
            <img
              src={whyChooseImage}
              alt="Happy family using devices"
              className="w-full max-w-md h-auto object-cover rounded-lg shadow-lg hover-lift"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyDynamoSection;