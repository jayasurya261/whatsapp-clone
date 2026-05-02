import express from 'express';
import Chat from '../models/Chat.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Fetch all chats for a user
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).send(chats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a chat
router.delete('/:chatId', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Ensure user is part of the chat
    if (!chat.users.includes(req.user._id.toString())) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Chat.findByIdAndDelete(req.params.chatId);
    // Also delete all messages in this chat
    await Message.deleteMany({ chat: req.params.chatId });
    
    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
