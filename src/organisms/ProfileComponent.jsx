import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAuth,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getDatabase, ref, update, get } from "firebase/database";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  Building,
  AlertCircle,
  CheckCircle,
  Loader,
  Camera,
  Settings,
} from "lucide-react";

import { useHotelSelection } from "../context/HotelSelectionContext";
import Navbar from "./NavBarComponent";
import Sidebar from "./SideBarComponent";

// Custom hook for form validation
const useFormValidation = (initialErrors = {}) => {
  const [errors, setErrors] = useState(initialErrors);

  const setError = useCallback((field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return { errors, setError, clearError, clearAllErrors, hasErrors };
};

// Password strength indicator component
const PasswordStrength = memo(({ password }) => {
  const strength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const getStrengthText = () => {
    switch (strength) {
      case 0:
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
      case 5:
        return "Strong";
      default:
        return "Weak";
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span
          className={`text-xs font-medium ${
            strength >= 4
              ? "text-green-600"
              : strength >= 3
              ? "text-blue-600"
              : strength >= 2
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {getStrengthText()}
        </span>
      </div>
    </div>
  );
});

PasswordStrength.displayName = "PasswordStrength";

// Form field component
const FormField = memo(
  ({
    label,
    type = "text",
    name,
    value,
    onChange,
    error,
    placeholder,
    disabled = false,
    icon: Icon,
    required = false,
    showPasswordToggle = false,
    onPasswordToggle,
    showPassword = false,
    children,
    className = "",
  }) => {
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-gray-500" />}
            {label}
            {required && <span className="text-red-500">*</span>}
          </div>
        </label>
        <div className="relative">
          <input
            type={
              showPasswordToggle ? (showPassword ? "text" : "password") : type
            }
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
              disabled
                ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                : "bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            } ${
              error
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onPasswordToggle}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        {children}
      </div>
    );
  }
);

FormField.displayName = "FormField";

// Profile header component
const ProfileHeader = memo(({ profileData, selectedHotel }) => {
  const getUserInitials = useCallback(() => {
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
  }, [profileData]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {getUserInitials()}
          </div>
          <button className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Camera className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {profileData.displayName || "User"}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600 mb-2">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Mail className="w-4 h-4" />
              <span>{profileData.email}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Shield className="w-4 h-4" />
              <span>{profileData.role}</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Building className="w-4 h-4" />
              <span>{selectedHotel?.name || "No hotel selected"}</span>
            </div>
            {profileData.joinDate && (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Calendar className="w-4 h-4" />
                <span>
                  Joined {new Date(profileData.joinDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ProfileHeader.displayName = "ProfileHeader";

// Tab navigation component
const TabNavigation = memo(({ activeTab, onTabChange, tabs }) => (
  <div className="border-b border-gray-200 mb-6">
    <nav className="flex space-x-8 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
            activeTab === tab.id
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </div>
        </button>
      ))}
    </nav>
  </div>
));

TabNavigation.displayName = "TabNavigation";

// Profile form component
const ProfileForm = memo(
  ({ profileData, onChange, onSubmit, loading, errors }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Display Name"
          type="text"
          name="displayName"
          value={profileData.displayName}
          onChange={onChange}
          error={errors.displayName}
          placeholder="Enter your display name"
          disabled={loading}
          icon={User}
          required
        />

        <FormField
          label="Email Address"
          type="email"
          name="email"
          value={profileData.email}
          onChange={onChange}
          error={errors.email}
          placeholder="Enter your email"
          disabled={loading}
          icon={Mail}
          required
        />

        <FormField
          label="Phone Number"
          type="tel"
          name="phone"
          value={profileData.phone}
          onChange={onChange}
          error={errors.phone}
          placeholder="Enter your phone number"
          disabled={loading}
          icon={Phone}
        />

        <FormField
          label="Role"
          type="text"
          name="role"
          value={profileData.role}
          onChange={() => {}}
          disabled={true}
          icon={Shield}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Update Profile
            </>
          )}
        </button>
      </div>
    </form>
  )
);

ProfileForm.displayName = "ProfileForm";

// Password form component
const PasswordForm = memo(
  ({
    passwordData,
    onChange,
    onSubmit,
    loading,
    errors,
    showPasswords,
    onTogglePassword,
  }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="max-w-md space-y-6">
        <FormField
          label="Current Password"
          name="currentPassword"
          value={passwordData.currentPassword}
          onChange={onChange}
          error={errors.currentPassword}
          placeholder="Enter current password"
          disabled={loading}
          icon={Lock}
          required
          showPasswordToggle
          showPassword={showPasswords.current}
          onPasswordToggle={() => onTogglePassword("current")}
        />

        <FormField
          label="New Password"
          name="newPassword"
          value={passwordData.newPassword}
          onChange={onChange}
          error={errors.newPassword}
          placeholder="Enter new password"
          disabled={loading}
          icon={Lock}
          required
          showPasswordToggle
          showPassword={showPasswords.new}
          onPasswordToggle={() => onTogglePassword("new")}
        >
          <PasswordStrength password={passwordData.newPassword} />
        </FormField>

        <FormField
          label="Confirm New Password"
          name="confirmPassword"
          value={passwordData.confirmPassword}
          onChange={onChange}
          error={errors.confirmPassword}
          placeholder="Confirm new password"
          disabled={loading}
          icon={Lock}
          required
          showPasswordToggle
          showPassword={showPasswords.confirm}
          onPasswordToggle={() => onTogglePassword("confirm")}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Update Password
            </>
          )}
        </button>
      </div>
    </form>
  )
);

PasswordForm.displayName = "PasswordForm";

// Main Profile component
const Profile = memo(() => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const { selectedHotel } = useHotelSelection();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

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

  const { errors, setError, clearError, clearAllErrors } = useFormValidation();

  // Tab configuration
  const tabs = useMemo(
    () => [
      { id: "profile", label: "Profile Information", icon: User },
      { id: "password", label: "Change Password", icon: Lock },
      { id: "settings", label: "Account Settings", icon: Settings },
    ],
    []
  );

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const db = getDatabase();
      const userRef = ref(db, `admins/${user.uid}`);
      const snapshot = await get(userRef);

      const userData = snapshot.exists() ? snapshot.val() : {};

      setProfileData({
        displayName: user.displayName || "",
        email: user.email || "",
        phone: userData.phone || "",
        role: userData.role || "Admin",
        joinDate: userData.createdAt || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error loading profile data");
    }
  }, [auth, navigate]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Event handlers
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleProfileChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setProfileData((prev) => ({ ...prev, [name]: value }));
      clearError(name);
    },
    [clearError]
  );

  const handlePasswordChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setPasswordData((prev) => ({ ...prev, [name]: value }));
      clearError(name);
    },
    [clearError]
  );

  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // Validation functions
  const validateProfileForm = useCallback(() => {
    clearAllErrors();
    let isValid = true;

    if (!profileData.displayName.trim()) {
      setError("displayName", "Display name is required");
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileData.email || !emailPattern.test(profileData.email)) {
      setError("email", "Valid email is required");
      isValid = false;
    }

    if (
      profileData.phone &&
      !/^[0-9]{10}$/.test(profileData.phone.replace(/\D/g, ""))
    ) {
      setError("phone", "Please enter a valid 10-digit phone number");
      isValid = false;
    }

    return isValid;
  }, [profileData, setError, clearAllErrors]);

  const validatePasswordForm = useCallback(() => {
    clearAllErrors();
    let isValid = true;

    if (!passwordData.currentPassword) {
      setError("currentPassword", "Current password is required");
      isValid = false;
    }

    if (!passwordData.newPassword) {
      setError("newPassword", "New password is required");
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      setError("newPassword", "Password must be at least 6 characters");
      isValid = false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("confirmPassword", "Passwords do not match");
      isValid = false;
    }

    return isValid;
  }, [passwordData, setError, clearAllErrors]);

  // Form submission handlers
  const handleUpdateProfile = useCallback(
    async (e) => {
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
    },
    [auth, profileData, validateProfileForm]
  );

  const handleUpdatePassword = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validatePasswordForm()) return;

      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");

        // Reauthenticate user
        const credential = EmailAuthProvider.credential(
          user.email,
          passwordData.currentPassword
        );
        await reauthenticateWithCredential(user, credential);

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
        if (error.code === "auth/wrong-password") {
          setError("currentPassword", "Current password is incorrect");
        } else if (error.code === "auth/weak-password") {
          setError(
            "newPassword",
            "Password is too weak. Please choose a stronger password."
          );
        } else {
          toast.error("Error updating password: " + error.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [auth, passwordData, validatePasswordForm, setError]
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Navbar */}
        <Navbar
          onMenuToggle={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          admin={true}
        />

        {/* Profile Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>

            {/* Profile Header */}
            <ProfileHeader
              profileData={profileData}
              selectedHotel={selectedHotel}
            />

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Tab Navigation */}
              <div className="px-6 pt-6">
                <TabNavigation
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  tabs={tabs}
                />
              </div>

              {/* Tab Content */}
              <div className="px-6 pb-6">
                {activeTab === "profile" && (
                  <ProfileForm
                    profileData={profileData}
                    onChange={handleProfileChange}
                    onSubmit={handleUpdateProfile}
                    loading={loading}
                    errors={errors}
                  />
                )}

                {activeTab === "password" && (
                  <PasswordForm
                    passwordData={passwordData}
                    onChange={handlePasswordChange}
                    onSubmit={handleUpdatePassword}
                    loading={loading}
                    errors={errors}
                    showPasswords={showPasswords}
                    onTogglePassword={togglePasswordVisibility}
                  />
                )}

                {activeTab === "settings" && (
                  <div className="py-8 text-center text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Account settings coming soon...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
});

Profile.displayName = "Profile";

export default Profile;
