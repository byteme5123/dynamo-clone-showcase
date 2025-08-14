import { useTranslation } from '@/hooks/useTranslation';
import { useEffect, useState } from 'react';

const FigmaHeroSection = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3); // Cycle through 3 slides
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slides = [
    {
      image: "/lovable-uploads/f4415327-5a77-424f-b801-fa611a192866.png",
      alt: "Dynamo Wireless - Even more data promotion"
    },
    {
      image: "/lovable-uploads/abb5ee4d-66fd-40a4-8c6f-899521b74171.png", 
      alt: "Woman holding phone - Dynamo Wireless"
    },
    {
      image: "/lovable-uploads/f4415327-5a77-424f-b801-fa611a192866.png",
      alt: "Dynamo Wireless mobile plans"
    }
  ];

  return (
    <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px]">
      {/* Slider Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
              index === currentSlide
                ? 'opacity-100 scale-100 translate-x-0'
                : index < currentSlide
                ? 'opacity-0 scale-110 -translate-x-full'
                : 'opacity-0 scale-90 translate-x-full'
            }`}
          >
            <div className="w-full h-full relative">
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
              
              {/* Animated Overlay Gradient */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/10 transition-opacity duration-2000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              />
              
              {/* Floating Animation Elements */}
              <div className={`absolute top-1/4 left-1/4 w-4 h-4 bg-white/30 rounded-full transition-all duration-3000 ${
                index === currentSlide ? 'animate-pulse scale-100' : 'scale-0'
              }`} />
              
              <div className={`absolute top-3/4 right-1/3 w-6 h-6 bg-primary/20 rounded-full transition-all duration-4000 delay-500 ${
                index === currentSlide ? 'animate-bounce scale-100' : 'scale-0'
              }`} />
              
              <div className={`absolute bottom-1/3 left-1/3 w-3 h-3 bg-white/40 rounded-full transition-all duration-2500 delay-1000 ${
                index === currentSlide ? 'animate-pulse scale-100' : 'scale-0'
              }`} />
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125 shadow-lg'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Enhanced Pulsing Border Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-white to-primary opacity-30 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-white to-primary opacity-30 animate-pulse delay-1000" />
      </div>
    </section>
  );
};

export default FigmaHeroSection;