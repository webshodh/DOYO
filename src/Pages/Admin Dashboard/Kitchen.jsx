import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../data/firebase/firebaseConfig';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  Calendar,
  ChefHat,
  Bell,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';

const KitchenAdminPage = ({ hotelName = 'defaultHotel' }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    rejected: 0
  });

  // Fetch orders from Firebase
  useEffect(() => {
    if (!hotelName) return;

    const ordersRef = ref(db, `/hotels/${hotelName}/orders`);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        
        // Sort by order placed time (newest first)
        ordersArray.sort((a, b) => 
          new Date(b.timestamps?.orderPlaced || 0) - new Date(a.timestamps?.orderPlaced || 0)
        );
        
        setOrders(ordersArray);
        calculateStats(ordersArray);
      } else {
        setOrders([]);
        setOrderStats({
          pending: 0,
          preparing: 0,
          ready: 0,
          completed: 0,
          rejected: 0
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [hotelName]);

  // Filter orders based on active filter and date
  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(order => {
        const status = order.kitchen?.status || order.status || 'received';
        return status === activeFilter;
      });
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(order => {
        const orderDate = order.timestamps?.orderDate || 
                         new Date(order.timestamps?.orderPlaced).toISOString().split('T')[0];
        return orderDate === selectedDate;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, activeFilter, selectedDate]);

  const calculateStats = (ordersArray) => {
    const stats = {
      pending: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      rejected: 0
    };

    ordersArray.forEach(order => {
      const status = order.kitchen?.status || order.status || 'received';
      if (status === 'received') stats.pending++;
      else if (status === 'preparing') stats.preparing++;
      else if (status === 'ready') stats.ready++;
      else if (status === 'completed') stats.completed++;
      else if (status === 'rejected') stats.rejected++;
    });

    setOrderStats(stats);
  };

  const updateOrderStatus = async (orderId, newStatus, additionalData = {}) => {
    try {
      const orderRef = ref(db, `/hotels/${hotelName}/orders/${orderId}`);
      const updates = {
        'kitchen/status': newStatus,
        'kitchen/lastUpdated': new Date().toISOString(),
        ...additionalData
      };

      // Add status-specific timestamps
      if (newStatus === 'preparing') {
        updates['timestamps/preparationStarted'] = new Date().toISOString();
      } else if (newStatus === 'ready') {
        updates['timestamps/readyTime'] = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updates['timestamps/completedTime'] = new Date().toISOString();
        updates['customerInfo/servingStatus'] = 'served';
      } else if (newStatus === 'rejected') {
        updates['timestamps/rejectedTime'] = new Date().toISOString();
        updates['kitchen/rejectionReason'] = additionalData.rejectionReason || 'No reason provided';
      }

      await update(orderRef, updates);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    if (newStatus === 'rejected') {
      const reason = prompt('Please enter rejection reason:');
      if (reason !== null) {
        updateOrderStatus(orderId, newStatus, { 'kitchen/rejectionReason': reason });
      }
    } else {
      updateOrderStatus(orderId, newStatus);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'received': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'received': return <Clock size={16} />;
      case 'preparing': return <ChefHat size={16} />;
      case 'ready': return <Bell size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-IN');
  };

  const getTimeDifference = (startTime) => {
    if (!startTime) return '';
    const diff = Date.now() - new Date(startTime).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading kitchen orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kitchen Dashboard</h1>
              <p className="text-gray-600">Manage orders for {hotelName}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Preparing</p>
                <p className="text-2xl font-bold text-blue-600">{orderStats.preparing}</p>
              </div>
              <ChefHat className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ready</p>
                <p className="text-2xl font-bold text-green-600">{orderStats.ready}</p>
              </div>
              <Bell className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-600">{orderStats.completed}</p>
              </div>
              <CheckCircle className="text-gray-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{orderStats.rejected}</p>
              </div>
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All Orders', count: orders.length },
                  { key: 'received', label: 'Pending', count: orderStats.pending },
                  { key: 'preparing', label: 'Preparing', count: orderStats.preparing },
                  { key: 'ready', label: 'Ready', count: orderStats.ready },
                  { key: 'completed', label: 'Completed', count: orderStats.completed },
                  { key: 'rejected', label: 'Rejected', count: orderStats.rejected }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === filter.key
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <ChefHat size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {activeFilter === 'all' 
                  ? 'No orders for the selected date'
                  : `No ${activeFilter} orders for the selected date`
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = order.kitchen?.status || order.status || 'received';
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Table {order.tableNumber || order.customerInfo?.tableNumber}</span>
                          <span>{formatTime(order.timestamps?.orderPlaced)}</span>
                          <span>{getTimeDifference(order.timestamps?.orderPlaced)}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(status)}
                          <span className="capitalize">{status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Items ({order.orderDetails?.totalItems})</p>
                        <div className="space-y-1">
                          {order.items?.slice(0, 2).map((item, index) => (
                            <p key={index} className="text-sm font-medium text-gray-800">
                              {item.quantity}× {item.menuName}
                            </p>
                          ))}
                          {order.items?.length > 2 && (
                            <p className="text-sm text-gray-500">
                              +{order.items.length - 2} more items
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-lg font-bold text-gray-900">
                          ₹{order.pricing?.total || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Categories</p>
                        <div className="flex flex-wrap gap-1">
                          {order.orderSummary?.categories?.slice(0, 3).map((category, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {status === 'received' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(order.id, 'preparing')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          Start Preparing
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'rejected')}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          Reject Order
                        </button>
                      </>
                    )}
                    {status === 'preparing' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'ready')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        Mark Ready
                      </button>
                    )}
                    {status === 'ready' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'completed')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        Mark Served
                      </button>
                    )}
                    {status === 'rejected' && order.kitchen?.rejectionReason && (
                      <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                        Reason: {order.kitchen.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Order #{selectedOrder.orderNumber}
                  </h2>
                  <p className="text-gray-600">
                    Table {selectedOrder.tableNumber || selectedOrder.customerInfo?.tableNumber}
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Order Timestamps */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Order Timeline</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order Placed:</p>
                    <p className="font-medium">
                      {formatDate(selectedOrder.timestamps?.orderPlaced)} at{' '}
                      {formatTime(selectedOrder.timestamps?.orderPlaced)}
                    </p>
                  </div>
                  {selectedOrder.timestamps?.preparationStarted && (
                    <div>
                      <p className="text-gray-600">Preparation Started:</p>
                      <p className="font-medium">{formatTime(selectedOrder.timestamps.preparationStarted)}</p>
                    </div>
                  )}
                  {selectedOrder.timestamps?.readyTime && (
                    <div>
                      <p className="text-gray-600">Ready Time:</p>
                      <p className="font-medium">{formatTime(selectedOrder.timestamps.readyTime)}</p>
                    </div>
                  )}
                  {selectedOrder.timestamps?.completedTime && (
                    <div>
                      <p className="text-gray-600">Completed Time:</p>
                      <p className="font-medium">{formatTime(selectedOrder.timestamps.completedTime)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {item.isVeg ? (
                          <div className="w-3 h-3 border-2 border-green-500 bg-white rounded-sm flex items-center justify-center">
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-3 h-3 border-2 border-red-500 bg-white rounded-sm flex items-center justify-center">
                            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.menuName}</p>
                          <p className="text-sm text-gray-600">
                            ₹{item.finalPrice} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{item.itemTotal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{selectedOrder.pricing?.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%):</span>
                    <span className="font-medium">₹{selectedOrder.pricing?.tax}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{selectedOrder.pricing?.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenAdminPage;