import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminSideBar from "../../components/AdminSideBar";
import { FaPaperPlane, FaSpinner, FaEllipsisH, FaSmile, FaPaperclip, FaSearch, FaComments } from "react-icons/fa";

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

  // Fetch partners
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/signin");
          return;
        }

        const response = await fetch("http://localhost:3000/api/admin/partners", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch partners");
        }

        const data = await response.json();
        setPartners(data);
        if (data.length > 0) {
          setSelectedPartner(data[0]._id);
        }
      } catch (err) {
        setError("Failed to load partners. Please try again later.");
      }
    };

    fetchPartners();
  }, [navigate]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedPartner) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/signin");
          return;
        }

        const response = await fetch(`http://localhost:3000/api/messages/conversation/${selectedPartner}`, {
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
      const response = await fetch("http://localhost:3000/api/messages", {
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
    <div className="flex h-screen bg-[#fdfcdcff] text-[#001524ff]">
      <AdminSideBar />
      <div className="flex-1 flex overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <FaComments className="text-xl text-[#fea116ff] mr-2" />
              <h2 className="text-xl font-bold">Messages</h2>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search partners..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {partners.map((partner) => (
              <button
                key={partner._id}
                onClick={() => setSelectedPartner(partner._id)}
                className={`w-full p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                  selectedPartner === partner._id ? "bg-[#fdfcdcff] border-l-4 border-[#fea116ff]" : ""
                }`}
              >
                <div className="w-10 h-10 bg-[#fea116ff] rounded-full flex items-center justify-center text-white font-semibold">
                  {partner.fullName.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-900">{partner.fullName}</h3>
                  <p className="text-sm text-gray-500">{partner.restaurantName}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          {selectedPartner && (
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#fea116ff] rounded-full flex items-center justify-center text-white font-semibold">
                  {partners.find(p => p._id === selectedPartner)?.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {partners.find(p => p._id === selectedPartner)?.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {partners.find(p => p._id === selectedPartner)?.restaurantName}
                  </p>
                </div>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <FaEllipsisH />
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fdfcdcff]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <FaSpinner className="animate-spin text-3xl text-[#fea116ff]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
                <div key={date} className="space-y-4">
                  <div className="text-center">
                    <span className="px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-600">
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
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.sender._id === currentUser?.id
                            ? "bg-[#fea116ff] text-white rounded-br-none"
                            : "bg-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm mb-1">{message.content}</p>
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
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <FaPaperclip />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border-none focus:outline-none focus:ring-0 bg-gray-50 rounded-full"
              />
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <FaSmile />
              </button>
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="p-2 text-[#fea116ff] hover:text-[#e69510ff] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </form>
          </div>

          {/* Error Toast */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;