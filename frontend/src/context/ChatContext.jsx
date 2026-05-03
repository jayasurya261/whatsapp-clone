import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatAPI, userAPI } from '../services/api';
import { decryptMessage } from '../utils/encryption';
import io from 'socket.io-client';

const ENDPOINT = "http://localhost:5000";
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userInfo')));
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [userStatuses, setUserStatuses] = useState({}); // { userId: { isOnline, lastSeen } }
  const [typingUsers, setTypingUsers] = useState({}); // { chatId: boolean }

  const fetchChats = async () => {
    if (!user) return;
    try {
      const { data } = await chatAPI.fetchChats();
      const decryptedChats = data.map(chat => {
        if (chat.latestMessage) {
          return {
            ...chat,
            latestMessage: {
              ...chat.latestMessage,
              content: decryptMessage(chat.latestMessage.content)
            }
          };
        }
        return chat;
      });
      setChats(decryptedChats);
    } catch (error) {
      console.error("Failed to fetch chats");
    }
  };

  const fetchInvitations = async () => {
    if (!user) return;
    try {
      const { data } = await userAPI.fetchInvitations();
      setInvitations(data);
    } catch (error) {
      console.error("Failed to fetch invitations");
    }
  };

  useEffect(() => {
    if (user) {
      fetchChats();
      fetchInvitations();

      const newSocket = io(ENDPOINT);
      setSocket(newSocket);
      newSocket.emit("setup", user);
      newSocket.on("connected", () => setSocketConnected(true));

      newSocket.on("user status change", ({ userId, isOnline, lastSeen }) => {
        setUserStatuses(prev => ({
          ...prev,
          [userId]: { isOnline, lastSeen }
        }));
      });

      newSocket.on("typing", (roomId) => {
        setTypingUsers(prev => ({ ...prev, [roomId]: true }));
      });

      newSocket.on("stop typing", (roomId) => {
        setTypingUsers(prev => ({ ...prev, [roomId]: false }));
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <ChatContext.Provider value={{
      user, setUser,
      selectedChat, setSelectedChat,
      chats, setChats,
      messages, setMessages,
      invitations, setInvitations,
      socketConnected, setSocketConnected,
      socket,
      userStatuses, setUserStatuses,
      typingUsers, setTypingUsers,
      fetchChats, fetchInvitations
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
