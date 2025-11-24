import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "blue dot countdown",
      discount: "60%",
      subtitle: "DEALS AT BLACK FRIDAY PRICES",
      link: "/products?sort=sale",
      imageLeft: "https://images.unsplash.com/photo-1546213290-e1f24a055438?auto=format&fit=crop&w=600&q=80", // Grill/Cooking
      imageRight: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80", // Laptop
      bgColor: "bg-gray-100"
    },
    {
      id: 2,
      title: "summer sale",
      discount: "40%",
      subtitle: "HOT DEALS FOR HOT DAYS",
      link: "/products?category=Garden,%20Pool%20&%20Patio",
      imageLeft: "https://images.unsplash.com/photo-1560529178-855a6ebcf2a9?auto=format&fit=crop&w=600&q=80", // Phone
      imageRight: "https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=600&q=80", // Outdoor
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      title: "tech week",
      discount: "25%",
      subtitle: "UPGRADE YOUR SETUP",
      link: "/products?category=Computers%20&%20Tablets",
      imageLeft: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80", // Gaming
      imageRight: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=600&q=80", // Headphones
      bgColor: "bg-indigo-50"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-white mb-8">
      {/* Slides */}
      <div 
        className="w-full h-full transition-transform duration-500 ease-in-out flex"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div 
            key={slide.id} 
            className={`w-full h-full flex-shrink-0 relative flex items-center justify-center px-4 md:px-12 ${slide.bgColor}`}
          >
            <Link to={slide.link} className="w-full h-full flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto group">
              
              {/* Left Image (Desktop) */}
              <div className="hidden md:block w-1/4 transform transition-transform group-hover:scale-105 duration-500">
                <div className="relative aspect-square rounded-full p-8 overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.5)] border-4 border-white/30 backdrop-blur-sm">
                   {/* Vibrant Sphere Background */}
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-orange-500 opacity-20 rounded-full"></div>
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)] rounded-full"></div>
                   
                   <img src={slide.imageLeft} alt="Featured Product" className="relative w-full h-full object-contain mix-blend-normal drop-shadow-2xl" />
                </div>
              </div>

              {/* Center Content */}
              <div className="flex flex-col items-center text-center z-10 md:w-1/2 space-y-6">
                <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter">
                  {slide.title}
                </h2>
                
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-gray-600 uppercase tracking-widest mb-2">up to</span>
                  <span className="text-7xl md:text-9xl font-black text-blue-600 leading-none tracking-tighter drop-shadow-sm">
                    {slide.discount}
                    <span className="text-4xl md:text-6xl ml-2 text-blue-600">OFF</span>
                  </span>
                </div>

                <div className="bg-black text-white px-8 py-3 transform skew-x-[-10deg] shadow-xl">
                  <span className="block transform skew-x-[10deg] font-bold text-lg md:text-xl tracking-widest">
                    {slide.subtitle}
                  </span>
                </div>
              </div>

              {/* Right Image (Desktop) */}
              <div className="hidden md:block w-1/4 transform transition-transform group-hover:scale-105 duration-500">
                <div className="relative aspect-square rounded-full p-8 overflow-hidden shadow-[0_0_40px_rgba(249,115,22,0.3)] border-4 border-white/30 backdrop-blur-sm">
                   {/* Vibrant Sphere Background */}
                   <div className="absolute inset-0 bg-gradient-to-bl from-orange-400 via-blue-600 to-blue-800 opacity-20 rounded-full"></div>
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.4),transparent)] rounded-full"></div>

                   <img src={slide.imageRight} alt="Featured Product" className="relative w-full h-full object-contain mix-blend-normal drop-shadow-2xl" />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110 focus:outline-none z-20"
      >
        <ChevronLeft className="w-8 h-8 text-gray-800" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110 focus:outline-none z-20"
      >
        <ChevronRight className="w-8 h-8 text-gray-800" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 right-8 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
