import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Signal, Zap, Phone, Globe, Wifi } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import CoverageSection from '@/components/CoverageSection';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';
import planCardImage from '@/assets/dynamo-plan-card.png';

const Plans = () => {
  const planBenefits = [
    {
      icon: Signal,
      title: "Access to America's largest 5G networks",
      description: "Nationwide coverage"
    },
    {
      icon: Zap,
      title: "5G high-speed data",
      description: "Lightning fast speeds"
    },
    {
      icon: Phone,
      title: "Unlimited nationwide talk & text",
      description: "Stay connected anywhere"
    },
    {
      icon: Globe,
      title: "Unlimited calls to 100+ international destinations",
      description: "Global connectivity"
    },
    {
      icon: Wifi,
      title: "Free hotspot support",
      description: "Share your connection"
    }
  ];

  const faqs = [
    {
      question: "How do I sign up?",
      answer: "You can sign up online through our website or visit one of our retail locations. The process takes just a few minutes and you can activate your service immediately."
    },
    {
      question: "Can I keep my phone number?",
      answer: "Yes! You can keep your current phone number when you switch to Dynamo Wireless. We'll handle the transfer process for you during activation."
    },
    {
      question: "Can I bring my phone?",
      answer: "Most unlocked phones are compatible with our network. You can check compatibility on our website or bring your phone to one of our stores for verification."
    },
    {
      question: "What's included in the plan?",
      answer: "All plans include unlimited talk and text, high-speed data (amount varies by plan), access to our 5G network, international calling to 100+ countries, and mobile hotspot capability."
    },
    {
      question: "Do I need a SIM card?",
      answer: "Yes, you'll need a SIM card to use our service. We provide SIM cards free of charge when you sign up for any plan."
    },
    {
      question: "What networks does Dynamo use?",
      answer: "Dynamo Wireless operates on America's largest and most reliable 5G networks, ensuring you get the best coverage and fastest speeds available."
    },
    {
      question: "Are there activation fees?",
      answer: "No, we don't charge activation fees. The price you see is the price you pay - no hidden costs or surprise charges."
    },
    {
      question: "What if I travel internationally?",
      answer: "Your plan includes unlimited calling to over 100 international destinations. For data usage while traveling abroad, we offer affordable international data add-ons."
    },
    {
      question: "Can I use mobile hotspot?",
      answer: "Yes! All plans include mobile hotspot capability, allowing you to share your data connection with other devices like laptops and tablets."
    },
    {
      question: "How does the 3-month plan discount work?",
      answer: "When you prepay for 3 months of service, you get a discount on your monthly rate. The savings are automatically applied when you choose the 3-month option at checkout."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <Navbar />
      
      {/* Hero Banner */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                More Data. More Freedom.
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Affordable wireless plans starting at just $25/month. Powered by America's largest 5G networks.
              </p>
              <Button size="lg" variant="cta" className="hover-lift">
                View Plans
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Happy person using phone outdoors"
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Save with plans that fit your life.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bring your own device or buy one from us. Save more when you prepay.
            </p>
          </div>
          
          {/* Plans Grid - Same as homepage but custom heading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: '$25/mo Plan', description: 'UNLIMITED Talk & Text + 2GB Data' },
              { title: '$35/mo Plan', description: 'UNLIMITED Talk & Text + 5GB Data' },
              { title: '$45/mo Plan', description: 'UNLIMITED Talk & Text + 10GB Data' },
              { title: '$55/mo Plan', description: 'UNLIMITED Talk & Text + UNLIMITED Data' }
            ].map((plan, index) => (
              <div
                key={index}
                className="bg-background rounded-xl p-6 shadow-lg hover-scale relative text-center"
              >
                <div className="mb-4">
                  <img
                    src={planCardImage}
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

      {/* Lifestyle Banner Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="People using phones in public spaces"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Happy customers shopping and using technology"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Plan Benefits Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              All Dynamo Wireless Plans Include:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {planBenefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6 hover-scale">
                <CardContent className="pt-6">
                  <benefit.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Map Section - Use existing component */}
      <CoverageSection />

      {/* FAQ Accordion Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
      <MobileBottomBar />
      {/* Add bottom padding to prevent content from being hidden behind mobile bottom bar */}
      <div className="h-16 md:h-0" />
    </div>
  );
};

export default Plans;