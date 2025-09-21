// src/Pages/Captain/PrintBill.jsx
import React, { useState, useEffect, useMemo } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";
import {
  Printer,
  Download,
  Share2,
  User,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  Building2,
  Receipt,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";

const PrintBill = ({ order, restaurantInfo = {} }) => {
  // ✅ NEW: Use context hooks
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // State management
  const [captainInfo, setCaptainInfo] = useState(null);
  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billGenerated, setBillGenerated] = useState(false);

  // ✅ NEW: Load captain and hotel information
  useEffect(() => {
    const loadAdditionalData = async () => {
      try {
        setLoading(true);

        // Load captain information
        if (order.captainId || currentUser?.uid) {
          const captainId = order.captainId || currentUser.uid;
          const captainDoc = await getDoc(doc(db, "captains", captainId));
          if (captainDoc.exists()) {
            setCaptainInfo({
              id: captainDoc.id,
              ...captainDoc.data(),
            });
          }
        }

        // Load hotel information from Firestore if not provided
        if (order.hotelId && !restaurantInfo.name) {
          const hotelDoc = await getDoc(doc(db, "hotels", order.hotelId));
          if (hotelDoc.exists()) {
            setHotelData({
              id: hotelDoc.id,
              ...hotelDoc.data(),
            });
          }
        }
      } catch (error) {
        console.error("Error loading additional data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAdditionalData();
  }, [order, currentUser, restaurantInfo]);

  // ✅ ENHANCED: Get restaurant info with Firestore data
  const getRestaurantInfo = useMemo(() => {
    const info = {
      name:
        restaurantInfo.name ||
        selectedHotel?.businessName ||
        selectedHotel?.name ||
        hotelData?.businessName ||
        hotelData?.name ||
        "Restaurant Name",

      address:
        restaurantInfo.address ||
        selectedHotel?.address?.street ||
        hotelData?.address?.street ||
        (selectedHotel?.address
          ? `${selectedHotel.address.city}, ${selectedHotel.address.state} - ${selectedHotel.address.zipCode}`
          : "Restaurant Address"),

      phone:
        restaurantInfo.phone ||
        selectedHotel?.phone ||
        hotelData?.phone ||
        "Contact Number",

      email:
        restaurantInfo.email ||
        selectedHotel?.email ||
        hotelData?.email ||
        null,

      gst:
        restaurantInfo.gst ||
        selectedHotel?.gstNumber ||
        hotelData?.gstNumber ||
        null,

      taxRate:
        restaurantInfo.taxRate ||
        selectedHotel?.taxRate ||
        hotelData?.taxRate ||
        0.18,

      serviceCharge:
        restaurantInfo.serviceCharge ||
        selectedHotel?.serviceCharge ||
        hotelData?.serviceCharge ||
        0.05,

      footer: restaurantInfo.footer || "Thank you for dining with us!",

      // ✅ NEW: Additional business details
      fssaiNumber: selectedHotel?.fssaiNumber || hotelData?.fssaiNumber || null,
      website: selectedHotel?.website || hotelData?.website || null,
    };

    return info;
  }, [restaurantInfo, selectedHotel, hotelData]);

  // ✅ ENHANCED: Format date/time with better handling
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";

    try {
      let date = dateTime;

      // Handle Firestore Timestamp
      if (dateTime.toDate) {
        date = dateTime.toDate();
      } else if (typeof dateTime === "string") {
        date = new Date(dateTime);
      }

      return date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid Date";
    }
  };

  // ✅ ENHANCED: Get item price with better fallback logic
  const getItemPrice = (item) => {
    const possiblePriceProps = [
      "finalPrice",
      "originalPrice",
      "price",
      "menuPrice",
      "itemPrice",
      "cost",
      "amount",
      "rate",
      "unitPrice",
      "sellingPrice",
    ];

    for (let prop of possiblePriceProps) {
      if (
        item[prop] !== undefined &&
        item[prop] !== null &&
        item[prop] !== ""
      ) {
        const price = parseFloat(item[prop]);
        if (!isNaN(price) && price >= 0) {
          return price;
        }
      }
    }
    return 0;
  };

  // ✅ ENHANCED: Calculate totals with Firestore pricing structure
  const calculateTotals = useMemo(() => {
    // Use existing pricing from order if available (Firestore structure)
    if (order.pricing && typeof order.pricing === "object") {
      return {
        subtotal: order.pricing.subtotal || 0,
        serviceCharge: order.pricing.serviceCharge || 0,
        tax: order.pricing.tax || 0,
        total: order.pricing.total || 0,
        serviceChargeRate:
          order.pricing.serviceChargeRate || getRestaurantInfo.serviceCharge,
        taxRate: order.pricing.taxPercentage
          ? order.pricing.taxPercentage / 100
          : getRestaurantInfo.taxRate,
      };
    }

    // Calculate from items if no pricing structure exists
    if (!order.items || !Array.isArray(order.items)) {
      return {
        subtotal: 0,
        serviceCharge: 0,
        tax: 0,
        total: 0,
        serviceChargeRate: getRestaurantInfo.serviceCharge,
        taxRate: getRestaurantInfo.taxRate,
      };
    }

    const subtotal = order.items.reduce((sum, item) => {
      const price = getItemPrice(item);
      const quantity = parseInt(item.quantity || item.qty || 0);
      return sum + price * quantity;
    }, 0);

    const serviceCharge = Math.round(
      subtotal * getRestaurantInfo.serviceCharge
    );
    const taxableAmount = subtotal + serviceCharge;
    const tax = Math.round(taxableAmount * getRestaurantInfo.taxRate);
    const total = taxableAmount + tax;

    return {
      subtotal,
      serviceCharge,
      tax,
      total,
      serviceChargeRate: getRestaurantInfo.serviceCharge,
      taxRate: getRestaurantInfo.taxRate,
    };
  }, [order, getRestaurantInfo]);

  // ✅ NEW: Update bill generation status in Firestore
  const updateBillStatus = async () => {
    if (order.id && !billGenerated) {
      try {
        await updateDoc(doc(db, "orders", order.id), {
          "billing.billGenerated": true,
          "billing.billGeneratedAt": serverTimestamp(),
          "billing.generatedBy": currentUser?.uid,
          "billing.generatedByName":
            captainInfo?.name || captainInfo?.firstName || "Staff",
        });
        setBillGenerated(true);
      } catch (error) {
        console.error("Error updating bill status:", error);
      }
    }
  };

  // ✅ NEW: Handle print with status update
  const handlePrint = async () => {
    try {
      await updateBillStatus();
      window.print();
      toast.success("Bill printed successfully");
    } catch (error) {
      console.error("Error printing bill:", error);
      toast.error("Error printing bill");
    }
  };

  // ✅ NEW: Handle download as PDF (basic implementation)
  const handleDownload = async () => {
    try {
      await updateBillStatus();

      // Create a new window for the bill content
      const printContent = document.getElementById("bill-content").innerHTML;
      const printWindow = window.open("", "_blank");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bill - Order #${order.orderNumber}</title>
            <style>
              body { font-family: monospace; margin: 20px; }
              .bill-content { max-width: 600px; margin: 0 auto; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; text-align: left; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .border-b { border-bottom: 1px solid #000; }
              .border-t { border-top: 1px solid #000; }
              .font-bold { font-weight: bold; }
              .mb-4 { margin-bottom: 16px; }
              .mt-2 { margin-top: 8px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="bill-content">${printContent}</div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.print();
      printWindow.close();

      toast.success("Bill download initiated");
    } catch (error) {
      console.error("Error downloading bill:", error);
      toast.error("Error downloading bill");
    }
  };

  // ✅ NEW: Handle share
  const handleShare = async () => {
    const shareData = {
      title: `Bill - Order #${order.orderNumber}`,
      text: `Bill for Table ${
        order.tableNumber
      } - Total: ₹${calculateTotals.total.toFixed(2)}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      const billText = `${shareData.title}\n${shareData.text}`;
      navigator.clipboard.writeText(billText).then(() => {
        toast.success("Bill details copied to clipboard!");
      });
    }
  };

  // ✅ NEW: Generate bill number
  const getBillNumber = () => {
    const orderNum = order.orderNumber || order.id?.slice(-6) || "000001";
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `BILL${date}${orderNum}`;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 text-center">
        <div className="animate-pulse">Loading bill details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 font-mono text-sm print:shadow-none print:p-2">
      <div id="bill-content">
        {/* ✅ ENHANCED: Restaurant Header with more details */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">
            {getRestaurantInfo.name}
          </h1>
          <div className="space-y-1 text-sm">
            <p>{getRestaurantInfo.address}</p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <span>📞 {getRestaurantInfo.phone}</span>
              {getRestaurantInfo.email && (
                <span>✉️ {getRestaurantInfo.email}</span>
              )}
            </div>
            <div className="flex justify-center items-center gap-4 flex-wrap text-xs">
              {getRestaurantInfo.gst && (
                <span>GST: {getRestaurantInfo.gst}</span>
              )}
              {getRestaurantInfo.fssaiNumber && (
                <span>FSSAI: {getRestaurantInfo.fssaiNumber}</span>
              )}
            </div>
            {getRestaurantInfo.website && (
              <p className="text-xs">🌐 {getRestaurantInfo.website}</p>
            )}
          </div>
        </div>

        {/* ✅ ENHANCED: Bill Header with more information */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-lg font-bold uppercase">Tax Invoice</h2>
              <p className="text-xs">Bill No: {getBillNumber()}</p>
            </div>
            <div className="text-right text-xs">
              <p>Date: {new Date().toLocaleDateString("en-IN")}</p>
              <p>Time: {new Date().toLocaleTimeString("en-IN")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-300 pb-2">
            <div>
              <p>
                <strong>Order No:</strong> #{order.orderNumber || order.id}
              </p>
              <p>
                <strong>Table:</strong> {order.tableNumber}
              </p>
              {order.customerName && (
                <p>
                  <strong>Customer:</strong> {order.customerName}
                </p>
              )}
            </div>
            <div>
              <p>
                <strong>Order Time:</strong>{" "}
                {formatDateTime(
                  order.createdAt || order.timestamps?.orderPlaced
                )}
              </p>
              {captainInfo && (
                <p>
                  <strong>Served by:</strong>{" "}
                  {captainInfo.name || captainInfo.firstName}
                </p>
              )}
              {order.customerPhone && (
                <p>
                  <strong>Phone:</strong> {order.customerPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ✅ ENHANCED: Items Table with better formatting */}
        <table className="w-full border-collapse border-b-2 border-black mb-4">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-2 pr-2">#</th>
              <th className="text-left py-2 pr-2">Item</th>
              <th className="text-center py-2 pr-2">Qty</th>
              <th className="text-right py-2 pr-2">Rate</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => {
                const price = getItemPrice(item);
                const quantity = parseInt(item.quantity || item.qty || 0);
                const itemTotal = price * quantity;

                return (
                  <tr
                    key={index}
                    className="border-b border-dashed border-gray-400"
                  >
                    <td className="py-2 pr-2 align-top">{index + 1}</td>
                    <td className="py-2 pr-2 align-top">
                      <div>
                        <div className="font-semibold">
                          {item.menuName ||
                            item.name ||
                            item.itemName ||
                            "Unknown Item"}
                        </div>
                        {/* ✅ NEW: Show veg/non-veg indicator */}
                        <div className="flex items-center gap-2 mt-1">
                          {item.isVeg !== undefined && (
                            <span
                              className={`text-xs px-1 py-0.5 rounded ${
                                item.isVeg
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.isVeg ? "🟢 VEG" : "🔴 NON-VEG"}
                            </span>
                          )}
                          {item.isSpicy && (
                            <span className="text-xs text-red-600">
                              🌶️ SPICY
                            </span>
                          )}
                        </div>
                        {item.specialInstructions && (
                          <div className="text-xs text-gray-600 italic mt-1">
                            Note: {item.specialInstructions}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-2 pr-2 align-top">
                      {quantity}
                    </td>
                    <td className="text-right py-2 pr-2 align-top">
                      ₹{price.toFixed(2)}
                    </td>
                    <td className="text-right py-2 align-top">
                      ₹{itemTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ ENHANCED: Totals with service charges */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{calculateTotals.subtotal.toFixed(2)}</span>
          </div>

          {calculateTotals.serviceCharge > 0 && (
            <div className="flex justify-between">
              <span>
                Service Charge (
                {(calculateTotals.serviceChargeRate * 100).toFixed(0)}%):
              </span>
              <span>₹{calculateTotals.serviceCharge.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>
              Tax GST ({(calculateTotals.taxRate * 100).toFixed(0)}%):
            </span>
            <span>₹{calculateTotals.tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-lg font-bold border-t-2 border-black pt-2">
            <span>TOTAL AMOUNT:</span>
            <span>₹{calculateTotals.total.toFixed(2)}</span>
          </div>

          {/* ✅ NEW: Amount in words */}
          <div className="text-xs text-gray-600 mt-2">
            <em>
              Amount in words: {convertToWords(calculateTotals.total)} Rupees
              Only
            </em>
          </div>
        </div>

        {/* ✅ ENHANCED: Payment and Order Info */}
        <div className="mb-6 text-xs space-y-1">
          {order.paymentMethod && (
            <p>
              <strong>Payment Method:</strong> {order.paymentMethod}
            </p>
          )}
          {order.paymentStatus && (
            <p>
              <strong>Payment Status:</strong> {order.paymentStatus}
            </p>
          )}
          {order.sessionId && (
            <p>
              <strong>Session ID:</strong> {order.sessionId}
            </p>
          )}
          <p>
            <strong>Order Status:</strong> {order.status || "Completed"}
          </p>
        </div>

        {/* ✅ NEW: Special instructions or notes */}
        {order.specialInstructions && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs">
              <strong>Special Instructions:</strong>
            </p>
            <p className="text-xs italic">{order.specialInstructions}</p>
          </div>
        )}

        {/* ✅ ENHANCED: Footer with more details */}
        <div className="text-center border-t-2 border-black pt-4 text-xs space-y-2">
          <p className="mb-2 font-semibold text-lg">
            🙏 {getRestaurantInfo.footer}
          </p>
          <p>This is a computer generated invoice.</p>
          {captainInfo && (
            <p>
              Served by: {captainInfo.name || captainInfo.firstName} | ID:{" "}
              {captainInfo.id?.slice(-6)}
            </p>
          )}
          <div className="flex justify-center items-center gap-4 mt-3">
            <span>📅 {new Date().toLocaleDateString("en-IN")}</span>
            <span>⏰ {new Date().toLocaleTimeString("en-IN")}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Please rate your dining experience and visit us again!
          </p>
        </div>
      </div>

      {/* ✅ NEW: Action Buttons - Hidden during printing */}
      <div className="text-center mt-6 print:hidden space-y-4">
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-sans font-medium transition-colors flex items-center gap-2"
          >
            <Printer size={18} />
            Print Bill
          </button>

          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-sans font-medium transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Download
          </button>

          <button
            onClick={handleShare}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-sans font-medium transition-colors flex items-center gap-2"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>

        {billGenerated && (
          <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
            <CheckCircle size={16} />
            <span>Bill has been generated and recorded</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ NEW: Helper function to convert numbers to words (basic implementation)
const convertToWords = (num) => {
  if (num === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convertHundreds = (n) => {
    let result = "";
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + " ";
      return result;
    }
    if (n > 0) {
      result += ones[n] + " ";
    }
    return result;
  };

  if (num < 1000) {
    return convertHundreds(num).trim();
  } else if (num < 100000) {
    return (
      convertHundreds(Math.floor(num / 1000)) +
      "Thousand " +
      convertHundreds(num % 1000)
    );
  } else {
    return (
      convertHundreds(Math.floor(num / 100000)) +
      "Lakh " +
      convertHundreds((num % 100000) / 1000) +
      "Thousand " +
      convertHundreds(num % 1000)
    );
  }
};

export default PrintBill;
