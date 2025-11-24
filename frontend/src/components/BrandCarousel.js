import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BrandCarousel = () => {
  const scrollRef = useRef(null);

  const brands = [
    { name: "IMOU", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png" }, // Placeholder for brand logo
    { name: "Under Armour", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Under_armour_logo.svg/2560px-Under_armour_logo.svg.png" },
    { name: "Estée Lauder", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Est%C3%A9e_Lauder_Companies_Logo.svg/2560px-Est%C3%A9e_Lauder_Companies_Logo.svg.png" },
    { name: "Clinique", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Clinique_logo.svg/2560px-Clinique_logo.svg.png" },
    { name: "MAC", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/MAC_Cosmetics_logo.svg/2560px-MAC_Cosmetics_logo.svg.png" },
    { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png" },
    { name: "Adidas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/2560px-Adidas_Logo.svg.png" },
    { name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sony_logo.svg/2560px-Sony_logo.svg.png" },
    { name: "Lego", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/2048px-LEGO_logo.svg.png" },
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full bg-white py-8 mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Brands</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-600 transition-colors focus:outline-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-600 transition-colors focus:outline-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex space-x-8 overflow-x-auto scrollbar-hide py-4 items-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {brands.map((brand, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-40 h-24 flex items-center justify-center bg-white grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandCarousel;
