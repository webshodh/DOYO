// src/components/Navbar.jsx

import React, { useState, useCallback, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import {
  Menu,
  X,
  Building,
  ChevronDown,
  Check,
  Loader,
  LogOut,
  User,
} from "lucide-react";
import { useHotelSelection } from "../context/HotelSelectionContext";
import { toast } from "react-toastify";
import useOutsideClick from "hooks/useOutsideClick";
import LanguageSelector from "atoms/Selector/LanguageSelector";
import MenuToggleButton from "../atoms/Buttons/MenuToggleButton";
import HotelSwitcher from "../atoms/HotelSwitcher";
import ProfileDropdown from "../atoms/ProfileDropdown";

function Navbar({ onMenuToggle, isSidebarOpen, admin }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const { selectedHotel, availableHotels, selectHotel, user } =
    useHotelSelection(); // assume this is memoized internally

  const [profileOpen, setProfileOpen] = useState(false);
  const [hotelOpen, setHotelOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef(null);
  const hotelRef = useRef(null);

  useOutsideClick(profileRef, () => setProfileOpen(false));
  useOutsideClick(hotelRef, () => setHotelOpen(false));

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Error logging out");
    } finally {
      setLoggingOut(false);
      setProfileOpen(false);
    }
  }, [auth, navigate]);

  const handleEditProfile = useCallback(() => {
    setProfileOpen(false);
    if (selectedHotel?.id) {
      navigate(`/${selectedHotel.id}/admin/profile`);
    }
  }, [navigate, selectedHotel?.id]);

  const handleHotelSwitch = useCallback(
    (hotel) => {
      selectHotel(hotel);
      setHotelOpen(false);
      navigate(`/${hotel.id}/admin/dashboard`);
      toast.success(`Switched to ${hotel.name}`);
    },
    [selectHotel, navigate]
  );

  const toggleProfile = useCallback(() => {
    setProfileOpen((v) => !v);
    setHotelOpen(false);
  }, []);

  const toggleHotel = useCallback(() => {
    setHotelOpen((v) => !v);
    setProfileOpen(false);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-16 justify-between">
        <MenuToggleButton onToggle={onMenuToggle} isOpen={isSidebarOpen} />

        <div className="flex items-center gap-4">
          {admin && availableHotels.length > 1 && (
            <HotelSwitcher
              ref={hotelRef}
              selectedHotel={selectedHotel}
              availableHotels={availableHotels}
              onHotelSwitch={handleHotelSwitch}
              isOpen={hotelOpen}
              onToggle={toggleHotel}
            />
          )}

          <ProfileDropdown
            ref={profileRef}
            user={user}
            isOpen={profileOpen}
            onToggle={toggleProfile}
            onEditProfile={handleEditProfile}
            onLogout={handleLogout}
            isLoggingOut={loggingOut}
          />
        </div>
      </div>
    </nav>
  );
}

export default memo(Navbar);
