// pages/BillGenerationPage.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { ref, get } from "firebase/database";
import { db } from "../../services/firebase/firebaseConfig";
import { Search, Receipt, AlertCircle } from "lucide-react";

const BillGenerationPage = () => {
  const [tableNumber, setTableNumber] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { hotelName } = useParams();

  const searchSession = async () => {
    if (!tableNumber.trim()) {
      setError("Please enter table number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Get active session for table
      const sessionsRef = ref(db, `/hotels/${hotelName}/table_sessions`);
      const sessionsSnapshot = await get(sessionsRef);

      if (!sessionsSnapshot.exists()) {
        setError("No sessions found for this table");
        setSessionData(null);
        return;
      }

      const sessions = sessionsSnapshot.val();
      const activeSession = Object.values(sessions).find(
        (session) =>
          session.tableNumber === parseInt(tableNumber) &&
          session.status === "active"
      );

      if (!activeSession) {
        setError("No active session found for this table");
        setSessionData(null);
        return;
      }

      // Get orders for session
      const ordersRef = ref(db, `/hotels/${hotelName}/orders`);
      const ordersSnapshot = await get(ordersRef);

      let sessionOrders = [];
      if (ordersSnapshot.exists()) {
        const orders = ordersSnapshot.val();
        sessionOrders = Object.values(orders)
          .filter((order) => order.sessionId === activeSession.sessionId)
          .sort((a, b) => a.orderSequence - b.orderSequence);
      }

      setSessionData({
        session: activeSession,
        orders: sessionOrders,
      });
    } catch (error) {
      console.error("Error searching session:", error);
      setError("Failed to search session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = (billData) => {
    // Implementation for printing
    console.log("Printing bill:", billData);
    window.print();
  };

  const handleDownload = (billData) => {
    // Implementation for downloading PDF
    console.log("Downloading bill:", billData);
  };

  const handleShare = (billData) => {
    // Implementation for sharing
    console.log("Sharing bill:", billData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Receipt size={24} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Bill Generation
            </h1>
          </div>

          {/* Search Form */}
          <div className="flex gap-3">
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Enter table number"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
            <button
              onClick={searchSession}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search Session
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        {/* No Results */}
        {!sessionData && !isLoading && tableNumber && !error && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Receipt size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No Session Found
            </h3>
            <p className="text-gray-500">
              No active session found for table {tableNumber}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillGenerationPage;
