import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useTranslation } from '@/hooks/useTranslation';
import slider1 from '@/assets/slider-1.jpg';
import slider2 from '@/assets/slider-2.jpg';
import slider3 from '@/assets/slider-3.jpg';

const HeroSection = () => {
  const { t } = useTranslation();
  
  const slides = [
    {
      id: 1,
      image: slider1,
      heading: t('hero.slide1.heading'),
      subheading: t('hero.slide1.subheading'),
      cta: t('hero.slide1.cta')
    },
    {
      id: 2,
      image: slider2,
      heading: t('hero.slide2.heading'),
      subheading: t('hero.slide2.subheading'),
      cta: t('hero.slide2.cta')
    },
    {
      id: 3,
      image: slider3,
      heading: t('hero.slide3.heading'),
      subheading: t('hero.slide3.subheading'),
      cta: t('hero.slide3.cta')
    }
  ];

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
                    <Button variant="hero" size="xl" className="hover-lift">
                      {slide.cta}
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