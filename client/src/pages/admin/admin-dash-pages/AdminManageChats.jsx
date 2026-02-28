import { useState, useEffect } from 'react';
import { MessageSquare, Eye, Trash2, Search, Filter } from 'lucide-react';
import Avatar from 'boring-avatars';
import api from '../../../lib/api';
import ChatModal from '../../../components/modals/ChatModal';

const AdminManageChats = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  console.log(chatRooms)

  useEffect(() => {
    fetchAllChats();
  }, []);

  useEffect(() => {
    filterChats();
  }, [searchTerm, chatRooms]);

  const fetchAllChats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/v1/chat/admin/rooms');
      setChatRooms(res.data.data);
    } catch (err) {
      console.error('Error fetching all chats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterChats = () => {
    let filtered = [...chatRooms];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredRooms(filtered);
  };

  const openChat = (chatRoomId) => {
    setSelectedChatRoomId(chatRoomId);
    setIsChatModalOpen(true);
  };

  const closeChat = () => {
    setIsChatModalOpen(false);
    setSelectedChatRoomId(null);
  };

  const deleteChat = async (chatRoomId, e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this chat room?')) {
      return;
    }

    try {
      await api.delete(`/api/v1/admin/chat/room/${chatRoomId}`);
      fetchAllChats(); // Refresh list
    } catch (err) {
      console.error('Error deleting chat:', err);
      alert('Failed to delete chat room');
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Manage All Chats
          </h2>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by buyer, seller, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-4 text-sm text-gray-600">
            <span>Total: <strong>{chatRooms.length}</strong></span>
            <span>Showing: <strong>{filteredRooms.length}</strong></span>
          </div>
        </div>

        {/* Chat List */}
        <div className="divide-y divide-gray-400 max-h-[600px] overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No chat rooms found</p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div
                key={room.id}
                className="p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start gap-3">
                  {/* Avatars */}
                  <div className="flex -space-x-2">
                    <Avatar
                      name={room.buyer.email}
                      colors={["#482344", "#2b5166", "#429867", "#fab243", "#e02130"]}
                      variant="beam"
                      size={40}
                    />
                    <Avatar
                      name={room.seller.email}
                      colors={["#482344", "#2b5166", "#429867", "#fab243", "#e02130"]}
                      variant="beam"
                      size={40}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          <strong>{room.buyer.name}</strong> ↔ <strong>{room.seller.name}</strong>
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          room.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {room.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {room.messages[0] && (
                        <span className="text-xs text-gray-500">
                          {formatTime(room.messages[0].createdAt)}
                        </span>
                      )}
                    </div>

                    {/* Product */}
                    <p className="text-sm text-gray-600 mb-1 font-medium">
                      📦 {room.product.name}
                    </p>

                    {/* Last Message */}
                    <p className="text-sm text-gray-500 truncate mb-2">
                      {room.messages[0]?.content || 'No messages yet'}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openChat(room.id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View Chat
                      </button>
                      <button
                        onClick={(e) => deleteChat(room.id, e)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      <span className="text-xs text-gray-500">
                        Messages: {room._count?.messages || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isChatModalOpen && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={closeChat}
          chatRoomId={selectedChatRoomId}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default AdminManageChats;