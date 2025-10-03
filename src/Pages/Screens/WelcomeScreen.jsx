import React, { useEffect, useState } from "react";
import { ChefHat, Sparkles, ArrowRight, Star } from "lucide-react";

const WelcomeScreen = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ee, #ff6b35, #f7931e)`,
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-red-300/30 rounded-full blur-2xl animate-pulse delay-500"></div>

        {/* Floating food icons */}
        <div className="absolute top-20 left-20 opacity-20 animate-bounce delay-200">
          <ChefHat className="w-8 h-8 text-white" />
        </div>
        <div className="absolute bottom-32 right-32 opacity-20 animate-bounce delay-700">
          <Star className="w-6 h-6 text-white" />
        </div>
        <div className="absolute top-1/2 left-16 opacity-20 animate-bounce delay-1000">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Main content */}
      <div
        className={`relative z-10 text-center text-white max-w-lg w-full transition-all duration-1000 ${
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Logo container with glassmorphism effect */}
        <div className="mb-8 relative">
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-2xl">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-64 h-auto mx-auto drop-shadow-2xl"
              />
              {/* Sparkle effect around logo */}
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-200 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse delay-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Welcome text */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-yellow-100 to-orange-100 bg-clip-text text-transparent">
              Welcome!
            </span>
          </h1>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p className="text-xl md:text-2xl font-medium mb-4 leading-relaxed">
              We're thrilled to have you here! 🎉
            </p>
            <p className="text-lg opacity-90 leading-relaxed">
              Start exploring our delicious menu and enjoy an amazing culinary
              experience!
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="mb-6">
          <button className="group bg-white text-orange-600 font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto">
            <ChefHat className="w-6 h-6" />
            <span className="text-lg">Let's Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>

        {/* Features highlights */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl mb-2">🍽️</div>
            <p className="text-sm font-medium">Fresh Menu</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-sm font-medium">Fast Service</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl mb-2">⭐</div>
            <p className="text-sm font-medium">Top Rated</p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-200"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-400"></div>
        </div>
      </div>

      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full bg-repeat bg-[size:50px_50px]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
