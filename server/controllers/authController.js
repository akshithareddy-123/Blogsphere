import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id, rememberMe = false) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'blogsphere_super_secret_jwt_key_2025', {
    expiresIn: rememberMe ? '30d' : '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, username, email, password, avatar, bio, role } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: userExists.email === email.toLowerCase() ? 'Email already registered' : 'Username already taken',
      });
    }

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      avatar: avatar || undefined,
      bio: bio || undefined,
      role: role && ['reader', 'author'].includes(role) ? role : 'reader',
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by administration.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      token: generateToken(user._id, rememberMe),
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth login simulation / endpoint
// @route   POST /api/auth/google
export const googleLogin = async (req, res, next) => {
  try {
    const { name, email, avatar, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google authentication requires email' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Auto-create user
      const baseUsername = (name || email.split('@')[0]).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const uniqueUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;

      user = await User.create({
        name: name || 'Google User',
        username: uniqueUsername,
        email: email.toLowerCase(),
        password: `oauth_${Math.random().toString(36).slice(-8)}_${Date.now()}`,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        role: 'reader',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by administration.' });
    }

    res.json({
      success: true,
      token: generateToken(user._id, true),
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password mock / reset simulation
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // In a production app, an email would be dispatched. For demo, we return a simulated success.
    res.json({
      success: true,
      message: 'Password reset link sent to your email address (simulation: check demo mailbox).',
    });
  } catch (error) {
    next(error);
  }
};
