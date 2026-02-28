import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import negotiationApi from '../../lib/negotiationApi';
import Swal from 'sweetalert2';
import api from '../../lib/api';
import PurchaseRequestModal from './PurchaseRequestModal';
import useUserStore from '../../stores/authStores/useUserStore';

const PriceNegotiateWithBot = ({ product, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlacingRequest, setIsPlacingRequest] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const messagesEndRef = useRef(null);
  const [offerFormData, setOfferFormData] = useState({
    buyerCollectionMethod: "",
    buyerPhoneNumber: "",
    buyerPickupTerminal: "",
    buyerDeliveryAddress: "",
    dealPrice: 0,
    productId: product?.id
  });
  const { currentUser } = useUserStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: `Hello! I'm here to help you negotiate the price for ${product.name}. The current asking price is ৳${product.askingPrice}. What price would you like to offer?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, product]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await negotiationApi.post('/api/v2/agents/negotiate', {
        message: inputMessage,
        product,
        user: currentUser
      });
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.reply,
        timestamp: new Date(),
        suggestedPrice: response.data.suggestedPrice
      };

      setMessages(prev => [...prev, botMessage]);
      setCurrentOffer(response.data.suggestedPrice);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: error?.respopnse?.data?.message || 'Sorry, I encountered an error. Please Log In if you are not logged in or try again',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    setInputMessage('');
  };

  const confirmOffer = async () => {
    if (!currentOffer) return;

    Swal.fire({
      title: `Place purchase request?`,
      text: `A request will be sent to the seller to buy ${product.name} for BDT ${currentOffer}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Place Request!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          await negotiationApi.post('/api/v2/agents/negotiate', {
            message: `I accept the offer of ৳${currentOffer}`,
            product: product,
            user: currentUser
          });

          setShowModal(true);
        } catch (error) {
          console.error('Error confirming offer:', error);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handlePlaceRequest = async () => {
    try {
      setIsPlacingRequest(true);
      const res = await api.post("/api/v1/purchase/place", {
        ...offerFormData,
        dealPrice: currentOffer,
        productId: product?.id
      });

      if (!res.data.success) {
        Swal.fire({
          title: "Oops!",
          text: "Something Went Wrong!",
          icon: "error"
        });
      }
      setShowModal(false);
      onClose();
      Swal.fire({
        icon: "success",
        title: "Purchase request placed successfully",
        text: "Waiting for owner's approval.",
        footer:
          '<a href="/dashboard/placed-purchase-requests" style="color: #2563eb; text-decoration: underline;">Go to my requests</a>',
      });
    } catch (error) {
      console.error('Error placing Request:', error);
      Swal.fire({
        icon: "error",
        title: "ERROR!",
        text: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsPlacingRequest(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-full">
              <Bot className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Price Negotiation Bot</h3>
              <p className="text-sm text-gray-600">{product.productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
            >
              <div className={`p-2 rounded-full ${message.type === 'user'
                ? 'bg-green-600'
                : 'bg-gray-200'
                }`}>
                {message.type === 'user' ? (
                  <User className="text-white" size={16} />
                ) : (
                  <Bot className="text-gray-600" size={16} />
                )}
              </div>

              <div className={`flex-1 max-w-xs lg:max-w-md ${message.type === 'user' ? 'text-right' : ''
                }`}>
                <div className={`p-3 rounded-lg ${message.type === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  {message.content}
                </div>

                {message.suggestedPrice && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Suggested Price: <span className="font-semibold">৳{message.suggestedPrice}</span>
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="bg-gray-200 p-2 rounded-full">
                <Bot className="text-gray-600" size={16} />
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <Loader2 className="animate-spin" size={16} />
                <span className="ml-2 text-gray-600">Bot is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Action Buttons */}
        {currentOffer && (
          <div className="px-4 py-2 bg-green-50 border-t border-green-200">
            <button
              onClick={confirmOffer}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Accept Offer of ৳{currentOffer}
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your offer or message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
      {showModal && (
        <PurchaseRequestModal 
          handlePlaceRequest={handlePlaceRequest}
          isPlacingRequest={isPlacingRequest}
          offerFormData={offerFormData}
          setOfferFormData={setOfferFormData}
          setShowModal={setShowModal}
          offerPrice={currentOffer}
          key={product?.id}
        />
      )}
    </div>
  );
};

export default PriceNegotiateWithBot;