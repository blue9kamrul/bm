import { useState, useEffect } from 'react';
import { MessageSquare, Circle } from 'lucide-react';

import Avatar from 'boring-avatars';
import useUserStore from '../../../stores/authStores/useUserStore';
import api from '../../../lib/api';
import ChatModal from '../../../components/modals/ChatModal';

const IncomingChats = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const { currentUser } = useUserStore();

  useEffect(() => {
    fetchIncomingChats();
  }, []);

  const fetchIncomingChats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/v1/chat/rooms');
      
      // Filter: Only chats where currentUser is the SELLER
      const incomingChats = res.data.data.filter(
        room => room.sellerId === currentUser.id
      );
      
      setChatRooms(incomingChats);
    } catch (err) {
      console.error('Error fetching incoming chats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openChat = (chatRoomId) => {
    setSelectedChatRoomId(chatRoomId);
    setIsChatModalOpen(true);
  };

  const closeChat = () => {
    setIsChatModalOpen(false);
    setSelectedChatRoomId(null);
    fetchIncomingChats(); // Refresh list
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900">
            Incoming Messages
          </h2>
          <p className="text-sm text-gray-600">
            Buyers interested in your products
          </p>
        </div>

        <div className="divide-y">
          {chatRooms.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No incoming messages yet</p>
            </div>
          ) : (
            chatRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => openChat(room.id)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    name={room.buyer.email}
                    colors={["#482344", "#2b5166", "#429867", "#fab243", "#e02130"]}
                    variant="beam"
                    size={50}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {room.buyer.name}
                        </h3>
                        <Circle
                          className={`w-2 h-2 fill-current ${
                            room.isPartnerOnline ? 'text-green-500' : 'text-gray-400'
                          }`}
                        />
                      </div>
                      {room.messages[0] && (
                        <span className="text-xs text-gray-500">
                          {formatTime(room.messages[0].createdAt)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-1 font-medium">
                      📦 {room.product.name}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">
                        {room.messages[0]?.content || 'No messages yet'}
                      </p>
                      {room.unreadCount > 0 && (
                        <span className="ml-2 bg-green-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {room.unreadCount}
                        </span>
                      )}
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
        />
      )}
    </div>
  );
};

export default IncomingChats;