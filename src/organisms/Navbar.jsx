import React, { useState } from "react";
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
      label: "Review",
      description: "Write a review on Google",
      icon: Star,
      onClick: handleReviewClick,
    },
    offers && {
      label: "Offers",
      description: "View special offers",
      icon: Gift,
      onClick: handleOfferClick,
    },
    home && {
      label: "Menu",
      description: "View menu items",
      icon: Home,
      onClick: handleHomeClick,
    },
  ].filter(Boolean);

  const socials = [
    { name: "Instagram", icon: Instagram, url: socialLinks.instagram },
    { name: "Facebook", icon: Facebook, url: socialLinks.facebook },
    { name: "Google", icon: Globe, url: socialLinks.google },
  ].filter((s) => s.url);

  return (
    <>
      {/* Main Navigation Bar */}
      <div
        className="text-orange p-2 flex justify-between items-left sticky z-50"
        style={{ background: colors.White, color: colors.Orange }}
      >
        {/* Menu Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-orange hover:bg-opacity-20 transition-all duration-200"
          title="Menu"
        >
          <Menu size={24} className="text-black-500" />
        </button>
        <h2
          className="font-semibold text-black-500"
          style={{
            marginLeft: "10px",
            paddingTop: "5px",
            color: colors.Orange,
          }}
        >
          {title}
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div
          className="p-4 border-b flex justify-between items-center"
          style={{ background: colors.Orange }}
        >
          {/* Logo */}
          <div className="flex items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ background: colors.White }}
            >
              <span style={{ color: colors.Orange }}>
                {hotelName ? hotelName.charAt(0).toUpperCase() : "H"}
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-white font-semibold text-lg">
                {hotelName || "Hotel"}
              </h3>
            </div>
          </div>
          {/* Close Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <div className="p-4 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-gray-100 transition-all duration-200 mb-3 border border-gray-200"
              >
                <Icon size={24} className="text-orange-500" />
                <div className="text-left">
                  <span className="text-lg font-medium text-gray-800">
                    {item.label}
                  </span>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Social Links */}
        {socials.length > 0 && (
          <div className="p-4 border-t flex justify-center gap-6">
            {socials.map(({ name, icon: Icon, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                title={name}
              >
                <Icon
                  size={24}
                  className="text-gray-700 hover:text-orange-500"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default NavBar;
