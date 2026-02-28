import { useState, useEffect, useRef } from 'react';
import { X, Send, Circle, ChevronUp } from 'lucide-react';
import io from 'socket.io-client';
import api from '../../lib/api';
import Avatar from 'boring-avatars';
import useUserStore from '../../stores/authStores/useUserStore';

const ChatModal = ({ isOpen, onClose, productId, chatRoomId: initialChatRoomId, isAdmin = false }) => {
  // States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatRoomIdRef = useRef(initialChatRoomId);
  const previousScrollHeight = useRef(0);
  const isCreatingRoom = useRef(false);

  const { currentUser } = useUserStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const maintainScrollPosition = () => {
    if (messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeight.current;
      messagesContainerRef.current.scrollTop += scrollDiff;
    }
  };

  useEffect(() => {
    if (isPartnerTyping) {
      scrollToBottom();
    }
  }, [isPartnerTyping])

  // FIXED: Prevent race condition
  useEffect(() => {
    if (!isOpen) return;

    if (productId && !initialChatRoomId) {
      // Only call if not already creating
      if (!isCreatingRoom.current) {
        createOrGetChatRoom();
      }
    } else if (initialChatRoomId) {
      chatRoomIdRef.current = initialChatRoomId;
      fetchMessages();
    }
  }, [isOpen, productId, initialChatRoomId]);

  useEffect(() => {
    if (socket && chatRoom && !isAdmin) {
      socket.on("partner_status", ({ isOnline }) => {
        setIsPartnerOnline(isOnline);
      })
    }
  }, [chatRoom, isAdmin, socket]);

  useEffect(() => {
    if (!chatRoomIdRef.current || !isOpen || isAdmin) return;
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    const newSocket = io(import.meta.env.VITE_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      newSocket.emit('join_room', { chatRoomId: chatRoomIdRef.current });
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(error.message || 'Socket error occurred');
    });

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
      setIsPartnerTyping(false);
    });

    newSocket.on('messages_read', ({ chatRoomId }) => {
      console.log('Messages read in room:', chatRoomId);
    });

    newSocket.on('user_typing', ({ userId, isTyping }) => {
      if (userId !== currentUser.id) {
        setIsPartnerTyping(isTyping);
      }
    });

    newSocket.on('user_status', ({ userId, isOnline }) => {
      if (chatRoom) {
        const partnerId = chatRoom.buyerId === currentUser.id
          ? chatRoom.sellerId
          : chatRoom.buyerId;

        if (userId === partnerId) {
          setIsPartnerOnline(isOnline);
        }
      }
    });

    setSocket(newSocket);

    return () => {
      if (chatRoomIdRef.current) {
        newSocket.emit('leave_room', chatRoomIdRef.current);
      }
      newSocket.disconnect();
    };
  }, [isOpen, chatRoom, currentUser.id, isAdmin]);

  useEffect(() => {
    if (messages.length > 0 && !isLoadingMore) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (!socket || !chatRoomIdRef.current || isAdmin) return;
    socket.emit('typing', {
      chatRoomId: chatRoomIdRef.current,
      isTyping: newMessage.trim().length > 0
    });
  }, [isAdmin, newMessage, socket]);

  const createOrGetChatRoom = async () => {
    if (isCreatingRoom.current) return;

    isCreatingRoom.current = true;
    setIsLoading(true);

    try {
      const res = await api.post('/api/v1/chat/room', { productId });
      setChatRoom(res.data.data);
      chatRoomIdRef.current = res.data.data.id;
      setMessages(res.data.data.messages || []);
      setHasMore(res.data.data.hasMore || false);
      setPage(1);
    } catch (err) {
      console.error('Error creating chat room:', err);
      alert(err.response?.data?.message || 'Failed to create chat');
    } finally {
      setIsLoading(false);
      isCreatingRoom.current = false;
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/v1/chat/room/${chatRoomIdRef.current}/messages`);
      setMessages(res.data.data.messages);
      setChatRoom(res.data.data.chatRoom);
      setHasMore(res.data.data.pagination?.hasMore || false);
      setPage(res.data.data.pagination?.currentPage || 1);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      if (messagesContainerRef.current) {
        previousScrollHeight.current = messagesContainerRef.current.scrollHeight;
      }
      const res = await api.get(
        `/api/v1/chat/room/${chatRoomIdRef.current}/messages?page=${nextPage}&limit=50`
      );
      const olderMessages = res.data.data.messages;
      setMessages(prev => [...olderMessages, ...prev]);
      setHasMore(res.data.data.pagination?.hasMore || false);
      setPage(nextPage);
      setTimeout(maintainScrollPosition, 0);
    } catch (err) {
      console.error('Error loading more messages:', err);
      alert('Failed to load more messages');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !socket || !isConnected) {
      return;
    }
    socket.emit('send_message', {
      chatRoomId: chatRoomIdRef.current,
      content: trimmedMessage
    });
    setNewMessage('');
  };

  if (!isOpen) return null;

  const partner = chatRoom?.buyerId === currentUser.id
    ? chatRoom?.seller
    : chatRoom?.buyer;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col shadow-2xl">
        {
          isAdmin ? (
            <div className="flex items-center justify-between w-full px-4 py-2 bg-white shadow-sm rounded-md">
              {/* Product Info */}
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 text-base">
                  {chatRoom?.product?.name || 'Loading...'}
                </h3>
                <span className="text-xs text-gray-500">Monitoring Chat</span>
              </div>

              {/* Buyer ↔ Seller */}
              <div className="flex items-center gap-6">
                {/* Seller */}
                <div className="flex flex-col items-center">
                  <Avatar
                    name={chatRoom?.seller?.email}
                    colors={["#482344", "#2b5166", "#429867", "#fab243", "#e02130"]}
                    variant="beam"
                    size={36}
                  />
                  <span className="text-xs text-gray-600">{chatRoom?.seller?.name}</span>
                  <span className="text-[10px] text-purple-500 font-medium">Seller</span>
                </div>

                <span className="text-gray-400">⇄</span>

                {/* Buyer */}
                <div className="flex flex-col items-center">
                  <Avatar
                    name={chatRoom?.buyer?.email}
                    colors={["#482344", "#2b5166", "#429867", "#fab243", "#e02130"]}
                    variant="beam"
                    size={36}
                  />
                  <span className="text-xs text-gray-600">{chatRoom?.buyer?.name}</span>
                  <span className="text-[10px] text-blue-500 font-medium">Buyer</span>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-gray-50">
              <div className="flex items-center gap-3">
                {partner && (
                  <>
                    <Avatar
                      name={partner.email}
                      colors={["#482344", "#2b5166", "#429867", "#fab243", "#e02130"]}
                      variant="beam"
                      size={40}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {chatRoom?.product?.name || 'Loading...'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">{partner.name}</span>
                        <div className="flex items-center gap-1">
                          <Circle
                            className={`w-2 h-2 fill-current ${isPartnerOnline ? 'text-green-500' : 'text-gray-400'}`}
                          />
                          <span className={`text-xs ${isPartnerOnline ? 'text-green-600' : 'text-gray-500'}`}>
                            {isPartnerOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )
                }
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )
        }
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
        >
          {hasMore && !isLoading && (
            <div className="flex justify-center mb-4">
              <button
                onClick={loadMoreMessages}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-white hover:bg-gray-100 rounded-full shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Load More</span>
                  </>
                )}
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isOwn = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${isOwn ? 'bg-green-600 text-white' : 'bg-white text-gray-900'
                        }`}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${isOwn ? 'text-green-100' : 'text-gray-500'
                          }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {isPartnerTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {!isAdmin && (
          <div className="p-4 border-t border-gray-300 bg-white">
            {!isConnected && (
              <div className="mb-2 text-sm text-red-600 text-center">
                Connecting...
              </div>
            )}
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;