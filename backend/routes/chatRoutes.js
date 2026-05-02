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

export default router;
