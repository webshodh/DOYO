import React from "react";

const PrintBill = ({ order, restaurantInfo = {} }) => {
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    try {
      return new Date(dateTime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getItemPrice = (item) => {
    // Check for your specific price properties first
    const possiblePriceProps = [
      "finalPrice",
      "originalPrice",
      "itemTotal", // Your actual properties
      "price",
      "menuPrice",
      "itemPrice",
      "cost", // Common fallbacks
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
        if (!isNaN(price)) {
          return price;
        }
      }
    }
    return 0;
  };

  const calculateSubtotal = () => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((sum, item, index) => {
      const price = getItemPrice(item);
      const quantity = parseInt(item.quantity || item.qty || 0);
      return sum + price * quantity;
    }, 0);
  };

  const calculateTax = (subtotal) => {
    const taxRate = restaurantInfo.taxRate || 0.18; // Default 18% GST
    return subtotal * taxRate;
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = order.totalAmount || order.total || subtotal + tax;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 font-mono text-sm print:shadow-none print:p-2">
      {/* Restaurant Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide">
          {restaurantInfo.name || "Restaurant Name"}
        </h1>
        <p className="text-sm mt-2">
          {restaurantInfo.address || "Restaurant Address"}
        </p>
        <p className="text-sm">
          Phone: {restaurantInfo.phone || "Contact Number"}
        </p>
        {restaurantInfo.gst && (
          <p className="text-sm">GST No: {restaurantInfo.gst}</p>
        )}
      </div>

      {/* Bill Header */}
      <h2 className="text-lg font-bold uppercase">Tax Invoice</h2>
      <div className="flex justify-between items-start mb-1">
        <p>
          <strong>Order No:</strong>{" "}
          {order.displayOrderNumber || `#${order.orderNumber || order.id}`}
        </p>
        <p>
          <strong>Table No:</strong>{" "}
          {order.displayTable ||
            `Table ${order.tableInfo || order.tableNumber || "0"}`}
        </p>
        {order.customerInfo?.customerName && (
          <p>
            <strong>Customer:</strong> {order.customerInfo.customerName}
          </p>
        )}
      </div>
      <div>
        <p>
          <strong>Order Date:</strong>{" "}
          {formatDateTime(
            order.timestamps?.orderPlaced || order.orderTimestamp,
          )}
        </p>
        <p>
          <strong>Completed Order:</strong>{" "}
          {formatDateTime(order.timestamps?.completed || new Date())}
        </p>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border-b-2 border-black mb-4">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-2 pr-4">#</th>
            <th className="text-left py-2 pr-4">Item</th>
            <th className="text-right py-2 pr-4">Qty</th>
            <th className="text-right py-2 pr-4">Rate</th>
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
                  <td className="py-2 pr-4">{index + 1}</td>
                  <td className="py-2 pr-4">
                    <div>
                      <div className="font-semibold">
                        {item.menuName ||
                          item.name ||
                          item.itemName ||
                          "Unknown Item"}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-gray-600 italic">
                          Note: {item.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-right py-2 pr-4">{quantity}</td>
                  <td className="text-right py-2 pr-4">₹{price.toFixed(2)}</td>
                  <td className="text-right py-2">₹{itemTotal.toFixed(2)}</td>
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

      {/* Totals */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>
            Tax ({((restaurantInfo.taxRate || 0.18) * 100).toFixed(0)}%):
          </span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t-2 border-black pt-2">
          <span>TOTAL:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Info */}
      {order.paymentMethod && (
        <div className="mb-6">
          <p>
            <strong>Payment Method:</strong> {order.paymentMethod}
          </p>
          {order.paymentStatus && (
            <p>
              <strong>Payment Status:</strong> {order.paymentStatus}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center border-t-2 border-black pt-4 text-xs">
        <p className="mb-2 font-semibold">Thank you for dining with us!</p>
        <p>This is a computer generated bill.</p>
        {restaurantInfo.footer && (
          <p className="mt-2">{restaurantInfo.footer}</p>
        )}
      </div>

      {/* Print Button - Hidden during printing */}
      <div className="text-center mt-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-sans font-medium transition-colors"
        >
          Print Bill
        </button>
      </div>
    </div>
  );
};

export default PrintBill;
