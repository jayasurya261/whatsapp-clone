import axios from 'axios';

const ENDPOINT = "http://localhost:5000";

const API = axios.create({
  baseURL: `${ENDPOINT}/api`,
});

API.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
};

export const chatAPI = {
  fetchChats: () => API.get('/chats'),
  createChat: (userId) => API.post('/chats', { userId }),
  deleteChat: (chatId) => API.delete(`/chats/${chatId}`),
};

export const messageAPI = {
  fetchMessages: (chatId) => API.get(`/messages/${chatId}`),
  sendMessage: (data) => API.post('/messages', data),
  deleteMessage: (messageId) => API.delete(`/messages/${messageId}`),
  clearChat: (chatId) => API.delete(`/messages/clear/${chatId}`),
};

export const userAPI = {
  searchUsers: (query) => API.get(`/users?search=${query}`),
  sendInvite: (recipientId) => API.post('/users/invite', { recipientId }),
  fetchInvitations: () => API.get('/users/invitations'),
  acceptInvite: (invitationId) => API.post('/users/accept', { invitationId }),
};

export default API;
