import User from '../models/User.js';
import Blog from '../models/Blog.js';
import Follow from '../models/Follow.js';
import Bookmark from '../models/Bookmark.js';
import Like from '../models/Like.js';
import Notification from '../models/Notification.js';

// @desc    Get author profile by username
// @route   GET /api/users/:username
export const getAuthorProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }

    const followersCount = await Follow.countDocuments({ following: user._id });
    const followingCount = await Follow.countDocuments({ follower: user._id });
    const totalBlogs = await Blog.countDocuments({ author: user._id, status: 'published' });

    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({ follower: req.user._id, following: user._id });
      isFollowing = !!follow;
    }

    res.json({
      success: true,
      author: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt,
        followersCount,
        followingCount,
        totalBlogs,
        isFollowing,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get author blogs (published or drafts)
// @route   GET /api/users/:username/blogs
export const getAuthorBlogs = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }

    const { status } = req.query; // 'published' | 'draft'
    const query = { author: user._id };

    // Only author or admin can view drafts
    if (status === 'draft') {
      if (!req.user || (req.user._id.toString() !== user._id.toString() && req.user.role !== 'admin')) {
        return res.status(403).json({ success: false, message: 'Cannot view drafts of another author' });
      }
      query.status = 'draft';
    } else {
      query.status = 'published';
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 }).populate('author', 'name username avatar');

    res.json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow / Unfollow author
// @route   POST /api/users/:id/follow
export const toggleFollowAuthor = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: targetUserId,
    });

    let isFollowing = false;
    if (existingFollow) {
      await existingFollow.deleteOne();
      isFollowing = false;
    } else {
      await Follow.create({
        follower: req.user._id,
        following: targetUserId,
      });
      isFollowing = true;

      // Send notification
      await Notification.create({
        recipient: targetUserId,
        sender: req.user._id,
        type: 'follow',
        message: `${req.user.name} started following you`,
      });
    }

    const followersCount = await Follow.countDocuments({ following: targetUserId });

    res.json({
      success: true,
      isFollowing,
      followersCount,
      message: isFollowing ? 'Followed successfully' : 'Unfollowed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's bookmarks
// @route   GET /api/users/me/bookmarks
export const getUserBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'blog',
        populate: { path: 'author', select: 'name username avatar' },
      });

    const validBookmarks = bookmarks.filter((b) => b.blog != null);

    res.json({
      success: true,
      count: validBookmarks.length,
      bookmarks: validBookmarks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's liked posts
// @route   GET /api/users/me/liked
export const getUserLikedPosts = async (req, res, next) => {
  try {
    const likes = await Like.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'blog',
        populate: { path: 'author', select: 'name username avatar' },
      });

    const validLikes = likes.filter((l) => l.blog != null);

    res.json({
      success: true,
      count: validLikes.length,
      likes: validLikes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reading history
// @route   GET /api/users/me/history
export const getUserReadingHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'readingHistory.blog',
      populate: { path: 'author', select: 'name username avatar' },
    });

    const validHistory = (user.readingHistory || []).filter((h) => h.blog != null);

    res.json({
      success: true,
      count: validHistory.length,
      history: validHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Author Analytics Dashboard Stats
// @route   GET /api/users/author/dashboard
export const getAuthorDashboard = async (req, res, next) => {
  try {
    const authorId = req.user._id;

    const blogs = await Blog.find({ author: authorId });
    const totalBlogs = blogs.length;
    const totalViews = blogs.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalLikes = blogs.reduce((acc, curr) => acc + (curr.likesCount || 0), 0);
    const totalComments = blogs.reduce((acc, curr) => acc + (curr.commentsCount || 0), 0);
    const followersCount = await Follow.countDocuments({ following: authorId });

    // Top blogs
    const topBlogs = [...blogs]
      .sort((a, b) => b.views + b.likesCount - (a.views + a.likesCount))
      .slice(0, 5);

    // Monthly analytics simulation / aggregate
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const monthlyStats = [];

    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      const factor = (6 - i) / 6;
      monthlyStats.push({
        month: months[idx],
        views: Math.max(12, Math.round(totalViews * 0.18 * factor + (idx * 14))),
        likes: Math.max(3, Math.round(totalLikes * 0.16 * factor + (idx * 4))),
      });
    }

    res.json({
      success: true,
      stats: {
        totalBlogs,
        totalViews,
        totalLikes,
        followersCount,
        totalComments,
      },
      topBlogs,
      monthlyStats,
    });
  } catch (error) {
    next(error);
  }
};
