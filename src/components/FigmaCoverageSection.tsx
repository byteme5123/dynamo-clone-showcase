const FigmaCoverageSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-black">
              America's Largest 5G networks.
            </h2>
            
            <p className="text-gray-600 text-base leading-relaxed">
              Experience blazing-fast 5G speeds with our nationwide coverage. 
              Stay connected wherever you go with reliable service across the country.
            </p>
            
            {/* Statistics */}
            <div className="space-y-6">
              <div>
                <div className="text-4xl font-bold text-primary mb-1">98%</div>
                <div className="text-gray-600 text-sm">Population Coverage</div>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-primary mb-1">300+</div>
                <div className="text-gray-600 text-sm">Cities nationwide</div>
              </div>
            </div>
          </div>

          {/* Right Column - USA Map */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Red USA Map Silhouette with 5G Text */}
              <div className="w-80 h-64 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <div className="text-white text-6xl font-bold tracking-wider">
                  5G
                </div>
              </div>
              
              {/* Optional: Add subtle shadow/glow effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl -z-10 scale-110"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FigmaCoverageSection;