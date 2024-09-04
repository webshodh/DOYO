import Footer from "Atoms/Footer";
import { Navbar } from "components";
import React, { useEffect, useState } from "react";

const Offers = () => {
  

  // Slider data
  const slides = [
    {
      src: "/ads.png",
      alt: "Slide 1",
      link: "/offers/1",
    },
    {
      src: "/ads2.jpg",
      alt: "Slide 2",
      link: "/offers/2",
    },
    {
      src: "/ads.png",
      alt: "Slide 3",
      link: "/offers/3",
    },
    {
        src: "/ads2.jpg",
        alt: "Slide 2",
        link: "/offers/2",
      },
  ];

  return (
    <>
      {/* Fixed Navbar */}
      <Navbar
        title={`Offers`}
        isBack={true}
        style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
      />

      {/* Main Content Wrapper with Vertical Scroll */}
      <div className="mt-16 mb-16 px-4 h-screen overflow-y-auto">
        {/* Image Slider */}
        <div className="flex flex-col space-y-6">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg shadow-lg transform transition duration-300"
            >
              <a href={slide.link}>
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover rounded-lg"
                />
              </a>
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-lg font-semibold">
                  {slide.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Footer */}
      <Footer cartItemsCount={0} handleNext={() => console.log("Handle Next")} />
    </>
  );
};

export default Offers;
