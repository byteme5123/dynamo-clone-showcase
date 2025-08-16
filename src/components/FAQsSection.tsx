import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useFAQs } from '@/hooks/useFAQs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FAQsSection = () => {
  const { data: faqs, isLoading } = useFAQs();

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-300 rounded w-48 mx-auto animate-pulse mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Take first 8 FAQs for homepage
  const homepageFAQs = faqs.slice(0, 8);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Got questions? We've got answers. Find quick solutions to common questions about our wireless plans and services.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {homepageFAQs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-black hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* View More Button */}
          {faqs.length > 8 && (
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link to="/contact">
                  View All FAQs
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQsSection;