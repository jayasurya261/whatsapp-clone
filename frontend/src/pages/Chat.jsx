import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MoreVertical, MessageSquare, Phone, Video, 
  Smile, Plus, Mic, Send, CheckCheck, User, LogOut, 
  UserPlus, Bell, Check, X, Loader2, Clock, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Reply, Copy, Trash2, Star, Forward, Pin, Download, Smile as SmileIcon, MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';

const ENDPOINT = "http://localhost:5000";
let socket;

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showLocalSearch, setShowLocalSearch] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [showCallPrompt, setShowCallPrompt] = useState(false);
  const [activeMessageMenuId, setActiveMessageMenuId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));

  // Socket Connection
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Fetch Chats
  const fetchChats = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`${ENDPOINT}/api/chats`, config);
      setChats(data);
    } catch (error) {
      console.error("Failed to fetch chats");
    }
  };

  // Fetch Invitations
  const fetchInvitations = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`${ENDPOINT}/api/users/invitations`, config);
      setInvitations(data);
    } catch (error) {
      console.error("Failed to fetch invitations");
    }
  };

  useEffect(() => {
    if (user) {
      fetchChats();
      fetchInvitations();
    }
  }, []);

  // Socket Message Receiver
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (!selectedChat || selectedChat._id !== newMessageRecieved.chat._id) {
        fetchChats();
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });

    socket.on("invitation received", (newInvitation) => {
      setInvitations((prev) => [newInvitation, ...prev]);
    });

    socket.on("message read update", ({ chatId, userId }) => {
      if (selectedChat && selectedChat._id === chatId) {
        setMessages((prev) => 
          prev.map((m) => m.sender._id !== userId ? { ...m, isRead: true } : m)
        );
      }
    });
  });

  // Handle Mark as Read
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender._id !== user._id && !lastMessage.isRead) {
        socket.emit("message read", { chatId: selectedChat._id, userId: user._id });
      }
    }
  }, [selectedChat, messages, user._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Show button if we're more than 200px away from the bottom
    if (scrollHeight - scrollTop - clientHeight > 200) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch Messages for Selected Chat
  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`${ENDPOINT}/api/messages/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch messages");
    }
  };

  useEffect(() => {
    fetchMessages();
    setShowLocalSearch(false);
    setMessageSearchQuery('');
  }, [selectedChat]);

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleOpenMenu = (e, msgId, isUserMessage) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // If it's a user message (right side), show menu to the left of the chevron
    // If it's an incoming message (left side), show menu to the right of the chevron
    const menuWidth = 180;
    const leftPos = isUserMessage ? rect.right - menuWidth : rect.left;
    setMenuPosition({ top: rect.bottom + 5, left: leftPos });
    setActiveMessageMenuId(msgId);
  };

  const scrollToMessage = (messageId) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-message');
      setTimeout(() => {
        element.classList.remove('highlight-message');
      }, 2000);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      await axios.delete(`${ENDPOINT}/api/messages/${messageId}`, config);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      setActiveMessageMenuId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    setActiveMessageMenuId(null);
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage;
    const currentReplyTo = replyingTo;
    setNewMessage("");
    setShowEmojiPicker(false);
    setReplyingTo(null);

    const optimisticMessage = {
      _id: Date.now().toString(),
      content: messageContent,
      sender: user,
      chat: selectedChat,
      replyTo: currentReplyTo,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages([...messages, optimisticMessage]);

    try {
      const config = {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}` 
        },
      };
      const { data } = await axios.post(`${ENDPOINT}/api/messages`, {
        content: messageContent,
        chatId: selectedChat._id,
        replyTo: currentReplyTo?._id
      }, config);

      socket.emit("new message", data);
      
      setMessages((prev) => 
        prev.map((m) => (m._id === optimisticMessage._id ? data : m))
      );
    } catch (error) {
      console.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMessage._id));
    }
  };

  // Search User
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`${ENDPOINT}/api/users?search=${query}`, config);
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed");
    }
  };

  // Send Invitation
  const sendInvite = async (recipientId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      await axios.post(`${ENDPOINT}/api/users/invite`, { recipientId }, config);
      alert("Invitation sent!");
      setShowSearch(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send invitation");
    }
  };

  // Accept Invitation
  const acceptInvite = async (invitationId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      await axios.post(`${ENDPOINT}/api/users/accept`, { invitationId }, config);
      fetchInvitations();
      fetchChats();
      setShowInvitations(false);
    } catch (error) {
      console.error("Failed to accept invitation");
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const otherUser = selectedChat?.users.find(u => u._id !== user._id);

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-[30%] min-w-[320px] max-w-[450px] bg-white flex flex-col border-r border-[#e9edef]">
        {/* Sidebar Header */}
        <div className="h-[60px] bg-[#f0f2f5] flex items-center justify-between px-4">
          <div className="flex items-center gap-3 relative group">
            <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold border border-white shadow-sm overflow-hidden">
              {user?.avatar ? <img src={user.avatar} alt="me" /> : user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-[#3b4a54] truncate max-w-[120px]">{user?.name || user?.username}</span>
            <div className="absolute top-full left-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
              <button onClick={handleLogout} className="bg-white text-red-600 text-xs font-bold px-4 py-2 rounded shadow-md border border-red-100 hover:bg-red-50">Logout</button>
            </div>
          </div>
          <div className="flex gap-4 text-[#54656f]">
            <div className="relative">
              <Bell className="w-6 h-6 cursor-pointer" onClick={() => setShowInvitations(!showInvitations)} />
              {invitations.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{invitations.length}</span>}
              {showInvitations && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-2 z-50 border border-[#e9edef]">
                  <h4 className="px-4 py-2 font-bold text-[#111b21] border-b">Invitations</h4>
                  {invitations.length === 0 ? <p className="px-4 py-4 text-sm text-[#667781]">No pending invitations</p> : 
                    invitations.map(invite => (
                      <div key={invite._id} className="px-4 py-3 hover:bg-[#f5f6f6] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={invite.sender.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#111b21]">{invite.sender.name}</span>
                            <span className="text-xs text-[#667781]">@{invite.sender.username}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Check className="w-5 h-5 text-green-500 cursor-pointer" onClick={() => acceptInvite(invite._id)} />
                          <X className="w-5 h-5 text-red-500 cursor-pointer" />
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            <UserPlus className="w-6 h-6 cursor-pointer" onClick={() => setShowSearch(!showSearch)} />
            <MoreVertical className="w-6 h-6 cursor-pointer" />
          </div>
        </div>

        {/* Search/Add User Section */}
        {showSearch && (
          <div className="p-4 bg-[#f0f2f5] animate-in slide-in-from-top duration-200">
            <div className="bg-white flex items-center px-3 py-1.5 rounded-lg mb-4">
              <Search className="w-5 h-5 text-[#8696a0]" />
              <input 
                type="text" 
                placeholder="Search username..." 
                className="bg-transparent border-none outline-none w-full px-4 text-sm text-[#3b4a54]"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {searchResults.map(result => (
                <div key={result._id} className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors mb-1">
                  <div className="flex items-center gap-3">
                    <img src={result.avatar} className="w-10 h-10 rounded-full" alt="avatar" />
                    <div>
                      <p className="text-sm font-medium text-[#111b21]">{result.name}</p>
                      <p className="text-xs text-[#667781]">@{result.username}</p>
                    </div>
                  </div>
                  <button onClick={() => sendInvite(result._id)} className="bg-[#00a884] text-white p-1.5 rounded-full hover:bg-[#008f6f]">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Search Bar (Local Filter) */}
        {!showSearch && (
          <div className="p-2 bg-white">
            <div className="bg-[#f0f2f5] flex items-center px-3 py-1.5 rounded-lg">
              <Search className="w-5 h-5 text-[#8696a0]" />
              <input 
                type="text" 
                placeholder="Search or start new chat" 
                className="bg-transparent border-none outline-none w-full px-4 text-sm text-[#3b4a54]"
              />
            </div>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chats.length === 0 ? (
            <div className="p-10 text-center text-[#667781] text-sm">
              No chats yet. Search for users and send invitations!
            </div>
          ) : (
            chats.map((chat) => {
              const otherU = chat.users.find(u => u._id !== user._id);
              return (
                <div 
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex items-center px-3 h-[72px] cursor-pointer hover:bg-[#f5f6f6] transition-colors ${selectedChat?._id === chat._id ? 'bg-[#f0f2f5]' : ''}`}
                >
                  <img src={otherU.avatar} alt="avatar" className="w-12 h-12 rounded-full" />
                  <div className="flex-1 ml-4 border-b border-[#e9edef] h-full flex flex-col justify-center py-2 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium text-[#111b21] truncate">{otherU.name}</h3>
                      <span className="text-xs text-[#667781]">
                        {chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-[#667781] truncate pr-2">
                      {chat.latestMessage ? chat.latestMessage.content : 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex bg-[#efeae2] relative overflow-hidden">
        <div className="flex-1 flex flex-col relative z-0">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>

          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="h-[60px] bg-[#f0f2f5] flex items-center justify-between px-4 z-10 border-b border-[#e9edef]">
                <div className="flex items-center gap-3">
                  <img src={otherUser.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                  <div className="flex flex-col">
                    <h3 className="text-[16px] font-medium text-[#111b21] leading-tight">{otherUser.name}</h3>
                    <span className="text-[12px] text-[#667781]">@{otherUser.username}</span>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <button 
                      onClick={() => setShowCallPrompt(!showCallPrompt)}
                      className="flex items-center gap-2 bg-[#f0f2f5] hover:bg-[#e9edef] px-3 py-1.5 rounded-full border border-[#d1d7db] transition-colors cursor-pointer group"
                    >
                      <Video className="w-4 h-4 text-[#54656f]" />
                      <span className="text-sm font-medium text-[#54656f]">Call</span>
                      <ChevronDown className="w-4 h-4 text-[#54656f]" />
                    </button>
                  </div>
                  <div className="border-l border-[#d1d7db] h-6 mx-1"></div>
                  <Search className={`w-5 h-5 cursor-pointer ${showLocalSearch ? 'text-[#00a884]' : 'text-[#54656f]'}`} onClick={() => setShowLocalSearch(!showLocalSearch)} />
                  <MoreVertical className="w-5 h-5 text-[#54656f] cursor-pointer" />
                </div>
              </div>

              {/* Call Prompt - rendered outside header to avoid z-index issues */}
              {showCallPrompt && (
                <div className="fixed inset-0 z-[9999]" onClick={() => setShowCallPrompt(false)}>
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-[65px] right-[40px] w-[420px] bg-white rounded-xl shadow-[0_4px_24px_rgba(11,20,26,0.12)] p-8 border border-[#e9edef]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between gap-8">
                      <div className="flex flex-col gap-2 text-left">
                        <h3 className="text-[#111b21] font-semibold text-[18px] leading-tight">Make calls with the Windows app</h3>
                        <p className="text-[#667781] text-[14px] leading-normal">Download WhatsApp for Windows to start making calls.</p>
                      </div>
                      <button 
                        onClick={() => {
                          window.open("https://get.microsoft.com/installer/download/9NKSQGP7F2NH?cid=call_btn_modal", "_blank");
                          setShowCallPrompt(false);
                        }}
                        className="bg-[#00a884] text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-[#06cf9c] shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                      >
                        Get the app
                      </button>
                    </div>
                    <button 
                      className="absolute top-4 right-4 p-1.5 hover:bg-[#f0f2f5] rounded-full cursor-pointer transition-colors"
                      onClick={() => setShowCallPrompt(false)}
                    >
                      <X className="w-5 h-5 text-[#8696a0]" />
                    </button>
                  </motion.div>
                </div>
              )}

              {/* Messages Area */}
              <div 
                className="flex-1 overflow-y-auto px-10 py-4 z-10 custom-scrollbar flex flex-col gap-2 relative"
                onScroll={handleScroll}
              >
                {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00a884]" />
                  </div>
                ) : (
                  Object.entries(
                    messages
                      .filter(msg => {
                        const matchesText = msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase());
                        const matchesDate = selectedDate ? new Date(msg.createdAt).toDateString() === selectedDate.toDateString() : true;
                        return matchesText && matchesDate;
                      })
                      .reduce((groups, message) => {
                        const date = new Date(message.createdAt).toDateString();
                        if (!groups[date]) groups[date] = [];
                        groups[date].push(message);
                        return groups;
                      }, {})
                  ).map(([dateStr, dayMessages]) => {
                    const formatDate = (dateString) => {
                      const date = new Date(dateString);
                      const today = new Date();
                      const yesterday = new Date();
                      yesterday.setDate(today.getDate() - 1);

                      if (date.toDateString() === today.toDateString()) return "TODAY";
                      if (date.toDateString() === yesterday.toDateString()) return "YESTERDAY";
                      return date.toLocaleDateString('en-GB');
                    };

                    return (
                      <div key={dateStr} className="flex flex-col gap-2">
                        <div className="flex justify-center my-4 sticky top-0 z-20">
                          <span className="bg-[#f0f2f5] px-3 py-1.5 rounded-lg shadow-sm text-[12px] text-[#54656f] font-medium uppercase tracking-wide border border-[#e9edef]">
                            {formatDate(dateStr)}
                          </span>
                        </div>
                        {dayMessages.map((msg) => (
                          <div 
                            key={msg._id} 
                            id={`msg-${msg._id}`}
                            className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'} mb-2 group relative`}
                            onMouseLeave={() => setActiveMessageMenuId(null)}
                          >
                            <div className={`max-w-[65%] px-3 py-2 rounded-lg shadow-sm relative ${msg.sender._id === user._id ? 'bg-[#d9fdd3] rounded-tr-none mr-2' : 'bg-white rounded-tl-none ml-2'}`}>
                              {/* Message Tail */}
                              <div className={`absolute top-0 w-2 h-2.5 ${msg.sender._id === user._id ? '-right-2 bg-[#d9fdd3] [clip-path:polygon(0_0,0_100%,100%_0)]' : '-left-2 bg-white [clip-path:polygon(100%_0,100%_100%,0_0)]'}`}></div>

                              {/* Reply Context */}
                              {msg.replyTo && (
                                <div 
                                  onClick={() => scrollToMessage(msg.replyTo._id)}
                                  className={`mb-1.5 p-2 rounded-md bg-black/5 border-l-[4px] ${msg.sender._id === user._id ? 'border-[#00a884]' : 'border-[#53bdeb]'} text-[13px] cursor-pointer hover:bg-black/10 transition-colors`}
                                >
                                  <span className="font-semibold block text-[#00a884]">{msg.replyTo.sender.name === user.name ? 'You' : msg.replyTo.sender.name}</span>
                                  <span className="text-[#667781] line-clamp-1">{msg.replyTo.content}</span>
                                </div>
                              )}
                              
                              {/* Message Actions Trigger */}
                              <div className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 ${activeMessageMenuId === msg._id ? 'opacity-100' : ''}`}>
                                <button 
                                  onClick={(e) => handleOpenMenu(e, msg._id, msg.sender._id === user._id)}
                                  className="p-1 hover:bg-black/5 rounded-full text-[#8696a0] hover:text-[#111b21] transition-all"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Message Context Menu - Rendered via Fixed Overlay */}
                              <AnimatePresence>
                                {activeMessageMenuId === msg._id && (
                                  <div className="fixed inset-0 z-[999]" onClick={() => setActiveMessageMenuId(null)}>
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.9, y: -5 }}
                                      className="fixed w-[180px] bg-white rounded-lg shadow-[0_4px_20px_rgba(11,20,26,0.15)] py-2 border border-[#e9edef]"
                                      style={{ top: menuPosition.top, left: menuPosition.left }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button onClick={() => { setReplyingTo(msg); setActiveMessageMenuId(null); }} className="w-full px-4 py-2 text-left text-[14.5px] hover:bg-[#f5f6f6] flex items-center gap-3 text-[#3b4a54]">
                                        <Reply className="w-4 h-4 opacity-70" /> Reply
                                      </button>
                                      <button onClick={() => handleCopyMessage(msg.content)} className="w-full px-4 py-2 text-left text-[14.5px] hover:bg-[#f5f6f6] flex items-center gap-3 text-[#3b4a54]">
                                        <Copy className="w-4 h-4 opacity-70" /> Copy
                                      </button>
                                      <button className="w-full px-4 py-2 text-left text-[14.5px] hover:bg-[#f5f6f6] flex items-center gap-3 text-[#3b4a54]">
                                        <Forward className="w-4 h-4 opacity-70" /> Forward
                                      </button>
                                      <button className="w-full px-4 py-2 text-left text-[14.5px] hover:bg-[#f5f6f6] flex items-center gap-3 text-[#3b4a54]">
                                        <Star className="w-4 h-4 opacity-70" /> Star
                                      </button>
                                      <div className="border-t border-[#e9edef] my-1"></div>
                                      {msg.sender._id === user._id && (
                                        <button onClick={() => handleDeleteMessage(msg._id)} className="w-full px-4 py-2 text-left text-[14.5px] hover:bg-[#f5f6f6] flex items-center gap-3 text-[#ea0038]">
                                          <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                      )}
                                    </motion.div>
                                  </div>
                                )}
                              </AnimatePresence>

                              <div className="relative pr-6">
                                <p className="text-[14.2px] text-[#111b21] whitespace-pre-wrap break-words pb-1">
                                  {messageSearchQuery ? (
                                    msg.content.split(new RegExp(`(${messageSearchQuery})`, 'gi')).map((part, i) => 
                                      part.toLowerCase() === messageSearchQuery.toLowerCase() ? 
                                        <span key={i} className="bg-yellow-200 text-black">{part}</span> : part
                                    )
                                  ) : msg.content}
                                </p>
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-[11px] text-[#667781] uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                  {msg.sender._id === user._id && (
                                    msg.pending ? (
                                      <Clock className="w-3 h-3 text-[#8696a0]" />
                                    ) : (
                                      <CheckCheck className={`w-4 h-4 ${msg.isRead ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`} />
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
                
                {/* Scroll to Bottom Button */}
                <AnimatePresence>
                  {showScrollButton && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={scrollToBottom}
                      className="sticky bottom-4 right-4 self-end bg-white w-[54px] h-[32px] rounded-full shadow-lg flex items-center justify-center cursor-pointer text-[#54656f] hover:bg-[#f8f9fa] z-30 border border-[#e9edef] transition-colors"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Message Input Area */}
              <div className="bg-[#f0f2f5] px-4 py-2 z-10 flex flex-col relative">
                {showEmojiPicker && (
                  <div className="absolute bottom-[60px] left-4 z-50 shadow-2xl">
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick} 
                      width={350} 
                      height={400} 
                      searchDisabled={true}
                      skinTonesDisabled={true}
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}

                {/* Reply Preview */}
                <AnimatePresence>
                  {replyingTo && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="w-full bg-[#f0f2f5] pb-2 flex flex-col relative"
                    >
                      <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-[#e9edef] flex flex-col gap-1 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00a884]"></div>
                        <div className="flex justify-between items-start">
                          <span className="text-[#00a884] font-semibold text-sm">
                            {replyingTo.sender._id === user._id ? 'You' : replyingTo.sender.name}
                          </span>
                          <X className="w-4 h-4 text-[#8696a0] cursor-pointer hover:text-[#111b21]" onClick={() => setReplyingTo(null)} />
                        </div>
                        <p className="text-[#667781] text-sm line-clamp-1">{replyingTo.content}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-4">
                  <Smile 
                    className={`w-6 h-6 cursor-pointer ${showEmojiPicker ? 'text-[#00a884]' : 'text-[#54656f]'} hover:text-[#111b21]`} 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                  />
                  <Plus className="w-6 h-6 text-[#54656f] cursor-pointer hover:text-[#111b21]" />
                  <form onSubmit={handleSendMessage} className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Type a message" 
                      className="w-full bg-white border-none outline-none px-4 py-2.5 rounded-lg text-[15px] text-[#3b4a54] shadow-sm"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        if(showEmojiPicker) setShowEmojiPicker(false);
                      }}
                    />
                  </form>
                  <div 
                    onClick={handleSendMessage}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${newMessage.trim() ? 'bg-[#00a884] text-white shadow-md scale-110' : 'text-[#8696a0]'}`}
                  >
                    <Send className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center z-10 bg-[#f8f9fa] border-b-[6px] border-[#25d366]">
              <MessageSquare className="w-64 h-64 text-[#41525d] opacity-10 mb-8" />
              <h1 className="text-3xl font-light text-[#41525d] mb-4">WhatsApp Realtime</h1>
              <p className="text-sm text-[#667781] max-w-md px-10">Select a chat or find new users to start messaging in real-time with Socket.io.</p>
            </div>
          )}
        </div>

        {/* Right Search Sidebar */}
        <AnimatePresence>
          {showLocalSearch && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="w-[30%] min-w-[320px] bg-white border-l border-[#e9edef] flex flex-col z-20 shadow-xl"
            >
              {/* Sidebar Header */}
              <div className="h-[60px] bg-[#f0f2f5] flex items-center px-4 gap-6">
                <X className="w-5 h-5 text-[#54656f] cursor-pointer" onClick={() => setShowLocalSearch(false)} />
                <h2 className="text-[#3b4a54] font-medium">Search messages</h2>
              </div>
              
              {/* Sidebar Content */}
              <div className="p-4 flex flex-col gap-4">
                <div className="bg-[#f0f2f5] flex items-center px-3 py-1.5 rounded-lg border border-transparent focus-within:border-[#00a884] transition-all relative">
                  <Search className="w-4 h-4 text-[#8696a0] mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-transparent border-none outline-none w-full text-sm text-[#3b4a54]"
                    autoFocus
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                  />
                  <Calendar 
                    className={`w-4 h-4 ml-2 cursor-pointer transition-colors ${showDatePicker ? 'text-[#00a884]' : 'text-[#8696a0] hover:text-[#00a884]'}`} 
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  />

                  {/* Calendar Picker Popup */}
                  <AnimatePresence>
                    {showDatePicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-[280px] bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-[#e9edef]"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[#111b21] font-medium">
                              {currentCalendarDate.toLocaleString('default', { month: 'long' })} {currentCalendarDate.getFullYear()}
                            </h3>
                            <div className="flex gap-2">
                              <ChevronLeft 
                                className="w-5 h-5 text-[#54656f] cursor-pointer hover:text-[#111b21] transition-colors" 
                                onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1)))}
                              />
                              <ChevronRight 
                                className={`w-5 h-5 transition-colors ${currentCalendarDate.getMonth() >= new Date().getMonth() && currentCalendarDate.getFullYear() >= new Date().getFullYear() ? 'text-[#e9edef] cursor-not-allowed' : 'text-[#54656f] cursor-pointer hover:text-[#111b21]'}`} 
                                onClick={() => {
                                  if (!(currentCalendarDate.getMonth() >= new Date().getMonth() && currentCalendarDate.getFullYear() >= new Date().getFullYear())) {
                                    setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1)));
                                  }
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <div key={day} className="text-[10px] text-[#8696a0] text-center font-medium uppercase">{day.charAt(0)}</div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1).getDay() }).map((_, i) => (
                              <div key={`empty-${i}`} className="h-8" />
                            ))}
                            {Array.from({ length: new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                              const day = i + 1;
                              const dateObj = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              
                              const isFuture = dateObj > today;
                              const isToday = dateObj.toDateString() === today.toDateString();
                              const isSelected = selectedDate?.toDateString() === dateObj.toDateString();
                              
                              return (
                                <div 
                                  key={day} 
                                  onClick={() => {
                                    if (isFuture) return;
                                    setSelectedDate(isSelected ? null : dateObj);
                                    setShowDatePicker(false);
                                  }}
                                  className={`h-8 flex items-center justify-center text-sm rounded-full transition-all
                                    ${isFuture ? 'text-[#e9edef] cursor-not-allowed opacity-70' : 'cursor-pointer'}
                                    ${isSelected ? 'bg-[#00a884] text-white' : 
                                      isToday ? 'text-[#00a884] font-bold border border-[#00a884]/30' : 
                                      isFuture ? '' : 'text-[#54656f] hover:bg-[#f5f6f6] hover:text-[#111b21]'}
                                  `}
                                >
                                  {day}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        {selectedDate && (
                          <div className="bg-[#f0f2f5] px-4 py-2 flex justify-between items-center border-t border-[#e9edef]">
                            <span className="text-xs text-[#667781]">Selected: {selectedDate.toLocaleDateString()}</span>
                            <span className="text-xs text-[#00a884] cursor-pointer font-medium" onClick={() => setSelectedDate(null)}>Clear</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-20 flex flex-col items-center text-center px-6">
                  {messageSearchQuery === '' ? (
                    <p className="text-sm text-[#667781]">Search for messages with {otherUser?.name}.</p>
                  ) : (
                    messages.filter(msg => msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase())).length === 0 && (
                      <p className="text-sm text-[#667781]">No messages found</p>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ced0d1; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #aab2b7; }
      `}} />
    </div>
  );
};

export default Chat;
