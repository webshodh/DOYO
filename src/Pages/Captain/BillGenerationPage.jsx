// src/Pages/Captain/BillGenerationPage.jsx
import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc,
  orderBy as firestoreOrderBy
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { Search, Receipt, AlertCircle, Download, Share2, Printer, Clock, User } from "lucide-react";

// ✅ NEW: Import Firestore-based hooks
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";
import LoadingSpinner from "../../atoms/LoadingSpinner";

// ✅ NEW: Import bill components (you may need to create these)
import BillPreview from "../../components/bill/BillPreview";
import BillActions from "../../components/bill/BillActions";

const BillGenerationPage = () => {
  const [tableNumber, setTableNumber] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);

  const { hotelName } = useParams();
  
  // ✅ NEW: Use context hooks
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // ✅ ENHANCED: Get hotel ID with fallbacks
  const hotelId = useMemo(() => {
    return selectedHotel?.id || hotelName;
  }, [selectedHotel, hotelName]);

  // ✅ ENHANCED: Search session with Firestore
  const searchSession = useCallback(async () => {
    if (!tableNumber.trim()) {
      setError("Please enter table number");
      return;
    }

    if (!hotelId) {
      setError("Hotel information not available");
      return;
    }

    setIsLoading(true);
    setError("");
    setSearchPerformed(true);
    setSessionData(null);

    try {
      console.log(`Searching for table ${tableNumber} in hotel ${hotelId}`);

      // ✅ FIRESTORE: Search for active table sessions
      const sessionsRef = collection(db, 'tableSessions');
      const sessionsQuery = query(
        sessionsRef,
        where('hotelId', '==', hotelId),
        where('tableNumber', '==', parseInt(tableNumber)),
        where('status', '==', 'active'),
        firestoreOrderBy('createdAt', 'desc')
      );

      const sessionsSnapshot = await getDocs(sessionsQuery);

      if (sessionsSnapshot.empty) {
        setError("No active session found for this table");
        setSessionData(null);
        return;
      }

      // Get the most recent active session
      const sessionDoc = sessionsSnapshot.docs[0];
      const activeSession = {
        id: sessionDoc.id,
        ...sessionDoc.data()
      };

      console.log("Found active session:", activeSession);

      // ✅ FIRESTORE: Get orders for this session
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(
        ordersRef,
        where('hotelId', '==', hotelId),
        where('sessionId', '==', activeSession.id),
        firestoreOrderBy('createdAt', 'asc')
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      
      const sessionOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to dates
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));

      console.log(`Found ${sessionOrders.length} orders for session`);

      // ✅ NEW: Get captain/waiter details if available
      let captainData = null;
      if (activeSession.captainId) {
        try {
          const captainDoc = await getDoc(doc(db, 'captains', activeSession.captainId));
          if (captainDoc.exists()) {
            captainData = {
              id: captainDoc.id,
              ...captainDoc.data()
            };
          }
        } catch (captainError) {
          console.warn("Could not fetch captain data:", captainError);
        }
      }

      // ✅ NEW: Get hotel details for bill
      let hotelData = selectedHotel;
      if (!hotelData) {
        try {
          const hotelDoc = await getDoc(doc(db, 'hotels', hotelId));
          if (hotelDoc.exists()) {
            hotelData = {
              id: hotelDoc.id,
              ...hotelDoc.data()
            };
          }
        } catch (hotelError) {
          console.warn("Could not fetch hotel data:", hotelError);
        }
      }

      // ✅ ENHANCED: Set comprehensive session data
      setSessionData({
        session: {
          ...activeSession,
          createdAt: activeSession.createdAt?.toDate(),
          updatedAt: activeSession.updatedAt?.toDate(),
        },
        orders: sessionOrders,
        captain: captainData,
        hotel: hotelData,
        // ✅ NEW: Calculate bill totals
        billing: calculateBillTotals(sessionOrders),
      });

    } catch (error) {
      console.error("Error searching session:", error);
      setError(`Failed to search session: ${error.message}`);
      setSessionData(null);
    } finally {
      setIsLoading(false);
    }
  }, [tableNumber, hotelId, selectedHotel]);

  // ✅ NEW: Calculate bill totals
  const calculateBillTotals = useCallback((orders) => {
    let subtotal = 0;
    let totalQuantity = 0;

    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const itemTotal = (item.price || 0) * (item.quantity || 1);
          subtotal += itemTotal;
          totalQuantity += item.quantity || 1;
        });
      } else {
        // Handle single item orders
        const itemTotal = (order.totalAmount || order.price || 0);
        subtotal += itemTotal;
        totalQuantity += order.quantity || 1;
      }
    });

    // Calculate taxes (you may want to get these from hotel settings)
    const taxRate = sessionData?.hotel?.taxRate || 0.18; // 18% GST
    const serviceChargeRate = sessionData?.hotel?.serviceCharge || 0.05; // 5% service charge

    const serviceCharge = subtotal * serviceChargeRate;
    const taxableAmount = subtotal + serviceCharge;
    const tax = taxableAmount * taxRate;
    const grandTotal = taxableAmount + tax;

    return {
      subtotal,
      serviceCharge,
      serviceChargeRate,
      tax,
      taxRate,
      grandTotal,
      totalItems: totalQuantity,
      orderCount: orders.length,
    };
  }, [sessionData?.hotel]);

  // ✅ ENHANCED: Handle print with better formatting
  const handlePrint = useCallback((billData) => {
    if (!billData) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const billHtml = generateBillHTML(billData);
    
    printWindow.document.write(billHtml);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  }, []);

  // ✅ NEW: Generate HTML for printing
  const generateBillHTML = (billData) => {
    const { session, orders, hotel, billing, captain } = billData;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - Table ${session.tableNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .bill-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .total-section { border-top: 2px solid #000; padding-top: 10px; }
            .grand-total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${hotel?.businessName || hotel?.name || 'Restaurant'}</h1>
            <p>${hotel?.address?.street || hotel?.address || ''}</p>
            <p>Phone: ${hotel?.phone || ''} | GST: ${hotel?.gstNumber || ''}</p>
          </div>
          
          <div class="bill-info">
            <p><strong>Table:</strong> ${session.tableNumber}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            ${captain ? `<p><strong>Server:</strong> ${captain.name || captain.email}</p>` : ''}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => {
                if (order.items && Array.isArray(order.items)) {
                  return order.items.map(item => `
                    <tr>
                      <td>${item.name || item.menuName || 'Unknown Item'}</td>
                      <td>${item.quantity || 1}</td>
                      <td>₹${(item.price || 0).toFixed(2)}</td>
                      <td>₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                    </tr>
                  `).join('');
                } else {
                  return `
                    <tr>
                      <td>${order.menuName || order.itemName || 'Unknown Item'}</td>
                      <td>${order.quantity || 1}</td>
                      <td>₹${(order.price || 0).toFixed(2)}</td>
                      <td>₹${(order.totalAmount || order.price || 0).toFixed(2)}</td>
                    </tr>
                  `;
                }
              }).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <p><strong>Subtotal:</strong> ₹${billing.subtotal.toFixed(2)}</p>
            <p><strong>Service Charge (${(billing.serviceChargeRate * 100).toFixed(0)}%):</strong> ₹${billing.serviceCharge.toFixed(2)}</p>
            <p><strong>Tax (${(billing.taxRate * 100).toFixed(0)}%):</strong> ₹${billing.tax.toFixed(2)}</p>
            <p class="grand-total"><strong>Grand Total: ₹${billing.grandTotal.toFixed(2)}</strong></p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p>Thank you for dining with us!</p>
          </div>
        </body>
      </html>
    `;
  };

  // ✅ ENHANCED: Handle download as PDF
  const handleDownload = useCallback(async (billData) => {
    try {
      // For a complete implementation, you might want to use jsPDF or similar
      const billContent = generateBillHTML(billData);
      const blob = new Blob([billContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill-table-${billData.session.tableNumber}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading bill:", error);
      setError("Failed to download bill");
    }
  }, []);

  // ✅ NEW: Handle share via Web Share API
  const handleShare = useCallback(async (billData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bill - Table ${billData.session.tableNumber}`,
          text: `Bill for table ${billData.session.tableNumber} - Total: ₹${billData.billing.grandTotal.toFixed(2)}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const billSummary = `Bill for Table ${billData.session.tableNumber}\nTotal: ₹${billData.billing.grandTotal.toFixed(2)}`;
      navigator.clipboard.writeText(billSummary).then(() => {
        alert('Bill summary copied to clipboard!');
      });
    }
  }, []);

  // ✅ NEW: Handle search on Enter key
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      searchSession();
    }
  }, [searchSession]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ✅ ENHANCED: Header with better styling */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Receipt size={24} className="text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bill Generation</h1>
              <p className="text-gray-600 mt-1">Search for active table sessions to generate bills</p>
            </div>
          </div>

          {/* ✅ ENHANCED: Search Form */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter table number (e.g., 1, 2, 3...)"
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                disabled={isLoading}
              />
              <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={searchSession}
              disabled={isLoading || !tableNumber.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors min-w-[140px] justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search
                </>
              )}
            </button>
          </div>

          {/* ✅ NEW: Hotel info display */}
          {selectedHotel && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Hotel:</strong> {selectedHotel.businessName || selectedHotel.name}
              </p>
            </div>
          )}

          {/* ✅ ENHANCED: Error display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* ✅ ENHANCED: Session Data Display */}
        {sessionData && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Session Header */}
            <div className="bg-green-50 px-6 py-4 border-b border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <h2 className="text-lg font-semibold text-green-800">
                      Active Session - Table {sessionData.session.tableNumber}
                    </h2>
                    <p className="text-sm text-green-600">
                      Started: {sessionData.session.createdAt?.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* ✅ NEW: Quick actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrint(sessionData)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Print Bill"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => handleDownload(sessionData)}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    title="Download Bill"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleShare(sessionData)}
                    className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    title="Share Bill"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <User className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Server</p>
                    <p className="font-medium">
                      {sessionData.captain?.name || sessionData.captain?.email || 'Not assigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">
                      {sessionData.session.createdAt 
                        ? Math.round((new Date() - sessionData.session.createdAt) / (1000 * 60)) 
                        : 0} minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Receipt className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Orders</p>
                    <p className="font-medium">{sessionData.orders.length} orders</p>
                  </div>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                
                {sessionData.orders.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {sessionData.orders.map((order, index) => (
                        <div key={order.id || index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">
                                Order #{index + 1}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.createdAt?.toLocaleString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'preparing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status || 'unknown'}
                            </span>
                          </div>
                          
                          {/* Order Items */}
                          <div className="space-y-2">
                            {order.items && Array.isArray(order.items) ? (
                              order.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{item.name || item.menuName}</p>
                                    <p className="text-xs text-gray-600">Qty: {item.quantity || 1}</p>
                                  </div>
                                  <p className="text-sm font-medium">
                                    ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{order.menuName || order.itemName || 'Unknown Item'}</p>
                                  <p className="text-xs text-gray-600">Qty: {order.quantity || 1}</p>
                                </div>
                                <p className="text-sm font-medium">
                                  ₹{(order.totalAmount || order.price || 0).toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No orders found for this session</p>
                  </div>
                )}

                {/* ✅ NEW: Bill Summary */}
                {sessionData.billing && (
                  <div className="bg-gray-900 text-white rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Bill Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal ({sessionData.billing.totalItems} items)</span>
                        <span>₹{sessionData.billing.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Charge ({(sessionData.billing.serviceChargeRate * 100).toFixed(0)}%)</span>
                        <span>₹{sessionData.billing.serviceCharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({(sessionData.billing.taxRate * 100).toFixed(0)}%)</span>
                        <span>₹{sessionData.billing.tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-600 pt-2 mt-3">
                        <div className="flex justify-between text-xl font-bold">
                          <span>Grand Total</span>
                          <span>₹{sessionData.billing.grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* ✅ NEW: Action Buttons */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => handlePrint(sessionData)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Printer size={18} />
                        Print Bill
                      </button>
                      <button
                        onClick={() => handleDownload(sessionData)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Download size={18} />
                        Download
                      </button>
                      <button
                        onClick={() => handleShare(sessionData)}
                        className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Share2 size={18} />
                        Share
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ✅ ENHANCED: No Results State */}
        {!sessionData && !isLoading && searchPerformed && !error && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Receipt size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No Active Session Found
            </h3>
            <p className="text-gray-500 mb-4">
              No active session found for table {tableNumber}
            </p>
            <div className="text-sm text-gray-400">
              <p>• Make sure the table number is correct</p>
              <p>• Check if there's an active session for this table</p>
              <p>• Verify the hotel selection is correct</p>
            </div>
          </div>
        )}

        {/* ✅ NEW: Getting Started Guide */}
        {!searchPerformed && !isLoading && (
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Receipt size={24} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  How to Generate Bills
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>1. Enter the table number in the search box above</p>
                  <p>2. Click "Search" to find active sessions</p>
                  <p>3. Review the orders and billing details</p>
                  <p>4. Print, download, or share the bill</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillGenerationPage;
