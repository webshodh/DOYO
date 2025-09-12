// components/billing/ConsolidatedBill.jsx
import React, { useState, useEffect } from "react";
import { useTableSession } from "../../context/TableSessionContext";
import { Receipt, Download, Share2, Clock, Utensils } from "lucide-react";

const ConsolidatedBill = ({
  sessionId,
  showActions = true,
  onPrint,
  onDownload,
  onShare,
}) => {
  const { sessionOrders, currentSession, sessionTotals } = useTableSession();
  const [billData, setBillData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (sessionOrders.length > 0 && currentSession) {
      generateBillData();
    }
  }, [sessionOrders, currentSession]);

  const generateBillData = () => {
    if (!currentSession || sessionOrders.length === 0) return;

    const billData = {
      session: currentSession,
      orders: sessionOrders,
      totals: sessionTotals,
      billNumber: `BILL-${currentSession.sessionId}`,
      generatedAt: new Date().toISOString(),
      generatedAtLocal: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    };

    setBillData(billData);
  };

  const getCourseOrders = (courseType) => {
    return sessionOrders.filter((order) => order.courseType === courseType);
  };

  const renderOrderSection = (orders, title, icon: IconComponent) => {
    if (orders.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
          <IconComponent size={18} className="text-gray-600" />
          <h4 className="font-semibold text-gray-800">{title}</h4>
          <span className="text-sm text-gray-500">
            ({orders.length} order{orders.length > 1 ? "s" : ""})
          </span>
        </div>

        {orders.map((order, index) => (
          <div
            key={order.orderNumber}
            className="mb-4 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-medium text-gray-800">
                  Order #{order.orderNumber}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(order.timestamps.orderPlaced).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                ₹{order.pricing.total}
              </span>
            </div>

            <div className="space-y-1">
              {order.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.menuName} × {item.quantity}
                  </span>
                  <span className="text-gray-800">₹{item.itemTotal}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!billData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No bill data available</p>
      </div>
    );
  }

  const starterOrders = getCourseOrders("starter");
  const mainOrders = getCourseOrders("main");
  const dessertOrders = getCourseOrders("dessert");
  const beverageOrders = getCourseOrders("beverage");

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Bill Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Consolidated Bill</h2>
            <p className="text-blue-100">
              Table {billData.session.tableNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{billData.billNumber}</p>
            <p className="text-blue-100 text-sm">{billData.generatedAtLocal}</p>
          </div>
        </div>
      </div>

      {/* Session Summary */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Session Start</p>
            <p className="font-medium">
              {new Date(billData.session.startTime).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Duration</p>
            <p className="font-medium">
              {billData.session.endTime
                ? Math.round(
                    (new Date(billData.session.endTime) -
                      new Date(billData.session.startTime)) /
                      (1000 * 60)
                  )
                : Math.round(
                    (new Date() - new Date(billData.session.startTime)) /
                      (1000 * 60)
                  )}{" "}
              minutes
            </p>
          </div>
        </div>
      </div>

      {/* Orders by Course */}
      <div className="p-6">
        {renderOrderSection(starterOrders, "Starters", Utensils)}
        {renderOrderSection(mainOrders, "Main Course", Utensils)}
        {renderOrderSection(dessertOrders, "Desserts", Utensils)}
        {renderOrderSection(beverageOrders, "Beverages", Utensils)}

        {/* Other orders (without specific course type) */}
        {renderOrderSection(
          sessionOrders.filter(
            (order) =>
              !["starter", "main", "dessert", "beverage"].includes(
                order.courseType
              )
          ),
          "Other Items",
          Utensils
        )}
      </div>

      {/* Bill Summary */}
      <div className="bg-gray-50 p-6 border-t border-gray-200">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({billData.totals.itemCount} items)</span>
            <span>₹{billData.totals.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax & Charges</span>
            <span>₹{billData.totals.tax}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
            <span>Final Total</span>
            <span>₹{billData.totals.total}</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Total Orders: {billData.totals.orderCount} | Items:{" "}
            {billData.totals.itemCount}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onPrint && onPrint(billData)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Receipt size={16} />
              Print
            </button>
            <button
              onClick={() => onDownload && onDownload(billData)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={() => onShare && onShare(billData)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsolidatedBill;
