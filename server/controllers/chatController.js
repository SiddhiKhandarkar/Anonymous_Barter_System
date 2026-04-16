const Chat = require('../models/Chat');

exports.getChat = async (req, res) => {
  try {
    const { transactionId } = req.params;
    let chat = await Chat.findOne({ transactionId }).populate('messages.senderId', 'anonymousId');
    if (!chat) {
      chat = await Chat.create({ transactionId, messages: [] });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { message } = req.body;

    let chat = await Chat.findOne({ transactionId });
    if (!chat) {
      chat = new Chat({ transactionId, messages: [] });
    }
    chat.messages.push({ senderId: req.user.id, message });
    await chat.save();
    
    // In real app, socket logic would happen on the frontend but the backend can broadcast or acknowledge
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
