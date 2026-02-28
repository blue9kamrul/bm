import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, Package, Calendar, TrendingUp, Star, Clock,
  FileText, Loader, AlertCircle
} from 'lucide-react';
import api from '../../../lib/api';

const AdminOverview = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin-dash/analytics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#15803d',
    light: '#dcfce7',
    gradient: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
    pieColors: [
      '#22c55e', // Green
      '#3b82f6', // Blue
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#f97316', // Orange
      '#ec4899', // Pink
      '#10b981', // Emerald
      '#6366f1', // Indigo
      '#84cc16', // Lime
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-green-600">
          <Loader className="w-8 h-8 animate-spin" />
          <span className="text-lg font-medium">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="w-8 h-8" />
          <span className="text-lg font-medium">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Analytics</h1>
          <p className="text-gray-600">Platform insights and performance metrics</p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* User Registrations */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-green-100">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">User Registrations (2 Months)</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics?.userRegistrations || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Product Type Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-green-100">
            <div className="flex items-center mb-4">
              <Package className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Product Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics?.productDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="type"
                >
                  {analytics?.productDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.pieColors[index % COLORS.pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    `${value}`,
                    name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Rental Requests Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-green-100">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Rental Requests Timeline</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.rentalRequestsTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Bar dataKey="requests" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-green-100">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Revenue Timeline</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics?.revenueTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`৳${value?.toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.primary}
                  fill={COLORS.light}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* popular products */}

          <div className="bg-white rounded-lg shadow-sm p-6 border border-green-100">
            <div className="flex items-center mb-4">
              <Star className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Most Popular Products</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={analytics?.popularProducts || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value} rentals`, 'Popular Products']}
                />
                <Bar
                  dataKey="rentals"
                  fill={COLORS.secondary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Rental Duration Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-green-100">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Rental Duration Patterns</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.rentalDurations || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="duration" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document Upload Status - Full Width */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-green-100">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">User Document Upload Status</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics?.documentUploadStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  <Cell fill={COLORS.primary} />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-col justify-center space-y-4">
              {analytics?.documentUploadStatus?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: index === 0 ? COLORS.primary : '#ef4444' }}
                    />
                    <span className="font-medium text-gray-700">{item.status}</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminOverview;