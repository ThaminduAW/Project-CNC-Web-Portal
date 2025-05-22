import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all messages for the current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'fullName role')
    .populate('receiver', 'fullName role')
    .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get unread message count
router.get("/unread", authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false
    });
    res.json({ count });
  } catch (error) {
    console.error("Error counting unread messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Send a new message
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("Attempting to send message. User:", req.user);
    const { receiverId, content } = req.body;

    if (!content || !content.trim()) {
      console.log("❌ Empty message content");
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    if (!receiverId) {
      console.log("❌ No receiver ID provided");
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      console.log("❌ Receiver not found:", receiverId);
      return res.status(404).json({ message: "Receiver not found" });
    }

    // console.log("✅ Receiver found:", receiver.fullName);

    // Create new message with explicit sender ID
    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content: content.trim(),
      read: false,
      type: 'text'
    });

    await message.save();
    // console.log("✅ Message saved to database");

    // Populate sender and receiver details
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'fullName role')
      .populate('receiver', 'fullName role');
    
    // console.log("✅ Message details populated:", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("❌ Error sending message:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid receiver ID format" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid message data" });
    }
    res.status(500).json({ message: "Failed to send message. Please try again." });
  }
});

// Mark messages as read
router.patch("/read/:senderId", authMiddleware, async (req, res) => {
  try {
    // console.log("Marking messages as read from sender:", req.params.senderId);
    const result = await Message.updateMany(
      {
        sender: req.params.senderId,
        receiver: req.user._id,
        read: false
      },
      { read: true }
    );
    // console.log("Updated messages:", result.modifiedCount);
    res.json({ message: "Messages marked as read" });
  } catch (error) {
    // console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get conversation with a specific user
router.get("/conversation/:userId", authMiddleware, async (req, res) => {
  try {
    // console.log("🔹 Fetching conversation with user:", req.params.userId);
    // console.log("Current user:", req.user);

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
    .populate('sender', 'fullName role')
    .populate('receiver', 'fullName role')
    .sort({ createdAt: 1 });

    // console.log(`✅ Found ${messages.length} messages in conversation`);

    // Mark messages as read when conversation is opened
    await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: req.user.id,
        read: false
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching conversation:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    res.status(500).json({ message: "Failed to load conversation. Please try again." });
  }
});

export default router; 