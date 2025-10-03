import { useState, useEffect } from "react";
import { subscriptionServices } from "../services/api/subscriptionPlanServices";

export function useSubscriptionFeatures(hotelName) {
  const [features, setFeatures] = useState({
    // Defaults, assuming free plan with limited features
    isCustomerOrderEnable: true,
    isCaptainDashboard: false,
    isKitchenDashboard: false,
    isAnalyticsDashboard: false,
    isInventoryManagement: false,
    isTableManagement: false,
    isStaffManagement: false,
    isReportsExport: false,
    isMultiLanguage: false,
    isWhatsAppIntegration: false,
    isSmsNotifications: false,
    isEmailReports: false,
    isCustomBranding: false,
    is24x7Support: false,
    isAPIAccess: false,

    maxAdmins: 1,
    maxCategories: 5,
    maxMenuItems: 50,
    maxCaptains: 2,
    maxTables: 10,
    maxStorage: 1024, // MB
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hotelName) {
      setFeatures((f) => ({ ...f })); // keep default
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchFeatures() {
      try {
        setLoading(true);
        const subscription = await subscriptionServices.getHotelSubscription(
          hotelName
        );
        if (isMounted && subscription?.features) {
          setFeatures({
            ...features,
            ...subscription.features,
          });
        }
      } catch (err) {
        console.error("Error loading subscription features:", err);
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchFeatures();

    return () => {
      isMounted = false;
    };
  }, [hotelName]);

  return { features, loading, error };
}

//demo
// const { features, loading, error } = useSubscriptionFeatures(hotelId);

//   if (loading) return <div>Loading features...</div>;
//   if (error) return <div>Error loading features</div>;

//   return (
//     <div>
//       {/* Conditionally show features */}
//       {features.isCustomerOrderEnable && <CustomerOrderComponent />}
//       {features.isCaptainDashboard && <CaptainDashboard />}
//       {features.isKitchenDashboard && <KitchenDashboard />}

//       {/* Show limits */}
//       <p>Max Admins Allowed: {features.maxAdmins}</p>
//       <p>Max Menu Items Allowed: {features.maxMenuItems}</p>

//       {/* etc. */}
//     </div>
//   );
