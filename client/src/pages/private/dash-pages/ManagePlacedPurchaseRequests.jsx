import { useState, useEffect } from 'react';
import { X, Package, MapPin, Phone, Calendar, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';


const ManagePlacedPurchaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/api/v1/purchase/placed', {
        params: { status: filter || undefined },
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/v1/purchase/${cancelModal}/cancel`, 
        { buyerCancelReason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setCancelModal(null);
      setCancelReason('');
      fetchRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      REQUESTED_BY_BUYER: 'bg-yellow-100 text-yellow-800',
      CANCELLED_BY_BUYER: 'bg-gray-100 text-gray-800',
      ACCEPTED_BY_SELLER: 'bg-green-100 text-green-800',
      REJECTED_BY_SELLER: 'bg-red-100 text-red-800',
      REJECTED_FROM_BRITTOO: 'bg-red-100 text-red-800',
      PRODUCT_SUBMITTED_BY_SELLER: 'bg-blue-100 text-blue-800',
      PRODUCT_COLLECTED_BY_BUYER: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Purchase Requests</h1>
          <p className="text-gray-600">Track and manage your purchase requests</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Requests</option>
            <option value="REQUESTED_BY_BUYER">Requested</option>
            <option value="ACCEPTED_BY_SELLER">Accepted</option>
            <option value="REJECTED_BY_SELLER">Rejected</option>
            <option value="CANCELLED_BY_BUYER">Cancelled</option>
            <option value="PRODUCT_SUBMITTED_BY_SELLER">Product Submitted</option>
            <option value="PRODUCT_COLLECTED_BY_BUYER">Collected</option>
          </select>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No purchase requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {request.product.productImages?.[0] && (
                        <img
                          src={`${baseUrl}${request.product.optimizedImages[0]}`}
                          alt={request.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{request.product.name}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {formatStatus(request.status)}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="w-4 h-4 text-green-600" />
                        <span>Deal Price: ৳{request.dealPrice}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="w-4 h-4 text-green-600" />
                        <span>Platform Charge: ৳{request.platformCharge} (1%)</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="w-4 h-4 text-green-600" />
                        <span>Total: ৳{request.totalPrice}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-green-600" />
                        <span>{request.buyerPhoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{request.buyerCollectionMethod === 'HOME' ? 'Home Delivery' : 'Terminal Pickup'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        Seller: <span className="font-medium text-gray-900">{request.seller.name}</span>
                      </p>
                    </div>

                    {/* Rejection/Cancellation Reason */}
                    {(request.sellerRejectReason || request.buyerCancelReason || request.brittooRejectReason) && (
                      <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-red-900">
                            {request.sellerRejectReason ? 'Seller Rejection Reason:' : 
                             request.buyerCancelReason ? 'Buyer Cancellation Reason:' : 
                             'Brittoo Rejection:'}
                          </p>
                          <p className="text-red-700 mt-1">
                            {request.sellerRejectReason || request.buyerCancelReason || request.brittooRejectReason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {(request.status === 'REQUESTED_BY_BUYER' || request.status === 'ACCEPTED_BY_SELLER') && (
                    <button
                      onClick={() => setCancelModal(request.id)}
                      className="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Purchase Request</h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4 resize-none"
              rows="4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCancelModal(null);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlacedPurchaseRequests;