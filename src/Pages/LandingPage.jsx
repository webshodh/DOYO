import React, { useState } from "react";
import {
  ChefHat,
  ArrowRight,
  CheckCircle,
  Star,
  Play,
  Menu,
  X,
  Smartphone,
  BarChart3,
  Users,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  Award,
  Globe,
  Phone,
  Mail,
} from "lucide-react";

const DOYOLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("professional");

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                DOYO
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                Reviews
              </a>
              <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-full font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg">
                Start Free Trial
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-6 space-y-4">
              <a
                href="#features"
                className="block text-gray-600 hover:text-orange-600 font-medium"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block text-gray-600 hover:text-orange-600 font-medium"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="block text-gray-600 hover:text-orange-600 font-medium"
              >
                Reviews
              </a>
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-full font-semibold">
                Start Free Trial
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-800 text-sm font-medium mb-6">
                <Zap className="w-4 h-4 mr-2" />
                #1 Restaurant Management Solution
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {" "}
                  Restaurant
                </span>
                <br />
                Into a Digital Powerhouse
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                DOYO's complete restaurant management system streamlines orders,
                manages staff, and boosts profits. Join 5,000+ successful
                restaurants already growing with us.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-xl flex items-center justify-center group">
                  Start 30-Day Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-orange-500 hover:text-orange-600 transition-all duration-200 flex items-center justify-center">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  No Setup Fees
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Cancel Anytime
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  24/7 Support
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Today's Performance
                    </h3>
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-orange-100 text-sm">Orders</p>
                      <p className="text-2xl font-bold">247</p>
                    </div>
                    <div>
                      <p className="text-orange-100 text-sm">Revenue</p>
                      <p className="text-2xl font-bold">₹45,890</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-green-800 font-medium">
                      Order #1247 - Table 5
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-800 font-medium">
                      Order #1248 - Table 2
                    </span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                      Preparing
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-800 font-medium">
                      Order #1249 - Table 8
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      New
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg">
                <Users className="w-8 h-8 text-orange-500" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-4 shadow-lg">
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-500 font-medium">
              Trusted by 5,000+ restaurants across India
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
            {/* Restaurant logos would go here */}
            <div className="h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 font-semibold">Restaurant 1</span>
            </div>
            <div className="h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 font-semibold">Restaurant 2</span>
            </div>
            <div className="h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 font-semibold">Restaurant 3</span>
            </div>
            <div className="h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 font-semibold">Restaurant 4</span>
            </div>
            <div className="h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 font-semibold">Restaurant 5</span>
            </div>
            <div className="h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 font-semibold">Restaurant 6</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Screenshots */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Restaurant
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From order management to staff coordination, DOYO provides all the
              tools you need to streamline operations and increase
              profitability.
            </p>
          </div>

          {/* Feature 1: POS System */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Multi-Device POS
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Powerful POS System That Works Everywhere
                </h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Take orders seamlessly on tablets, phones, or computers. Our
                  responsive POS system adapts to any device and works perfectly
                  in any environment - from busy dining rooms to outdoor events.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Works on tablets, phones & computers
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Real-time order synchronization
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Offline mode for uninterrupted service
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Quick order processing & billing
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2 relative">
                <div className="relative">
                  {/* Main Screenshot */}
                  <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Order #1247 - Table 5</h4>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                          Active
                        </span>
                      </div>
                      <div className="text-2xl font-bold">₹1,245</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Butter Chicken x2</span>
                        <span className="text-green-600 font-semibold">
                          ₹580
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Naan Bread x3</span>
                        <span className="text-green-600 font-semibold">
                          ₹180
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Mango Lassi x2</span>
                        <span className="text-green-600 font-semibold">
                          ₹160
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button className="bg-green-500 text-white py-3 rounded-lg font-semibold">
                        Complete Order
                      </button>
                      <button className="border-2 border-orange-500 text-orange-600 py-3 rounded-lg font-semibold">
                        Print Bill
                      </button>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg">
                    <Smartphone className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Kitchen Management */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold flex items-center">
                        <ChefHat className="w-5 h-5 mr-2" />
                        Kitchen Queue
                      </h4>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        3 Active
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                      <div>
                        <span className="font-semibold text-red-800">
                          Table 3 - Order #1251
                        </span>
                        <p className="text-sm text-red-600">
                          Prep time: 18 mins
                        </p>
                      </div>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        Priority
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                      <div>
                        <span className="font-semibold text-orange-800">
                          Table 7 - Order #1250
                        </span>
                        <p className="text-sm text-orange-600">
                          Prep time: 12 mins
                        </p>
                      </div>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        Preparing
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                      <div>
                        <span className="font-semibold text-green-800">
                          Table 1 - Order #1249
                        </span>
                        <p className="text-sm text-green-600">
                          Ready for pickup
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Ready
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Kitchen Efficiency</span>
                      <span className="text-2xl font-bold text-green-600">
                        94%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: "94%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -left-4 bg-orange-500 text-white p-3 rounded-full shadow-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-800 text-sm font-medium mb-6">
                  <ChefHat className="w-4 h-4 mr-2" />
                  Kitchen Display System
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Smart Kitchen Management That Speeds Up Service
                </h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Transform your kitchen operations with our intelligent display
                  system. Track order preparation times, manage priorities, and
                  ensure every dish is served at its peak quality.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Real-time order queue management
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Priority order highlighting
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Preparation time tracking
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Kitchen efficiency analytics
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Analytics Dashboard */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-6">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Real-Time Analytics
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Data-Driven Insights to Boost Your Profits
                </h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Make informed decisions with comprehensive analytics. Track
                  sales performance, monitor trends, and identify opportunities
                  to increase revenue and optimize operations.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Real-time sales & revenue tracking
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Popular menu item analysis
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Staff performance metrics
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">
                      Customer behavior insights
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2 relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Today's Performance
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          ₹45,890
                        </div>
                        <div className="text-blue-600 text-sm">Revenue</div>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-500 text-xs">+12.5%</span>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">
                          247
                        </div>
                        <div className="text-green-600 text-sm">Orders</div>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-500 text-xs">+8.3%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h5 className="font-semibold text-gray-800 mb-3">
                        Top Selling Items
                      </h5>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Butter Chicken</span>
                          <span className="font-semibold">32 orders</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Biryani Special</span>
                          <span className="font-semibold">28 orders</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Paneer Tikka</span>
                          <span className="font-semibold">24 orders</span>
                        </div>
                      </div>
                    </div>

                    {/* Simple Chart Representation */}
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-4 text-white">
                      <div className="flex justify-between items-center">
                        <span>Peak Hours: 12PM - 2PM</span>
                        <BarChart3 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-purple-500 text-white p-3 rounded-full shadow-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-yellow-500 text-white p-3 rounded-full shadow-lg">
                  <Star className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: "Staff Management",
                description:
                  "Manage your team efficiently with role-based access, scheduling, and performance tracking features.",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Multi-Location Support",
                description:
                  "Manage multiple restaurant locations from a single dashboard with centralized control and reporting.",
                color: "bg-red-100 text-red-600",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure & Reliable",
                description:
                  "Bank-level security with automatic backups and 99.9% uptime guarantee for your peace of mind.",
                color: "bg-indigo-100 text-indigo-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div
                  className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "5,000+", label: "Happy Restaurants" },
              { number: "40%", label: "Average Revenue Increase" },
              { number: "60%", label: "Faster Order Processing" },
              { number: "99.9%", label: "Uptime Guarantee" },
            ].map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl lg:text-5xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-orange-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Restaurant Owners Say About DOYO
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of successful restaurants already using DOYO
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                restaurant: "Spice Garden, Mumbai",
                rating: 5,
                text: "DOYO transformed our restaurant operations completely. Order processing is 60% faster and our revenue increased by 45% in just 3 months!",
                image:
                  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
              },
              {
                name: "Rajesh Kumar",
                restaurant: "Royal Feast, Delhi",
                rating: 5,
                text: "The multi-location management feature is incredible. I can monitor all my 4 restaurants from anywhere. Customer service is outstanding too!",
                image:
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
              },
              {
                name: "Anjali Patel",
                restaurant: "Cafe Delight, Bangalore",
                rating: 5,
                text: "Setup was incredibly easy and the staff learned to use it within hours. The real-time analytics help us make better business decisions daily.",
                image:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {testimonial.restaurant}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your restaurant size and needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "₹2,999",
                period: "/month",
                description: "Perfect for small cafes and food trucks",
                features: [
                  "Up to 50 orders/day",
                  "Basic POS system",
                  "Menu management",
                  "Basic reports",
                  "Email support",
                ],
                cta: "Start Free Trial",
                popular: false,
              },
              {
                name: "Professional",
                price: "₹5,999",
                period: "/month",
                description: "Ideal for growing restaurants",
                features: [
                  "Unlimited orders",
                  "Advanced POS system",
                  "Staff management",
                  "Real-time analytics",
                  "Kitchen display system",
                  "24/7 phone support",
                ],
                cta: "Start Free Trial",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "₹9,999",
                period: "/month",
                description: "For restaurant chains and large operations",
                features: [
                  "Everything in Professional",
                  "Multi-location management",
                  "Advanced analytics",
                  "Custom integrations",
                  "Dedicated account manager",
                  "Priority support",
                ],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-lg relative ${
                  plan.popular ? "ring-2 ring-orange-500 scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 rounded-full font-semibold transition-all duration-200 ${
                    plan.popular
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg"
                      : "border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join 5,000+ successful restaurants. Start your 30-day free trial
            today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-xl flex items-center">
              Start 30-Day Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all duration-200">
              Schedule Demo
            </button>
          </div>

          <p className="text-orange-100 text-sm mt-6">
            No credit card required • Setup in 5 minutes • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">DOYO</span>
              </div>
              <p className="text-gray-400 mb-6">
                The complete restaurant management solution trusted by thousands
                of restaurants across India.
              </p>
              <div className="flex space-x-4">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">+91 98765 43210</span>
              </div>
              <div className="flex space-x-4 mt-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">hello@doyo.restaurant</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Demo
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Training
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 DOYO Restaurant Management System. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DOYOLandingPage;
