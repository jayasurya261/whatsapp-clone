import express from 'express';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import Chat from '../models/Chat.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Search users by username
router.get('/', protect, async (req, res) => {
  const keyword = req.query.search
    ? {
        username: { $regex: req.query.search, $options: "i" },
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

// Send invitation
router.post('/invite', protect, async (req, res) => {
  const { recipientId } = req.body;

  try {
    const existingInvite = await Invitation.findOne({
      sender: req.user._id,
      recipient: recipientId,
      status: 'pending'
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'Invitation already sent' });
    }

    const invitation = await Invitation.create({
      sender: req.user._id,
      recipient: recipientId,
    });

    const populatedInvitation = await Invitation.findById(invitation._id).populate('sender', 'name username avatar');

    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(recipientId).emit("invitation received", populatedInvitation);
    }

    res.status(201).json(invitation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending invitations
router.get('/invitations', protect, async (req, res) => {
  const invitations = await Invitation.find({ recipient: req.user._id, status: 'pending' })
    .populate('sender', 'name username avatar');
  res.json(invitations);
});

// Accept invitation
router.post('/accept', protect, async (req, res) => {
  const { invitationId } = req.body;

  try {
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    invitation.status = 'accepted';
    await invitation.save();

    // Create Chat
    let chat = await Chat.findOne({
      users: { $all: [invitation.sender, invitation.recipient] }
    });

    if (!chat) {
      chat = await Chat.create({
        users: [invitation.sender, invitation.recipient]
      });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
