const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { password } = req.body;
    let anonymousId = `User_${Math.floor(1000 + Math.random() * 9000)}`;
    let exists = await User.findOne({ anonymousId });
    while (exists) {
      anonymousId = `User_${Math.floor(1000 + Math.random() * 9000)}`;
      exists = await User.findOne({ anonymousId });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ anonymousId, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, anonymousId }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: newUser._id, anonymousId, coins: newUser.coins } });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { anonymousId, password } = req.body;
    const user = await User.findOne({ anonymousId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, anonymousId: user.anonymousId }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, user: { id: user._id, anonymousId: user.anonymousId, coins: user.coins } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
