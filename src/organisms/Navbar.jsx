import React, { useState, useEffect } from "react";
import {
  Star,
  Menu,
  X,
  Gift,
  Home,
  MessageCircle,
  Instagram,
  Facebook,
  Globe,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { colors } from "theme/theme";
import { useNavigate } from "react-router-dom";

const NavBar = ({
  title,
  hotelPlaceId,
  hotelName,
  home,
  offers,
  socialLinks = {}, // { instagram: "url", facebook: "url", google: "url" }
}) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleOfferClick = () => {
    navigate(`/viewMenu/${hotelName}/offers`);
    setIsSidebarOpen(false);
  };

  const handleHomeClick = () => {
    navigate(`/viewMenu/${hotelName}/home`);
    setIsSidebarOpen(false);
  };

  const handleReviewClick = () => {
    let reviewUrl;
    if (hotelPlaceId) {
      reviewUrl = `https://search.google.com/local/writereview?placeid=${hotelPlaceId}`;
    } else if (hotelName) {
      const encodedHotelName = encodeURIComponent(`${hotelName} reviews`);
      reviewUrl = `https://www.google.com/search?q=${encodedHotelName}`;
    } else {
      reviewUrl = `https://www.google.com/search?q=hotel+reviews`;
    }
    window.open(reviewUrl, "_blank", "noopener,noreferrer");
    setIsSidebarOpen(false);
  };

  const menuItems = [
    {
      label: "Write Review",
      description: "Share your experience on Google",
      icon: Star,
      onClick: handleReviewClick,
      gradient: "from-yellow-400 to-orange-500",
      bgHover: "hover:bg-yellow-50",
    },
    offers && {
      label: "Special Offers",
      description: "Discover amazing deals & discounts",
      icon: Gift,
      onClick: handleOfferClick,
      gradient: "from-pink-500 to-red-500",
      bgHover: "hover:bg-pink-50",
    },
    home && {
      label: "Browse Menu",
      description: "Explore our delicious menu items",
      icon: Home,
      onClick: handleHomeClick,
      gradient: "from-blue-500 to-indigo-600",
      bgHover: "hover:bg-blue-50",
    },
  ].filter(Boolean);

  const socials = [
    {
      name: "Instagram",
      icon: Instagram,
      url: socialLinks.instagram,
      color: "hover:text-pink-600 hover:bg-pink-50",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: socialLinks.facebook,
      color: "hover:text-blue-600 hover:bg-blue-50",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      name: "Website",
      icon: Globe,
      url: socialLinks.google,
      color: "hover:text-green-600 hover:bg-green-50",
      gradient: "from-green-500 to-emerald-600",
    },
  ].filter((s) => s.url);

  return (
    <>
      {/* Main Navigation Bar */}
      <div
        className={`sticky top-0 z-50 backdrop-blur-md transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 shadow-lg border-b border-orange-100"
            : "bg-white shadow-sm"
        }`}
      >
        <div className="px-4 py-3 flex justify-between items-center">
          {/* Menu Button */}
          <button
            onClick={toggleSidebar}
            className="relative p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group"
            title="Menu"
          >
            <Menu
              size={20}
              className="transition-transform group-hover:rotate-90 duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-200 -z-10" />
          </button>

          {/* Title */}
          <div className="flex-1 text-center">
            <h2 className="font-bold text-lg md:text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>

          {/* Placeholder for balance */}
          <div className="w-12" />
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-all duration-300 ease-out z-50 flex flex-col ${
          isSidebarOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0"
        }`}
        style={{ maxWidth: "320px" }}
      >
        {/* Sidebar Header */}
        <div className="relative p-6 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16" />
          </div>

          <div className="relative flex justify-between items-start">
            {/* Hotel Info */}
            <div className="flex items-center flex-1">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  <span>
                    {hotelName ? hotelName.charAt(0).toUpperCase() : "H"}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles size={10} className="text-orange-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-white font-bold text-lg leading-tight">
                  {hotelName || "Hotel"}
                </h3>
                <p className="text-white/80 text-sm">Welcome back!</p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200 group"
            >
              <X
                size={20}
                className="text-white group-hover:rotate-90 transition-transform duration-200"
              />
            </button>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl ${item.bgHover} border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group transform`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${item.gradient} text-white shadow-lg group-hover:shadow-xl transition-all duration-200`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <span className="block text-gray-900 font-semibold text-base">
                      {item.label}
                    </span>
                    <p className="text-gray-500 text-sm leading-tight mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Social Links */}
        {socials.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-center text-sm font-medium text-gray-600 mb-4">
              Connect with us
            </p>
            <div className="flex justify-center gap-4">
              {socials.map(({ name, icon: Icon, url, color, gradient }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative p-3 rounded-2xl ${color} transition-all duration-200 hover:scale-110 transform group`}
                  title={name}
                >
                  <Icon size={22} className="relative z-10" />
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-200`}
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NavBar;
