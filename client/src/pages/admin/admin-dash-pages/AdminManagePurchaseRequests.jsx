import { useState, useEffect } from 'react';
import { Edit, DollarSign, Package, User, Phone, Calendar, Filter, AlertCircle, CreditCard } from 'lucide-react';
import api from '../../../lib/api';

const AdminManagePurchaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusModal, setStatusModal] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    brittooRejectReason: '',
    paymentStatus: '',
  });

  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchRequests();
  }, [filter, currentPage]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/api/v1/admin/purchase/all', {
        params: { 
          status: filter || undefined,
          page: currentPage,
          limit: 10,
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!formData.status) {
      alert('Please select a status');
      return;
    }

    if (formData.status === 'REJECTED_FROM_BRITTOO' && !formData.brittooRejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/v1/admin/purchase/${statusModal}/status`, {
        status: formData.status,
        brittooRejectReason: formData.brittooRejectReason || undefined,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatusModal(null);
      resetForm();
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleUpdatePayment = async () => {
    if (!formData.paymentStatus) {
      alert('Please select a payment status');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/v1/admin/purchase/${paymentModal}/payment-status`, {
        paymentStatus: formData.paymentStatus,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentModal(null);
      resetForm();
      fetchRequests();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert(error.response?.data?.message || 'Failed to update payment status');
    }
  };

  const resetForm = () => {
    setFormData({
      status: '',
      brittooRejectReason: '',
      paymentStatus: '',
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

  const getPaymentColor = (status) => {
    return status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Manage All Purchase Requests</h1>
          <p className="text-gray-600">Admin panel for managing purchase transactions</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-green-600" />
            <label className="text-sm font-medium text-gray-700">Filter by Status</label>
          </div>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Requests</option>
            <option value="REQUESTED_BY_BUYER">Requested</option>
            <option value="ACCEPTED_BY_SELLER">Accepted</option>
            <option value="REJECTED_BY_SELLER">Rejected by Seller</option>
            <option value="CANCELLED_BY_BUYER">Cancelled</option>
            <option value="REJECTED_FROM_BRITTOO">Rejected by Brittoo</option>
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
          <>
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {formatStatus(request.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentColor(request.paymentStatus)}`}>
                      Payment: {formatStatus(request.paymentStatus)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column - Product & Buyer Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5 text-green-600" />
                        Product Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                          {request.product.optimizedImages?.[0] && (
                            <img
                              src={`${baseUrl}${request.product.optimizedImages[0]}`}
                              alt={request.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{request.product.name}</p>
                            <p className="text-gray-600">SL: {request.product.productSL}</p>
                          </div>
                        </div>
                      </div>

                      <h3 className="font-semibold text-gray-900 mt-4 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-green-600" />
                        Buyer Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Name:</span> <span className="font-medium">{request.buyer.name}</span></p>
                        <p><span className="text-gray-600">Email:</span> <span className="font-medium">{request.buyer.email}</span></p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {request.buyerPhoneNumber}
                        </p>
                        <p className="text-gray-600">Collection: {request.buyerCollectionMethod === 'HOME' ? 'Home Delivery' : 'Terminal Pickup'}</p>
                        {request.buyerDeliveryAddress && (
                          <p className="text-gray-600">Address: {request.buyerDeliveryAddress}</p>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Seller & Price Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-green-600" />
                        Seller Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Name:</span> <span className="font-medium">{request.seller.name}</span></p>
                        <p><span className="text-gray-600">Email:</span> <span className="font-medium">{request.seller.email}</span></p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {request.sellerPhoneNumber}
                        </p>
                      </div>

                      <h3 className="font-semibold text-gray-900 mt-4 mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Pricing Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Asking Price:</span> <span className="font-medium">৳{request.askingPrice}</span></p>
                        <p><span className="text-gray-600">Deal Price:</span> <span className="font-medium">৳{request.dealPrice}</span></p>
                        <p><span className="text-gray-600">Platform Charge:</span> <span className="font-medium">৳{request.platformCharge} (1%)</span></p>
                        <p className="pt-2 border-t"><span className="text-gray-900 font-semibold">Total Price:</span> <span className="font-bold text-green-600">৳{request.totalPrice}</span></p>
                      </div>

                      <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {new Date(request.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rejection/Cancellation Reasons */}
                  {(request.sellerRejectReason || request.buyerCancelReason || request.brittooRejectReason) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-red-900">
                            {request.sellerRejectReason ? 'Seller Rejection:' : 
                             request.buyerCancelReason ? 'Buyer Cancellation:' : 
                             'Brittoo Rejection:'}
                          </p>
                          <p className="text-red-700 mt-1">
                            {request.sellerRejectReason || request.buyerCancelReason || request.brittooRejectReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                    <button
                      onClick={() => setStatusModal(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Update Status
                    </button>
                    <button
                      onClick={() => {
                        setPaymentModal(request.id);
                        setFormData({ ...formData, paymentStatus: request.paymentStatus });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      Update Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Request Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="REJECTED_FROM_BRITTOO">Reject from Brittoo</option>
                  <option value="PRODUCT_SUBMITTED_BY_SELLER">Product Submitted</option>
                  <option value="PRODUCT_COLLECTED_BY_BUYER">Product Collected</option>
                </select>
              </div>

              {formData.status === 'REJECTED_FROM_BRITTOO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                  <textarea
                    value={formData.brittooRejectReason}
                    onChange={(e) => setFormData({ ...formData, brittooRejectReason: e.target.value })}
                    placeholder="Provide reason for rejection..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setStatusModal(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Payment Status</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status *</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setPaymentModal(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePayment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagePurchaseRequests;