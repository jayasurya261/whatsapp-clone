import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Info, Ban, MinusCircle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useChat } from '../context/ChatContext';
import { messageAPI, userAPI, chatAPI } from '../services/api';
import { encryptMessage, decryptMessage } from '../utils/encryption';

// Components
import SidebarHeader from '../components/chat/Sidebar/SidebarHeader';
import SidebarSearch from '../components/chat/Sidebar/SidebarSearch';
import ChatList from '../components/chat/Sidebar/ChatList';
import ChatHeader from '../components/chat/ChatWindow/ChatHeader';
import MessageList from '../components/chat/ChatWindow/MessageList';
import MessageInput from '../components/chat/ChatWindow/MessageInput';
import MessageSearchSidebar from '../components/chat/ChatWindow/MessageSearchSidebar';
import Avatar from '../components/ui/Avatar';

const Chat = () => {
  const { 
    user, setUser, selectedChat, setSelectedChat, 
    chats, setChats, messages, setMessages,
    invitations, setInvitations, fetchChats, fetchInvitations
  } = useChat();

  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showLocalSearch, setShowLocalSearch] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCallPrompt, setShowCallPrompt] = useState(false);
  const [activeMessageMenuId, setActiveMessageMenuId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const navigate = useNavigate();
  const { socket, socketConnected: connected } = useChat();

  // Socket Message Receiver
  useEffect(() => {
    if (!socket) return;

    socket.on("message recieved", (newMessageRecieved) => {
      if (!selectedChat || selectedChat._id !== newMessageRecieved.chat._id) {
        fetchChats();
      } else {
        const decryptedMessage = {
          ...newMessageRecieved,
          content: decryptMessage(newMessageRecieved.content),
          replyTo: newMessageRecieved.replyTo ? {
            ...newMessageRecieved.replyTo,
            content: decryptMessage(newMessageRecieved.replyTo.content)
          } : null
        };
        setMessages((prev) => [...prev, decryptedMessage]);
      }
    });

    socket.on("invitation received", (newInvitation) => {
      setInvitations((prev) => [newInvitation, ...prev]);
    });

    socket.on("message read update", ({ chatId, userId }) => {
      if (selectedChat && selectedChat._id === chatId) {
        setMessages((prev) => 
          prev.map((m) => m.sender._id !== userId ? { ...m, isRead: true, isDelivered: true } : m)
        );
      }
    });

    return () => {
      socket.off("message recieved");
      socket.off("invitation received");
      socket.off("message read update");
    };
  }, [socket, selectedChat, fetchChats, setMessages, setInvitations]);

  // Handle Mark as Read
  useEffect(() => {
    if (selectedChat && messages.length > 0 && socket) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender._id !== user._id && !lastMessage.isRead) {
        socket.emit("message read", { 
          chatId: selectedChat._id, 
          userId: user._id,
          messageId: lastMessage._id 
        });
      }
    }
  }, [selectedChat, messages, user._id, socket]);

  // Fetch Messages
  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const { data } = await messageAPI.fetchMessages(selectedChat._id);
      const decryptedMessages = data.map(m => ({
        ...m,
        content: decryptMessage(m.content),
        replyTo: m.replyTo ? {
          ...m.replyTo,
          content: decryptMessage(m.replyTo.content)
        } : null
      }));
      setMessages(decryptedMessages);
      setLoading(false);
      socket?.emit("join chat", selectedChat._id);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch messages");
    }
  }, [selectedChat, socket, setMessages]);

  useEffect(() => {
    fetchMessages();
    setShowLocalSearch(false);
    setMessageSearchQuery('');
    setSelectedDate(null);
  }, [selectedChat, fetchMessages]);

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    const currentReplyTo = replyingTo;
    setReplyingTo(null);

    const optimisticMessage = {
      _id: Date.now().toString(),
      content,
      sender: user,
      chat: selectedChat,
      replyTo: currentReplyTo,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const encryptedContent = encryptMessage(content);
      const { data } = await messageAPI.sendMessage({
        content: encryptedContent,
        chatId: selectedChat._id,
        replyTo: currentReplyTo?._id
      });

      const decryptedSentMessage = {
        ...data,
        content: decryptMessage(data.content),
        replyTo: data.replyTo ? {
          ...data.replyTo,
          content: decryptMessage(data.replyTo.content)
        } : null
      };

      socket?.emit("new message", data); // Emit encrypted data to server
      
      setMessages((prev) => 
        prev.map((m) => (m._id === optimisticMessage._id ? decryptedSentMessage : m))
      );
    } catch (error) {
      console.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMessage._id));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await userAPI.searchUsers(query);
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed");
    }
  };

  const handleSendInvite = async (recipientId) => {
    try {
      await userAPI.sendInvite(recipientId);
      toast.success("Invitation sent!");
      setShowSearch(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    }
  };

  const handleAcceptInvite = async (invitationId) => {
    try {
      await userAPI.acceptInvite(invitationId);
      fetchInvitations();
      fetchChats();
      setShowInvitations(false);
    } catch (error) {
      console.error("Failed to accept invitation");
    }
  };

  const handleOpenMenu = (e, msgId, isUserMessage) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 180;
    const leftPos = isUserMessage ? rect.right - menuWidth : rect.left;
    setMenuPosition({ top: rect.bottom + 5, left: leftPos });
    setActiveMessageMenuId(msgId);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!navigator.onLine) {
      toast.error("Please connect to the internet");
      return;
    }

    const messageToDelete = messages.find(m => m._id === messageId);
    if (!messageToDelete) return;

    // Optimistic Update: Remove from screen immediately
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
    setActiveMessageMenuId(null);

    try {
      await messageAPI.deleteMessage(messageId);
      // Optional: success toast
    } catch (err) {
      // Revert on failure
      setMessages(prev => [...prev, messageToDelete].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      toast.error("Failed to delete message. Check your connection.");
    }
  };

  const handleClearChat = async () => {
    if (!selectedChat || !window.confirm("Are you sure?")) return;
    try {
      await messageAPI.clearChat(selectedChat._id);
      setMessages([]);
      setShowMoreMenu(false);
      toast.success("Chat cleared");
    } catch (error) {
      toast.error("Failed to clear chat");
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedChat || !window.confirm("Are you sure?")) return;
    try {
      await chatAPI.deleteChat(selectedChat._id);
      setChats(prev => prev.filter(c => c._id !== selectedChat._id));
      setSelectedChat(null);
      setShowMoreMenu(false);
      toast.success("Chat deleted");
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
  };

  const otherUser = selectedChat?.users.find(u => u._id !== user._id);

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden relative">
      {/* Sidebar */}
      <div className={`
        ${selectedChat ? 'hidden md:flex' : 'flex'} 
        w-full md:w-[30%] md:min-w-[320px] md:max-w-[450px] bg-white flex-col border-r border-[#e9edef] z-30
      `}>
        <SidebarHeader 
          onLogout={handleLogout}
          onToggleInvitations={() => setShowInvitations(!showInvitations)}
          onToggleSearch={() => setShowSearch(!showSearch)}
          invitations={invitations}
          showInvitations={showInvitations}
          onAcceptInvite={handleAcceptInvite}
        />

        {showSearch && (
          <SidebarSearch 
            query={searchQuery}
            onChange={handleSearchUsers}
            results={searchResults}
            onSendInvite={handleSendInvite}
          />
        )}

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

        <ChatList />
      </div>

      {/* Chat Window Container */}
      <div className={`
        ${selectedChat ? 'flex' : 'hidden md:flex'} 
        flex-1 bg-[#efeae2] relative overflow-hidden
      `}>
        <div className="flex-1 flex flex-col relative z-0 min-w-0">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>

          {selectedChat ? (
            <>
              <ChatHeader 
                onToggleLocalSearch={() => setShowLocalSearch(!showLocalSearch)}
                showLocalSearch={showLocalSearch}
                showMoreMenu={showMoreMenu}
                setShowMoreMenu={setShowMoreMenu}
                onClearChat={handleClearChat}
                onDeleteChat={handleDeleteChat}
                onBlockUser={() => toast.error("Block functionality coming soon!")}
                showCallPrompt={showCallPrompt}
                onToggleCallPrompt={() => setShowCallPrompt(!showCallPrompt)}
                onBack={() => setSelectedChat(null)}
              />

              <MessageList 
                loading={loading}
                messageSearchQuery={messageSearchQuery}
                selectedDate={selectedDate}
                onScroll={handleScroll}
                showScrollButton={showScrollButton}
                scrollToBottom={() => {}} // Internal scrollToBottom handles it
                onReply={setReplyingTo}
                onDelete={handleDeleteMessage}
                onCopy={(text) => navigator.clipboard.writeText(text)}
                onScrollToMessage={(id) => document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: 'smooth' })}
                activeMenuId={activeMessageMenuId}
                setActiveMenuId={setActiveMessageMenuId}
                menuPosition={menuPosition}
                handleOpenMenu={handleOpenMenu}
              />

              <MessageInput 
                onSendMessage={handleSendMessage}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center z-10 bg-[#f8f9fa] border-b-[6px] border-[#25d366]">
              <div className="max-w-md px-6">
                <h1 className="text-[32px] font-light text-[#41525d] mb-4">WhatsApp Web</h1>
                <p className="text-[#667781] text-[14px] leading-relaxed mb-8">
                  Send and receive messages without keeping your phone online.<br />
                  Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
                </p>
                <div className="flex items-center justify-center gap-2 text-[#8696a0] text-sm">
                  <span className="w-3 h-3 rounded-full bg-[#8696a0] opacity-40"></span>
                  End-to-end encrypted
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Search Sidebar */}
        <AnimatePresence>
          {showLocalSearch && (
            <MessageSearchSidebar 
              onClose={() => {
                setShowLocalSearch(false);
                setSelectedDate(null);
              }}
              query={messageSearchQuery}
              onChange={setMessageSearchQuery}
              chatName={otherUser?.name}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Chat;
