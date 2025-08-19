import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import slide1 from '../assets/images/slider1.jpg';
import slide2 from '../assets/images/slider2.jpg';
import slide3 from '../assets/images/slider1.jpg';

const slides = [
  {
    image: slide1,
    title: 'Natural Wood Veneer',
    desc: 'Elegant textures for premium interior design.',
  },
  {
    image: slide2,
    title: 'Modern Teak Finish',
    desc: 'Bring warmth and class to your space.',
  },
  {
    image: slide3,
    title: 'Luxury Walnut Paneling',
    desc: 'Sophisticated look for walls and furniture.',
  },
];

const HeroSlider = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div className="relative w-full h-[90vh]">
      {/* Custom Arrows */}
      <div
        ref={prevRef}
        className="absolute top-1/2 left-4 z-20 -translate-y-1/2 p-3 bg-black bg-opacity-40 rounded-full text-white hover:bg-opacity-70 cursor-pointer transition"
      >
        <FaChevronLeft size={20} />
      </div>
      <div
        ref={nextRef}
        className="absolute top-1/2 right-4 z-20 -translate-y-1/2 p-3 bg-black bg-opacity-40 rounded-full text-white hover:bg-opacity-70 cursor-pointer transition"
      >
        <FaChevronRight size={20} />
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000 }}
        loop
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="w-full h-full bg-cover bg-center flex items-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="bg-black bg-opacity-50 text-white p-8 rounded-xl max-w-xl ml-20 animate-fade-in-left">
                <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                <p className="text-lg">{slide.desc}</p>
                <button className="mt-6 px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition">
                  Explore Now
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSlider;
