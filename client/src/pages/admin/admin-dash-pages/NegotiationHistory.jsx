import { useState, useEffect } from 'react';
import { MessageSquare, Clock, Package, X, Search } from 'lucide-react';

import Avatar from 'boring-avatars';
import negotiationApi from '../../../lib/negotiationApi';

const NegotiationHistory = () => {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNegotiations();
  }, []);

  const fetchNegotiations = async () => {
    try {
      const response = await negotiationApi.get('/api/v2/agents/admin/negotiations');
      setNegotiations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch negotiations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNegotiations = negotiations.filter(neg => 
    neg.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    neg.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    neg.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Negotiation History</h1>
          <p className="text-gray-600">Monitor all user negotiations and chat activities</p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by user name, email, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Negotiations List */}
        <div className="space-y-3">
          {filteredNegotiations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No negotiations found</p>
            </div>
          ) : (
            filteredNegotiations.map((neg) => (
              <div
                key={`${neg.userId}-${neg.productId}`}
                onClick={() => setSelectedChat(neg)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Avatar */}
                    <Avatar
                      name={neg.userEmail}
                      colors={["#482344", "#2b5166", "#429867", "#fab243", "#e02130"]}
                      variant="beam"
                      size={48}
                    />
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {neg.userName || 'Unknown User'}
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          {neg.messages?.length || 0} messages
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mb-2">{neg.userEmail}</p>
                      
                      {/* Product Info */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Package className="w-4 h-4" />
                          <span className="truncate">{neg.productName || 'Unknown Product'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(neg.lastActive)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="ml-4">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Avatar
                  name={selectedChat.userEmail}
                  colors={["#482344", "#2b5166", "#429867", "#fab243", "#e02130"]}
                  variant="beam"
                  size={40}
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedChat.userName}</h2>
                  <p className="text-sm text-gray-500">{selectedChat.productName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedChat(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedChat.messages?.length === 0 ? (
                <p className="text-center text-gray-500">No messages yet</p>
              ) : (
                selectedChat.messages?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                      {msg.suggestedPrice && (
                        <div className="mt-2 pt-2 border-t border-green-700 border-opacity-30">
                          <p className="text-xs font-semibold">Suggested Price: {msg.suggestedPrice} TK</p>
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${
                        msg.role === 'user' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {formatDate(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total Messages: {selectedChat.messages?.length || 0}</span>
                <span>Last Active: {formatDate(selectedChat.lastActive)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NegotiationHistory;