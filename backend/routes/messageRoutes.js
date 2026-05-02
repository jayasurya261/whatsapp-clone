import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all messages for a specific chat
router.get('/:chatId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name username avatar email")
      .populate("chat")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "name" }
      });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Send a message
router.post('/', protect, async (req, res) => {
  const { content, chatId, replyTo } = req.body;

  if (!content || !content.trim() || !chatId) {
    return res.status(400).json({ message: "Message content and Chat ID are required" });
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    replyTo: replyTo || null,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name avatar");
    message = await message.populate("chat");
    message = await message.populate({
      path: "replyTo",
      populate: { path: "sender", select: "name" }
    });
    message = await User.populate(message, {
      path: "chat.users",
      select: "name avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a message
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    
    // Allow deleting any message for this simple clone (Delete for Me/Everyone)
    // In a production app, you'd distinguish between 'Delete for Me' and 'Delete for Everyone'
    // but here we allow the action as requested.

    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Clear all messages in a chat
router.delete('/clear/:chatId', protect, async (req, res) => {
  try {
    await Message.deleteMany({ chat: req.params.chatId });
    // Update latest message to null
    await Chat.findByIdAndUpdate(req.params.chatId, { latestMessage: null });
    res.json({ message: "Chat cleared" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
