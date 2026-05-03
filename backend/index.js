import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});
app.set('io', io);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.send('WhatsApp Clone Backend is running!');
});

import Message from './models/Message.js';
import User from './models/User.js';

// Socket.io logic
io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", async (userData) => {
    socket.join(userData._id);
    socket.userId = userData._id; // Store userId on socket
    
    await User.findByIdAndUpdate(userData._id, { isOnline: true });
    socket.broadcast.emit("user status change", { userId: userData._id, isOnline: true });
    
    console.log(`User ${userData._id} connected`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (chat) => {
    if (!chat || !chat._id) return;
    const roomId = chat._id.toString();
    console.log(`Typing in ${roomId}`);
    
    // Broadcast to the chat room
    socket.to(roomId).emit("typing", roomId);
    
    // Also broadcast to individual users for sidebar updates
    if (chat.users) {
      chat.users.forEach(u => {
        const targetId = u._id.toString();
        if (targetId !== socket.userId) {
          io.to(targetId).emit("typing", roomId);
        }
      });
    }
  });

  socket.on("stop typing", (chat) => {
    if (!chat || !chat._id) return;
    const roomId = chat._id.toString();
    
    socket.to(roomId).emit("stop typing", roomId);
    
    if (chat.users) {
      chat.users.forEach(u => {
        const targetId = u._id.toString();
        if (targetId !== socket.userId) {
          io.to(targetId).emit("stop typing", roomId);
        }
      });
    }
  });

  socket.on("new message", async (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach(async (user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      // Check if recipient is online to mark as delivered
      const recipient = await User.findById(user._id);
      if (recipient.isOnline) {
        await Message.findByIdAndUpdate(newMessageRecieved._id, { isDelivered: true });
        newMessageRecieved.isDelivered = true;
      }

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("message read", async (data) => {
    const { chatId, userId, messageId } = data;
    if (messageId) {
      await Message.findByIdAndUpdate(messageId, { isRead: true });
    } else {
      await Message.updateMany({ chat: chatId, sender: { $ne: userId } }, { isRead: true });
    }
    socket.in(chatId).emit("message read update", { chatId, userId });
  });

  socket.on("disconnect", async () => {
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: false, 
        lastSeen: new Date() 
      });
      socket.broadcast.emit("user status change", { 
        userId: socket.userId, 
        isOnline: false, 
        lastSeen: new Date() 
      });
      console.log("USER DISCONNECTED");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
