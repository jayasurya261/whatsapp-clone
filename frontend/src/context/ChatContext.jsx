import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatAPI, userAPI } from '../services/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userInfo')));
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const fetchChats = async () => {
    if (!user) return;
    try {
      const { data } = await chatAPI.fetchChats();
      setChats(data);
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
      fetchChats, fetchInvitations
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
