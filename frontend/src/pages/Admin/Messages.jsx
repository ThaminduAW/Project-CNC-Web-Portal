import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminSideBar from "../../components/AdminSideBar";
import { FaPaperPlane, FaSpinner, FaEllipsisH, FaSmile, FaPaperclip, FaSearch, FaComments, FaCircle } from "react-icons/fa";
import { baseURL } from "../../utils/baseURL";

const Messages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessageDates, setLastMessageDates] = useState({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/signin");
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  // Fetch partners with unread counts and last message dates
  const fetchPartners = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(`${baseURL}/admin/partners`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch partners");
      }

      const data = await response.json();
      
      // Fetch unread counts and last message dates for each partner
      const partnerData = await Promise.all(
        data.map(async (partner) => {
          const messagesResponse = await fetch(
            `${baseURL}/messages/conversation/${partner._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          if (!messagesResponse.ok) {
            throw new Error("Failed to fetch messages");
          }

          const messagesData = await messagesResponse.json();
          const unreadCount = messagesData.filter(
            msg => !msg.read && msg.sender._id !== currentUser?.id
          ).length;

          const lastMessage = messagesData[messagesData.length - 1];
          const lastMessageDate = lastMessage ? new Date(lastMessage.createdAt) : new Date(0);

          return {
            ...partner,
            unreadCount,
            lastMessageDate
          };
        })
      );

      // Sort partners by last message date (newest first)
      const sortedPartners = partnerData.sort((a, b) => b.lastMessageDate - a.lastMessageDate);
      setPartners(sortedPartners);
    } catch (err) {
      setError("Failed to load partners. Please try again later.");
    }
  };

  useEffect(() => {
    fetchPartners();
    // Set up polling for partner list updates
    const interval = setInterval(fetchPartners, 30000);
    return () => clearInterval(interval);
  }, [navigate, currentUser?.id]);

  // Fetch messages and mark them as read when conversation is opened
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedPartner) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/signin");
          return;
        }

        const response = await fetch(`${baseURL}/messages/conversation/${selectedPartner}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        setMessages(data);
        setLoading(false);
        scrollToBottom();

        // Mark messages as read
        await fetch(`${baseURL}/messages/read/${selectedPartner}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Update partner list to reflect read messages
        fetchPartners();
      } catch (err) {
        setError("Failed to load messages. Please try again later.");
        setLoading(false);
      }
    };

    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedPartner, navigate]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner) return;

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseURL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedPartner,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setMessages([...messages, data]);
      setNewMessage("");
      scrollToBottom();

      // Update partner list to reflect new message
      fetchPartners();
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString();
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  return (
    <div className="min-h-screen bg-[#fdfcdcff]">
      <div className="fixed left-0 top-0 h-full z-30">
        <AdminSideBar />
      </div>
      <div className="ml-[240px] p-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-[calc(100vh-8rem)]">
            {/* Contacts Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center mb-6">
                  <FaComments className="text-2xl text-[#fea116ff] mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search partners..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {partners.map((partner) => (
                  <button
                    key={partner._id}
                    onClick={() => setSelectedPartner(partner._id)}
                    className={`w-full p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors relative ${
                      selectedPartner === partner._id ? "bg-[#fdfcdcff] border-l-4 border-[#fea116ff]" : ""
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-[#fea116ff] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {partner.fullName.charAt(0)}
                      </div>
                      {partner.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">{partner.unreadCount}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 text-lg">{partner.fullName}</h3>
                        {partner.unreadCount > 0 && (
                          <FaCircle className="text-[#fea116ff] text-xs" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{partner.restaurantName}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatLastMessageDate(partner.lastMessageDate)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              {selectedPartner && (
                <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-[#fea116ff] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {partners.find(p => p._id === selectedPartner)?.fullName.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">
                        {partners.find(p => p._id === selectedPartner)?.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {partners.find(p => p._id === selectedPartner)?.restaurantName}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                    <FaEllipsisH className="text-xl" />
                  </button>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fdfcdcff]">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <FaSpinner className="animate-spin text-4xl text-[#fea116ff]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <div className="text-7xl mb-4">💬</div>
                    <p className="text-xl">No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
                    <div key={date} className="space-y-4">
                      <div className="text-center">
                        <span className="px-4 py-2 bg-gray-200 rounded-full text-sm text-gray-600">
                          {date}
                        </span>
                      </div>
                      {dateMessages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${
                            message.sender._id === currentUser?.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-6 py-3 relative ${
                              message.sender._id === currentUser?.id
                                ? "bg-[#fea116ff] text-white rounded-br-none"
                                : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                            }`}
                          >
                            {!message.read && message.sender._id !== currentUser?.id && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#fea116ff] rounded-full" />
                            )}
                            <p className="text-base mb-2">{message.content}</p>
                            <p className="text-xs opacity-75 text-right">
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200 bg-white">
                <form onSubmit={handleSend} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 border-none focus:outline-none focus:ring-0 bg-gray-50 rounded-full text-base"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="p-3 text-[#fea116ff] hover:text-[#e69510ff] disabled:opacity-50 disabled:cursor-not-allowed rounded-full hover:bg-gray-100"
                  >
                    {sending ? (
                      <FaSpinner className="animate-spin text-xl" />
                    ) : (
                      <FaPaperPlane className="text-xl" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg z-50">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format last message date
const formatLastMessageDate = (date) => {
  if (!date) return '';
  const now = new Date();
  const messageDate = new Date(date);
  const diff = now - messageDate;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  return messageDate.toLocaleDateString();
};

export default Messages;