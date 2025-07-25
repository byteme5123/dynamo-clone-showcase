import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useTranslation } from '@/hooks/useTranslation';
import { useHeroSlides } from '@/hooks/useHeroSlides';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import slider1 from '@/assets/slider-1.jpg';
import slider2 from '@/assets/slider-2.jpg';
import slider3 from '@/assets/slider-3.jpg';

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: heroSlides, isLoading } = useHeroSlides();
  
  // Fallback slides
  const fallbackSlides = [
    { id: 1, image: slider1, heading: t('hero.slide1.heading'), subheading: t('hero.slide1.subheading'), cta: t('hero.slide1.cta'), ctaUrl: '/plans' },
    { id: 2, image: slider2, heading: t('hero.slide2.heading'), subheading: t('hero.slide2.subheading'), cta: t('hero.slide2.cta'), ctaUrl: '/plans' },
    { id: 3, image: slider3, heading: t('hero.slide3.heading'), subheading: t('hero.slide3.subheading'), cta: t('hero.slide3.cta'), ctaUrl: '/plans' }
  ];

  const slides = heroSlides?.length > 0 
    ? heroSlides.map(slide => ({ id: slide.id, image: slide.image_url, heading: slide.title, subheading: slide.subtitle, cta: slide.cta_text, ctaUrl: slide.cta_url || '/plans' }))
    : fallbackSlides;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <section className="hero-gradient py-16 md:py-24">
      <div className="container mx-auto px-4">
        <Carousel className="w-full">
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide.id}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[400px]">
                  {/* Left Content */}
                  <div className="text-white space-y-8 slide-up">
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                      {slide.heading}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90">
                      {slide.subheading}
                    </p>
                    <Button variant="hero" size="xl" className="hover-lift" asChild>
                      <Link to={slide.ctaUrl}>
                        {slide.cta}
                      </Link>
                    </Button>
                  </div>

                  {/* Right Image */}
                  <div className="flex justify-center lg:justify-end fade-in">
                    <img
                      src={slide.image}
                      alt={slide.heading}
                      className="max-w-md w-full h-auto object-cover rounded-lg"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 lg:left-8" />
          <CarouselNext className="right-4 lg:right-8" />
        </Carousel>
      </div>
    </section>
  );
};

export default HeroSection;