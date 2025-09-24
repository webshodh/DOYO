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
  Bell,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Download,
  Trash2,
  LogOut,
  Key,
  MapPin,
  Clock,
  Activity,
  PieChart,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Upload,
  Edit3,
  RefreshCw,
  HelpCircle,
  FileText,
  Database,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Monitor,
  Palette,
  Languages,
  CreditCard,
  Link2,
  Share2,
  ExternalLink,
} from "lucide-react";

import { useHotelSelection } from "../context/HotelSelectionContext";
import LanguageSelector from "atoms/Selector/LanguageSelector";
import useFormValidation from "../hooks/useFormValidation";



// Enhanced Stats Card Component
const StatsCard = memo(
  ({ icon: Icon, title, value, subtitle, color = "blue", trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-${color}-50`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            {trend > 0 ? "+" : ""}
            {trend}%
          </div>
        )}
      </div>
    </div>
  )
);

StatsCard.displayName = "StatsCard";

// Enhanced Toggle Switch Component
const ToggleSwitch = memo(
  ({ enabled, onToggle, label, description, disabled = false }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          enabled ? "bg-orange-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )
);

ToggleSwitch.displayName = "ToggleSwitch";

// Enhanced Password strength indicator
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
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
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
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-2">
          <CheckCircle
            className={`w-3 h-3 ${
              password.length >= 8 ? "text-green-500" : "text-gray-300"
            }`}
          />
          <span>At least 8 characters</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle
            className={`w-3 h-3 ${
              /[A-Z]/.test(password) ? "text-green-500" : "text-gray-300"
            }`}
          />
          <span>One uppercase letter</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle
            className={`w-3 h-3 ${
              /[0-9]/.test(password) ? "text-green-500" : "text-gray-300"
            }`}
          />
          <span>One number</span>
        </div>
      </div>
    </div>
  );
});

PasswordStrength.displayName = "PasswordStrength";

// Enhanced Form field component
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
    helpText,
  }) => {
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-gray-500" />}
            <span>{label}</span>
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
            className={`w-full px-4 py-3 text-base border rounded-lg transition-all duration-200 min-h-[44px] ${
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {helpText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helpText}</p>
        )}
        {error && (
          <div className="flex items-start gap-2 mt-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {children}
      </div>
    );
  }
);

FormField.displayName = "FormField";

// Enhanced Profile header component
const ProfileHeader = memo(({ profileData, selectedHotel, onImageUpload }) => {
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
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-lg border-4 border-white/30">
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getUserInitials()
              )}
            </div>
            <button
              onClick={onImageUpload}
              className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              {profileData.displayName || "Admin User"}
            </h2>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Mail className="w-4 h-4" />
                <span className="text-white/90">{profileData.email}</span>
              </div>
              {profileData.phone && (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Phone className="w-4 h-4" />
                  <span className="text-white/90">{profileData.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <MapPin className="w-4 h-4" />
                <span className="text-white/90">
                  {profileData.location || "Location not set"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                <Shield className="w-3 h-3" />
                {profileData.role}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                <Building className="w-3 h-3" />
                {selectedHotel?.name || "No hotel selected"}
              </span>
              {profileData.joinDate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                  <Calendar className="w-3 h-3" />
                  Since {new Date(profileData.joinDate).getFullYear()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProfileHeader.displayName = "ProfileHeader";

// Enhanced Tab navigation component
const TabNavigation = memo(({ activeTab, onTabChange, tabs }) => (
  <div className="border-b border-gray-200 mb-6">
    <nav className="flex space-x-1 overflow-x-auto pb-2 -mb-px scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 flex-shrink-0 ${
            activeTab === tab.id
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </div>
        </button>
      ))}
    </nav>
  </div>
));

TabNavigation.displayName = "TabNavigation";

// Main Profile component
const EnhancedAdminProfile = memo(() => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const { selectedHotel } = useHotelSelection();

  // State management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile data state
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "",
    role: "",
    joinDate: "",
    location: "",
    profileImage: "",
    bio: "",
    timezone: "UTC",
    language: "en",
  });

  // Password data state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false,
    },
    preferences: {
      darkMode: false,
      language: "en",
      timezone: "UTC",
      currency: "USD",
      soundEnabled: true,
      autoSave: true,
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: 30,
    },
  });

  // Statistics data
  const [stats, setStats] = useState({
    totalHotels: 0,
    activeReservations: 0,
    totalRevenue: 0,
    avgRating: 0,
    totalOrders: 0,
    pendingTasks: 0,
  });

  const { errors, setError, clearError, clearAllErrors } = useFormValidation();

  // Tab configuration
  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: BarChart3 },
      { id: "profile", label: "Personal Info", icon: User },
      { id: "security", label: "Security", icon: Shield },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "preferences", label: "Preferences", icon: Settings },
      { id: "privacy", label: "Privacy", icon: Lock },
      { id: "billing", label: "Billing", icon: CreditCard },
      { id: "integrations", label: "Integrations", icon: Link2 },
      { id: "support", label: "Help & Support", icon: HelpCircle },
    ],
    []
  );

  // Load user profile and stats
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
        location: userData.location || "",
        profileImage: userData.profileImage || "",
        bio: userData.bio || "",
        timezone: userData.timezone || "UTC",
        language: userData.language || "en",
      });

      // Load settings
      if (userData.settings) {
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...userData.settings,
        }));
      }

      // Load mock statistics (replace with real data)
      setStats({
        totalHotels: 5,
        activeReservations: 23,
        totalRevenue: 125000,
        avgRating: 4.6,
        totalOrders: 156,
        pendingTasks: 8,
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

  const handleSettingChange = useCallback((category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const handleImageUpload = useCallback(() => {
    // Implement image upload logic
    toast.info("Image upload functionality coming soon!");
  }, []);

  // Form submission handlers
  const handleUpdateProfile = useCallback(
    async (e) => {
      e.preventDefault();
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

        // Update database
        const db = getDatabase();
        const userRef = ref(db, `admins/${user.uid}`);
        await update(userRef, {
          ...profileData,
          settings,
          updatedAt: new Date().toISOString(),
        });

        toast.success("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Error updating profile: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    [auth, profileData, settings]
  );

  const handleUpdatePassword = useCallback(
    async (e) => {
      e.preventDefault();
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
        } else {
          toast.error("Error updating password: " + error.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [auth, passwordData, setError]
  );

  const handleExportData = useCallback(() => {
    // Implement data export
    toast.success("Data export started. You'll receive an email when ready.");
  }, []);

  const handleDeleteAccount = useCallback(() => {
    // Implement account deletion with confirmation
    toast.error("Account deletion requires confirmation. Contact support.");
  }, []);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatsCard
                icon={Building}
                title="Total Properties"
                value={stats.totalHotels}
                subtitle="Active hotels"
                color="blue"
                trend={12}
              />
              <StatsCard
                icon={Calendar}
                title="Active Reservations"
                value={stats.activeReservations}
                subtitle="This month"
                color="green"
                trend={8}
              />
              <StatsCard
                icon={DollarSign}
                title="Total Revenue"
                value={`$${(stats.totalRevenue / 1000).toFixed(1)}K`}
                subtitle="This year"
                color="purple"
                trend={15}
              />
              <StatsCard
                icon={Star}
                title="Average Rating"
                value={stats.avgRating}
                subtitle="Customer satisfaction"
                color="yellow"
                trend={2}
              />
              <StatsCard
                icon={Users}
                title="Total Orders"
                value={stats.totalOrders}
                subtitle="All time"
                color="indigo"
                trend={-3}
              />
              <StatsCard
                icon={Clock}
                title="Pending Tasks"
                value={stats.pendingTasks}
                subtitle="Requires attention"
                color="red"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  {
                    action: "Updated hotel settings",
                    time: "2 hours ago",
                    type: "settings",
                  },
                  {
                    action: "New booking received",
                    time: "4 hours ago",
                    type: "booking",
                  },
                  {
                    action: "Profile updated",
                    time: "1 day ago",
                    type: "profile",
                  },
                  {
                    action: "Password changed",
                    time: "3 days ago",
                    type: "security",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "booking"
                          ? "bg-green-100"
                          : activity.type === "security"
                          ? "bg-red-100"
                          : activity.type === "settings"
                          ? "bg-blue-100"
                          : "bg-purple-100"
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "profile":
        return (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                label="Display Name"
                name="displayName"
                value={profileData.displayName}
                onChange={handleProfileChange}
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
                onChange={handleProfileChange}
                error={errors.email}
                placeholder="Enter your email"
                disabled={loading}
                icon={Mail}
                required
                helpText="Email changes require verification"
              />
              <FormField
                label="Phone Number"
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                error={errors.phone}
                placeholder="Enter your phone number"
                disabled={loading}
                icon={Phone}
              />
              <FormField
                label="Location"
                name="location"
                value={profileData.location}
                onChange={handleProfileChange}
                placeholder="Enter your location"
                disabled={loading}
                icon={MapPin}
              />
            </div>

            <FormField
              label="Bio"
              name="bio"
              value={profileData.bio}
              onChange={handleProfileChange}
              placeholder="Tell us about yourself"
              disabled={loading}
              icon={FileText}
              helpText="Brief description about yourself (optional)"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
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
        );

      case "security":
        return (
          <div className="space-y-8">
            {/* Password Change */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Change Password
              </h3>
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="max-w-md space-y-4">
                  <FormField
                    label="Current Password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    error={errors.currentPassword}
                    placeholder="Enter current password"
                    disabled={loading}
                    icon={Lock}
                    required
                    showPasswordToggle
                    showPassword={showPasswords.current}
                    onPasswordToggle={() => togglePasswordVisibility("current")}
                  />
                  <FormField
                    label="New Password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    error={errors.newPassword}
                    placeholder="Enter new password"
                    disabled={loading}
                    icon={Lock}
                    required
                    showPasswordToggle
                    showPassword={showPasswords.new}
                    onPasswordToggle={() => togglePasswordVisibility("new")}
                  >
                    <PasswordStrength password={passwordData.newPassword} />
                  </FormField>
                  <FormField
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={errors.confirmPassword}
                    placeholder="Confirm new password"
                    disabled={loading}
                    icon={Lock}
                    required
                    showPasswordToggle
                    showPassword={showPasswords.confirm}
                    onPasswordToggle={() => togglePasswordVisibility("confirm")}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
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
              </form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Two-Factor Authentication
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  enabled={settings.security.twoFactorEnabled}
                  onToggle={() =>
                    handleSettingChange(
                      "security",
                      "twoFactorEnabled",
                      !settings.security.twoFactorEnabled
                    )
                  }
                  label="Enable Two-Factor Authentication"
                  description="Add an extra layer of security to your account"
                />
                {settings.security.twoFactorEnabled && (
                  <div className="ml-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-3">
                      Two-factor authentication is enabled. You'll need your
                      authenticator app to log in.
                    </p>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View Recovery Codes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Login Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Login Security
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  enabled={settings.security.loginAlerts}
                  onToggle={() =>
                    handleSettingChange(
                      "security",
                      "loginAlerts",
                      !settings.security.loginAlerts
                    )
                  }
                  label="Login Alerts"
                  description="Get notified when someone logs into your account"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Session Timeout (minutes)"
                    type="number"
                    name="sessionTimeout"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "sessionTimeout",
                        parseInt(e.target.value)
                      )
                    }
                    placeholder="30"
                    icon={Clock}
                    helpText="Auto-logout after inactivity"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Email Notifications
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  enabled={settings.notifications.email}
                  onToggle={() =>
                    handleSettingChange(
                      "notifications",
                      "email",
                      !settings.notifications.email
                    )
                  }
                  label="Email Notifications"
                  description="Receive notifications via email"
                />
                <ToggleSwitch
                  enabled={settings.notifications.marketing}
                  onToggle={() =>
                    handleSettingChange(
                      "notifications",
                      "marketing",
                      !settings.notifications.marketing
                    )
                  }
                  label="Marketing Emails"
                  description="Receive marketing and promotional emails"
                />
              </div>
            </div>

            {/* Mobile Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mobile Notifications
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  enabled={settings.notifications.push}
                  onToggle={() =>
                    handleSettingChange(
                      "notifications",
                      "push",
                      !settings.notifications.push
                    )
                  }
                  label="Push Notifications"
                  description="Receive push notifications on mobile devices"
                />
                <ToggleSwitch
                  enabled={settings.notifications.sms}
                  onToggle={() =>
                    handleSettingChange(
                      "notifications",
                      "sms",
                      !settings.notifications.sms
                    )
                  }
                  label="SMS Notifications"
                  description="Receive important alerts via SMS"
                />
              </div>
            </div>

            {/* Notification Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notification Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    key: "bookings",
                    label: "New Bookings",
                    desc: "When new reservations are made",
                  },
                  {
                    key: "payments",
                    label: "Payment Updates",
                    desc: "Payment confirmations and failures",
                  },
                  {
                    key: "reviews",
                    label: "New Reviews",
                    desc: "When customers leave reviews",
                  },
                  {
                    key: "system",
                    label: "System Updates",
                    desc: "Important system notifications",
                  },
                ].map((item) => (
                  <ToggleSwitch
                    key={item.key}
                    enabled={true}
                    onToggle={() => {}}
                    label={item.label}
                    description={item.desc}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            {/* Appearance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Appearance
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  enabled={settings.preferences.darkMode}
                  onToggle={() =>
                    handleSettingChange(
                      "preferences",
                      "darkMode",
                      !settings.preferences.darkMode
                    )
                  }
                  label="Dark Mode"
                  description="Use dark theme across the application"
                />
                <LanguageSelector/>
              </div>
            </div>

            {/* System Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Preferences
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  enabled={settings.preferences.soundEnabled}
                  onToggle={() =>
                    handleSettingChange(
                      "preferences",
                      "soundEnabled",
                      !settings.preferences.soundEnabled
                    )
                  }
                  label="Sound Effects"
                  description="Play sounds for notifications and actions"
                />
                <ToggleSwitch
                  enabled={settings.preferences.autoSave}
                  onToggle={() =>
                    handleSettingChange(
                      "preferences",
                      "autoSave",
                      !settings.preferences.autoSave
                    )
                  }
                  label="Auto-save"
                  description="Automatically save changes as you work"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={settings.preferences.currency}
                    onChange={(e) =>
                      handleSettingChange(
                        "preferences",
                        "currency",
                        e.target.value
                      )
                    }
                    className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            {/* Profile Visibility */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Visibility
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  enabled={settings.privacy.profileVisible}
                  onToggle={() =>
                    handleSettingChange(
                      "privacy",
                      "profileVisible",
                      !settings.privacy.profileVisible
                    )
                  }
                  label="Public Profile"
                  description="Make your profile visible to other users"
                />
                <ToggleSwitch
                  enabled={settings.privacy.showEmail}
                  onToggle={() =>
                    handleSettingChange(
                      "privacy",
                      "showEmail",
                      !settings.privacy.showEmail
                    )
                  }
                  label="Show Email"
                  description="Display email address on your public profile"
                />
                <ToggleSwitch
                  enabled={settings.privacy.showPhone}
                  onToggle={() =>
                    handleSettingChange(
                      "privacy",
                      "showPhone",
                      !settings.privacy.showPhone
                    )
                  }
                  label="Show Phone"
                  description="Display phone number on your public profile"
                />
              </div>
            </div>

            {/* Data & Privacy */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Data & Privacy
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Download Your Data
                    </h4>
                    <p className="text-sm text-gray-500">
                      Get a copy of all your data
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "billing":
        return (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Plan
              </h3>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      Professional Plan
                    </h4>
                    <p className="text-gray-600">
                      Perfect for growing businesses
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      $99/month
                    </p>
                    <p className="text-sm text-gray-500">Billed monthly</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">5</p>
                    <p className="text-sm text-gray-600">Properties</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">∞</p>
                    <p className="text-sm text-gray-600">Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">24/7</p>
                    <p className="text-sm text-gray-600">Support</p>
                  </div>
                </div>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg transition-colors">
                  Manage Subscription
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Method
              </h3>
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  VISA
                </div>
                <div className="flex-1">
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/26</p>
                </div>
                <button className="text-orange-600 hover:text-orange-800 font-medium">
                  Update
                </button>
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Billing History
              </h3>
              <div className="space-y-3">
                {[
                  { date: "2024-01-01", amount: "$99.00", status: "Paid" },
                  { date: "2023-12-01", amount: "$99.00", status: "Paid" },
                  { date: "2023-11-01", amount: "$99.00", status: "Paid" },
                ].map((invoice, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{invoice.date}</p>
                      <p className="text-sm text-gray-500">Professional Plan</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{invoice.amount}</p>
                      <p className="text-sm text-green-600">{invoice.status}</p>
                    </div>
                    <button className="text-orange-600 hover:text-orange-800 text-sm">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-6">
            {/* Connected Apps */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Connected Applications
              </h3>
              <div className="space-y-4">
                {[
                  {
                    name: "Google Calendar",
                    icon: Calendar,
                    connected: true,
                    desc: "Sync bookings with your calendar",
                  },
                  {
                    name: "Slack",
                    icon: Bell,
                    connected: false,
                    desc: "Get notifications in Slack",
                  },
                  {
                    name: "WhatsApp Business",
                    icon: Phone,
                    connected: true,
                    desc: "Send booking confirmations via WhatsApp",
                  },
                  {
                    name: "Stripe",
                    icon: CreditCard,
                    connected: true,
                    desc: "Process payments securely",
                  },
                ].map((app, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <app.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {app.name}
                        </h4>
                        <p className="text-sm text-gray-500">{app.desc}</p>
                      </div>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        app.connected
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-orange-600 text-white hover:bg-orange-700"
                      }`}
                    >
                      {app.connected ? "Connected" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* API Keys */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                API Access
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">API Key</h4>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 font-mono bg-white p-2 rounded border">
                    sk_test_4eC39HqLyjWDarjtT1zdp7dc
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Regenerate
                    </button>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "support":
        return (
          <div className="space-y-6">
            {/* Quick Help */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Help
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Getting Started",
                    desc: "Learn the basics",
                    icon: HelpCircle,
                  },
                  {
                    title: "API Documentation",
                    desc: "Developer resources",
                    icon: FileText,
                  },
                  {
                    title: "Video Tutorials",
                    desc: "Step-by-step guides",
                    icon: Monitor,
                  },
                  {
                    title: "Community Forum",
                    desc: "Connect with others",
                    icon: Users,
                  },
                ].map((item, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-3 p-4 text-left border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Support
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <Mail className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Email Support</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      We'll respond within 24 hours
                    </p>
                    <button className="text-orange-600 hover:text-orange-800 font-medium">
                      Send Email
                    </button>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <Phone className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Phone Support</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Available 9 AM - 6 PM PST
                    </p>
                    <button className="text-orange-600 hover:text-orange-800 font-medium">
                      Call Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                {[
                  { service: "API", status: "operational", uptime: "99.9%" },
                  {
                    service: "Dashboard",
                    status: "operational",
                    uptime: "99.8%",
                  },
                  {
                    service: "Payments",
                    status: "operational",
                    uptime: "100%",
                  },
                  {
                    service: "Notifications",
                    status: "degraded",
                    uptime: "98.5%",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          item.status === "operational"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <span className="font-medium text-gray-900">
                        {item.service}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        {item.uptime} uptime
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 py-4 sm:px-2 lg:px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account settings, preferences, and security options
          </p>
        </div>

        {/* Profile Header */}
        <div className="mb-8">
          <ProfileHeader
            profileData={profileData}
            selectedHotel={selectedHotel}
            onImageUpload={handleImageUpload}
          />
        </div>

        {/* Main Content */}
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
          <div className="px-6 pb-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
});

EnhancedAdminProfile.displayName = "EnhancedAdminProfile";

export default EnhancedAdminProfile;
