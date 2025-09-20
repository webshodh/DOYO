DOYO Restaurant POS
DOYO is a full-featured, multi-role restaurant point-of-sale (POS) system built with React and Firebase Firestore. It supports Super Admin, Admin, and Captain roles, and offers robust menu management, ordering, kitchen operations, analytics, and more.

Features
Multi-hotel management for Super Admins

Admin dashboard with menu, categories, orders, captains, kitchen view, offers, options, bulk upload, and settings

Captain interface for taking orders: menu browsing, cart, checkout, bill generation, order history, print bills

User-facing menu & offers pages with advanced filters, search, and special categories

Real-time data syncing via Firestore listeners

Image uploads to Firebase Storage

Role-based route protection

Detailed form validation and error handling

Atomic design: Atoms, Molecules, Organisms, Templates

Custom React hooks for data fetching and state management

FirestoreService layer for CRUD operations

Responsive Chakra UI design theme

Toast notifications via React-Hot-Toast

Firebase emulators support for local development

Deployment to Firebase Hosting

Folder Structure
src/
├─ Atoms/ (UI primitives: Buttons, Inputs, Messages, Skeletons)
├─ Molecules/ (StatCard, MenuCard, OrderSummaryCard, CartItem, CategoryTab, etc.)
├─ Organisms/ (Navbar, Sidebar, FilterSortSearch, SpecialCategoriesFilter, DynamicTable, ProfileComponent)
├─ Templates/ (MainLayout, AuthLayout, AdminLayout, CaptainLayout, SuperAdminLayout)
├─ Pages/
│ ├─ auth/ (LoginPage, CaptainLogin)
│ ├─ admin/ (AdminDashboard, AddMenu, AddCategory, etc.)
│ ├─ captain/ (CaptainDashboard, MenuPage, CartPage, CheckoutPage, BillGenerationPage, MyOrders, etc.)
│ ├─ superadmin/ (SuperAdminDashboard, HotelManagement, AdminManagement, Subscription)
│ ├─ user/ (Home, Offers)
│ └─ screens/ (SplashScreen, NotAuthorized, NotFound, WelcomeScreen, ThankYouScreen)
├─ Hooks/ (useAuth, useCart, useHotels, useMenu, useCategory, useHomeData, useKitchenOrders, useOffers, useOption, useOrder, useCaptain)
├─ Context/ (AuthContext, CartContext, HotelContext, HotelSelectionContext)
├─ Services/
│ ├─ firebase/ (config.js, firestore.js)
│ └─ api/ (menuService, categoryService, mainCategoryService, ordersService, captainServices, hotelServices, offersService, optionService)
├─ Routes/ (AppRouter, ProtectedRoute, AdminRoutes, CaptainRoutes, SuperAdminRoutes)
├─ Utils/ (constants.js, helpers.js, validation schemas)
├─ Styles/ (theme.js, index.css, injectColors.js)
├─ Data/ (firebaseConfig for RTDB if still present)
├─ App.js
└─ index.js

Getting Started
Prerequisites
Node.js ≥ 14

npm or Yarn

Firebase project with Firestore & Storage enabled

Installation
bash
git clone https://github.com/webshodh/DOYO.git
cd DOYO
npm install
Environment Variables
Copy .env.example to .env.local and fill in your Firebase config:

text
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

REACT_APP_USE_EMULATORS=false
NODE_ENV=development

REACT_APP_NAME=DOYO Restaurant POS
REACT_APP_VERSION=1.0.0
REACT_APP_SUPER_ADMIN_EMAIL=webshodhteam@gmail.com
Development
Run Firebase emulators (optional):

bash
firebase emulators:start --only firestore,auth,storage
Start the React dev server:

bash
npm start
Open http://localhost:3000.
The app reloads on changes; lint errors will appear in the console.

Testing
bash
npm test
Build & Deploy
Build for production:

bash
npm run build
Deploy to Firebase Hosting:

bash
npm run deploy
Make sure firebase.json and .firebaserc are configured for your project.

Migration from Realtime Database to Firestore
Services updated to use Firestore (FirestoreService) instead of firebase/database.

Removed all onValue, set(ref(...)), remove(ref(...)) calls.

Firestore collections under /hotels/{hotelName}/menu, /admins, /orders, etc.

Storage and image upload remain via firebase/storage.

Technologies & Libraries
React 18, React Router 6

Firebase Firestore & Storage

Chakra UI

React-Hot-Toast

React Icons, Lucide-React

ESLint, Prettier

uid for unique IDs

Axios for HTTP requests

react-chartjs-2 for charts

react-calendar, react-slick for UI features

Contributing
Fork the repo

Create a feature branch

Commit your changes

Open a Pull Request

Please maintain code style and add tests where applicable.

Thank you for using DOYO! If you have questions or need help, open an issue on GitHub.
