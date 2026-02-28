import { useState, useEffect } from 'react';
import { Check, X, Package, MapPin, Phone, Calendar, User, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';

const ManageReceivedPurchaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionModal, setActionModal] = useState(null);
  const [formData, setFormData] = useState({
    sellerDeliveryMethod: '',
    sellerPhoneNumber: '',
    sellerDeliveryAddress: '',
    sellerDeliveryTerminal: '',
    sellerRejectReason: '',
  });

  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/api/v1/purchase/received', {
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

  const handleAccept = async () => {
    if (!formData.sellerDeliveryMethod || !formData.sellerPhoneNumber) {
      alert('Please fill all required fields');
      return;
    }

    if (formData.sellerDeliveryMethod === 'HOME' && !formData.sellerDeliveryAddress) {
      alert('Please provide delivery address');
      return;
    }

    if (formData.sellerDeliveryMethod === 'BRITTOO_TERMINAL' && !formData.sellerDeliveryTerminal) {
      alert('Please select delivery terminal');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/v1/purchase/${actionModal.id}/accept`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActionModal(null);
      resetForm();
      fetchRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async () => {
    if (!formData.sellerRejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/v1/purchase/${actionModal.id}/reject`,
        { sellerRejectReason: formData.sellerRejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionModal(null);
      resetForm();
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const resetForm = () => {
    setFormData({
      sellerDeliveryMethod: '',
      sellerPhoneNumber: '',
      sellerDeliveryAddress: '',
      sellerDeliveryTerminal: '',
      sellerRejectReason: '',
    });
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Purchase Requests Received</h1>
          <p className="text-gray-600">Manage purchase requests for your products</p>
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
            <option value="REQUESTED_BY_BUYER">Pending</option>
            <option value="ACCEPTED_BY_SELLER">Accepted</option>
            <option value="REJECTED_BY_SELLER">Rejected</option>
            <option value="CANCELLED_BY_BUYER">Cancelled</option>
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
                      {request.product.optimizedImages?.[0] && (
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
                        <span>Asking: ৳{request.askingPrice}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="w-4 h-4 text-green-600" />
                        <span>Deal: ৳{request.dealPrice}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 text-green-600" />
                        <span>{request.buyer.name}</span>
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

                    {/* Buyer Address/Terminal */}
                    {request.buyerDeliveryAddress && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="text-gray-600">Delivery Address:</p>
                        <p className="text-gray-900 font-medium">{request.buyerDeliveryAddress}</p>
                      </div>
                    )}
                  </div>
                  {/* Action Buttons */}
                  {request.status === 'REQUESTED_BY_BUYER' && (
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <button
                        onClick={() => setActionModal({ id: request.id, type: 'accept', request })}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => setActionModal({ id: request.id, type: 'reject', request })}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
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
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-6 my-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {actionModal.type === 'accept' ? 'Accept Purchase Request' : 'Reject Purchase Request'}
            </h3>

            {actionModal.type === 'accept' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method *</label>
                  <select
                    value={formData.sellerDeliveryMethod}
                    onChange={(e) => setFormData({ ...formData, sellerDeliveryMethod: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select method</option>
                    <option value="HOME">Home Delivery</option>
                    <option value="BRITTOO_TERMINAL">Brittoo Terminal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Phone Number *</label>
                  <div className="flex items-center border bg-white border-gray-300 rounded-md w-full focus-within:border-gray-400">
                    <span className="flex items-center gap-1 px-3 text-xs md:text-xs text-gray-600 bg-gray-100 border-r border-gray-300 rounded-l-md">
                      <img
                        src="https://flagcdn.com/w40/bd.png"
                        alt="BD Flag"
                        className="w-5 h-4 object-cover"
                      />
                      +880
                    </span>

                    <input
                      type="tel"
                      required
                      value={formData.sellerPhoneNumber}
                      onChange={(e) => setFormData({ ...formData, sellerPhoneNumber: e.target.value })}
                      maxLength={10}
                      id="phone"
                      className="w-full px-2 py-2 md:py-3 md:px-4 focus:outline-none text-xs md:text-xs rounded-r-md"
                      placeholder="1XXXXXXXXX"
                    />
                  </div>
                </div>

                {formData.sellerDeliveryMethod === 'HOME' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
                    <textarea
                      value={formData.sellerDeliveryAddress}
                      onChange={(e) => setFormData({ ...formData, sellerDeliveryAddress: e.target.value })}
                      placeholder="Enter your address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows="3"
                    />
                  </div>
                )}

                {formData.sellerDeliveryMethod === 'BRITTOO_TERMINAL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Terminal *</label>
                    <select
                      value={formData.sellerDeliveryTerminal}
                      onChange={(e) => setFormData({ ...formData, sellerDeliveryTerminal: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select terminal</option>
                      <option value="CSE_1">CSE Terminal 1</option>
                      <option value="ADMIN_1">Admin Terminal 1</option>
                      <option value="BANGABANDHU_HALL_1">Bangabandhu Hall 1</option>
                      <option value="ZIA_HALL_1">Zia Hall 1</option>
                      <option value="LIBRARY_1">Library 1</option>
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                <textarea
                  value={formData.sellerRejectReason}
                  onChange={(e) => setFormData({ ...formData, sellerRejectReason: e.target.value })}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows="4"
                />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setActionModal(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={actionModal.type === 'accept' ? handleAccept : handleReject}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors text-white ${actionModal.type === 'accept'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReceivedPurchaseRequests;