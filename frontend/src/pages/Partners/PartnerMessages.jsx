import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PartnerSideBar from "../../components/PartnerSideBar";
import { FaPaperPlane, FaSpinner, FaEllipsisH, FaSmile, FaPaperclip, FaSearch, FaComments, FaCheck, FaCheckDouble } from "react-icons/fa";
import { baseURL } from "../../utils/baseURL";

const PartnerMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedAdminInfo, setSelectedAdminInfo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(null);
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const notificationSound = useRef(new Audio("/message-notification.mp3"));
  const typingTimeout = useRef(null);
  const [adminLastSeen, setAdminLastSeen] = useState({});
  const [messageStatus, setMessageStatus] = useState({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle typing indicator
  const handleTyping = () => {
    const now = new Date().getTime();
    setLastTypingTime(now);
    
    if (!isTyping) {
      setIsTyping(true);
      // Emit typing event to server (implement when WebSocket is added)
    }
    
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= 2000 && isTyping) {
        setIsTyping(false);
        // Emit stopped typing event to server (implement when WebSocket is added)
      }
    }, 2000);
  };

  // Show notification with different sounds based on type
  const showNotification = (message, type = 'message') => {
    setNotification({ ...message, type });
    
    // Play different sounds based on notification type
    switch(type) {
      case 'message':
        notificationSound.current.src = "/message-notification.mp3";
        break;
      case 'typing':
        notificationSound.current.src = "/typing-notification.mp3";
        break;
      case 'read':
        notificationSound.current.src = "/read-notification.mp3";
        break;
      default:
        notificationSound.current.src = "/message-notification.mp3";
    }
    
    notificationSound.current.play().catch(e => console.log("Audio play failed:", e));
    
    // Request permission for system notifications if not granted
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
    
    // Show system notification if permitted
    if (Notification.permission === "granted") {
      const notificationTitle = type === 'message' ? 'New Message' : 
                              type === 'typing' ? 'Someone is typing...' : 
                              'Message Read';
      
      new Notification(notificationTitle, {
        body: type === 'message' ? message.content : 
              type === 'typing' ? `${message.sender.fullName} is typing...` :
              'Your message was read',
        icon: "/logo.png"
      });
    }

    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Update message status
  const updateMessageStatus = async (messageId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseURL}/messages/${messageId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setMessageStatus(prev => ({ ...prev, [messageId]: status }));
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  // Format last seen time
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Offline';
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diff = now - lastSeen;
    
    if (diff < 60000) return 'Active Now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return lastSeen.toLocaleDateString();
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/signin");
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  // Fetch admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/signin");
          return;
        }

        const response = await fetch(`${baseURL}/admin/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch admins");
        }

        const data = await response.json();
        setAdmins(data);
        if (data.length > 0) {
          setSelectedAdmin(data[0]._id);
          setSelectedAdminInfo(data[0]);
        }
      } catch (err) {
        setError("Failed to load admins. Please try again later.");
      }
    };

    fetchAdmins();
  }, [navigate]);

  // Fetch messages
  const fetchMessages = async () => {
    if (!selectedAdmin) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      console.log("Fetching messages for conversation with admin:", selectedAdmin);
      const response = await fetch(`${baseURL}/messages/conversation/${selectedAdmin}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      console.log("Fetched messages:", data);
      
      // Check for new messages and show notification
      if (messages.length > 0 && data.length > messages.length) {
        const newMessages = data.slice(messages.length);
        newMessages.forEach(msg => {
          if (msg.sender._id !== currentUser?.id) {
            showNotification(msg);
          }
        });
      }
      
      setMessages(data);
      setLoading(false);
      scrollToBottom();
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedAdmin, navigate, currentUser?.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedAdmin) return;

    setSending(true);
    setError(""); // Clear any previous errors
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      // Log the data being sent
      console.log("Sending message:", {
        receiverId: selectedAdmin,
        content: newMessage.trim()
      });

      const response = await fetch(`${baseURL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedAdmin,
          content: newMessage.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      const data = await response.json();
      console.log("Message sent successfully:", data);
      
      // Update messages immediately with the new message
      setMessages(prevMessages => [...prevMessages, data]);
      setNewMessage("");
      scrollToBottom();

      // Trigger a refresh of messages after a short delay
      setTimeout(() => {
        fetchMessages();
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
      console.error("Message send error:", err);
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
        <PartnerSideBar />
      </div>
      <div className="ml-[240px] p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Partner <span className="text-[#fea116ff]">Messages</span>
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex h-[calc(100vh-12rem)]">
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                {selectedAdmin && (
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-[#fea116ff] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {selectedAdminInfo?.fullName?.charAt(0) || 'A'}
                        </div>
                        {adminLastSeen[selectedAdmin] === 'Active Now' && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-lg">
                          {selectedAdminInfo?.fullName || 'Admin'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedAdminInfo?.role || selectedAdminInfo?.email || 'Admin'}
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                      <FaEllipsisH />
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
                      <FaComments className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Start a conversation with an admin!</p>
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
                              className={`max-w-[70%] rounded-2xl px-6 py-3 ${
                                message.sender._id === currentUser?.id
                                  ? "bg-[#fea116ff] text-white rounded-br-none"
                                  : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                              }`}
                            >
                              <p className="text-base mb-2">{message.content}</p>
                              <div className="flex items-center justify-end space-x-2">
                                <p className="text-xs opacity-75">
                                  {formatTime(message.createdAt)}
                                </p>
                                {message.sender._id === currentUser?.id && (
                                  <span className="text-xs">
                                    {messageStatus[message._id] === 'read' ? (
                                      <FaCheckDouble className="text-blue-400" />
                                    ) : messageStatus[message._id] === 'delivered' ? (
                                      <FaCheckDouble className="opacity-75" />
                                    ) : (
                                      <FaCheck className="opacity-75" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                  {isTyping && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-sm">Typing...</span>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-200 bg-white">
                  <form onSubmit={handleSend} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type a message..."
                      className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent text-base"
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

          {/* Message Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg animate-slide-in z-50
              ${notification.type === 'message' ? 'bg-[#fea116ff] text-white' :
                notification.type === 'typing' ? 'bg-gray-700 text-white' :
                'bg-green-500 text-white'}`}>
              <p className="font-medium">
                {notification.type === 'message' ? 'New Message' :
                 notification.type === 'typing' ? 'Typing...' :
                 'Message Read'}
              </p>
              <p className="text-sm mt-1">
                {notification.type === 'message' ? notification.content :
                 notification.type === 'typing' ? `${notification.sender.fullName} is typing...` :
                 'Your message was read'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerMessages;