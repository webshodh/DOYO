import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getAuth,
  updateProfile,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { getDatabase, ref, update, get } from "firebase/database";
import { toast } from "react-toastify";
import { useHotelSelection } from "../Context/HotelSelectionContext";
import Navbar from "./NavBarComponent";
import Sidebar from "./SideBarComponent";

const Profile = () => {
  const { hotelId } = useParams();
  const auth = getAuth();
  const { selectedHotel } = useHotelSelection();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "",
    role: "",
    joinDate: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `admins/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setProfileData({
            displayName: user.displayName || "",
            email: user.email || "",
            phone: userData.phone || "",
            role: userData.role || "Admin",
            joinDate: userData.createdAt || "",
          });
        } else {
          setProfileData({
            displayName: user.displayName || "",
            email: user.email || "",
            phone: "",
            role: "Admin",
            joinDate: "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error loading profile data");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileData.email || !emailPattern.test(profileData.email)) {
      newErrors.email = "Valid email is required";
    }

    const phonePattern = /^[0-9]{10}$/;
    if (
      profileData.phone &&
      !phonePattern.test(profileData.phone.replace(/\D/g, ""))
    ) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      // Update display name
      if (profileData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: profileData.displayName,
        });
      }

      // Update email if changed
      if (profileData.email !== user.email) {
        await updateEmail(user, profileData.email);
      }

      // Update additional data in database
      const db = getDatabase();
      const userRef = ref(db, `admins/${user.uid}`);
      await update(userRef, {
        phone: profileData.phone,
        displayName: profileData.displayName,
        updatedAt: new Date().toISOString(),
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.code === "auth/requires-recent-login") {
        toast.error("Please log out and log back in to update your email");
      } else {
        toast.error("Error updating profile: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      // Update password
      await updatePassword(user, passwordData.newPassword);

      toast.success("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === "auth/requires-recent-login") {
        toast.error("Please log out and log back in to update your password");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please choose a stronger password.");
      } else {
        toast.error("Error updating password: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    if (profileData.displayName) {
      return profileData.displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase();
    }
    if (profileData.email) {
      return profileData.email.charAt(0).toUpperCase();
    }
    return "A";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Navbar */}
        <Navbar onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Profile Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md mb-6 p-6 border border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {getUserInitials()}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {profileData.displayName || "User"}
                  </h2>
                  <p className="text-gray-600">{profileData.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {profileData.role} at {selectedHotel?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "profile"
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab("password")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "password"
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Change Password
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "profile" && (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          name="displayName"
                          value={profileData.displayName}
                          onChange={handleProfileChange}
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.displayName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter your display name"
                          disabled={loading}
                        />
                        {errors.displayName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.displayName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter your email"
                          disabled={loading}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter your phone number"
                          disabled={loading}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <input
                          type="text"
                          value={profileData.role}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg font-medium ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600"
                        } text-white transition-colors duration-200`}
                      >
                        {loading ? "Updating..." : "Update Profile"}
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "password" && (
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="max-w-md space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.currentPassword
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter current password"
                          disabled={loading}
                        />
                        {errors.currentPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.currentPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.newPassword
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter new password"
                          disabled={loading}
                        />
                        {errors.newPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.newPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.confirmPassword
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Confirm new password"
                          disabled={loading}
                        />
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg font-medium ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600"
                        } text-white transition-colors duration-200`}
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
