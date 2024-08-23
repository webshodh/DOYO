// src/components/Slider/ImageSlider.jsx
import React from 'react';
import Slider from 'react-slick';

const ImageSlider = ({ slides }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  return (
    <div className="relative rounded-lg overflow-hidden" style={{height:'200px'}}>
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className="w-full h-full">
            <img
              src={slide.src}
              alt={slide.alt || `Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageSlider;
