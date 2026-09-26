import Blog from '../models/Blog.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import Notification from '../models/Notification.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import User from '../models/User.js';

// @desc    Get trending blogs
// @route   GET /api/blogs/trending
export const getTrendingBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .sort({ views: -1, likesCount: -1 })
      .limit(6)
      .populate('author', 'name username avatar bio');

    res.json({ success: true, count: blogs.length, blogs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all published blogs with filters & pagination
// @route   GET /api/blogs
export const getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const skip = (page - 1) * limit;

    const { category, search, tag, author, sort } = req.query;

    const query = { status: 'published' };

    if (category && category !== 'All') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    if (tag) {
      query.tags = { $in: [new RegExp(tag, 'i')] };
    }

    if (author) {
      const authorUser = await User.findOne({ username: author });
      if (authorUser) {
        query.author = authorUser._id;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sortQuery = { createdAt: -1 }; // default Latest
    if (sort === 'most_viewed') sortQuery = { views: -1 };
    if (sort === 'most_liked') sortQuery = { likesCount: -1 };
    if (sort === 'oldest') sortQuery = { createdAt: 1 };

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate('author', 'name username avatar bio');

    res.json({
      success: true,
      count: blogs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog by slug or ID
// @route   GET /api/blogs/:identifier
export const getBlog = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    let blog = await Blog.findOne({
      $or: [{ slug: identifier }, ...(identifier.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: identifier }] : [])],
    }).populate('author', 'name username avatar bio');

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Increment views atomically
    blog.views += 1;
    await blog.save();

    // Check if user liked or bookmarked if authenticated
    let isLiked = false;
    let isBookmarked = false;
    if (req.user) {
      const like = await Like.findOne({ user: req.user._id, blog: blog._id });
      if (like) isLiked = true;

      const bookmark = await Bookmark.findOne({ user: req.user._id, blog: blog._id });
      if (bookmark) isBookmarked = true;

      // Update user's reading history
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { readingHistory: { blog: blog._id } },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          readingHistory: {
            $each: [{ blog: blog._id, readAt: new Date() }],
            $position: 0,
            $slice: 50,
          },
        },
      });
    }

    res.json({
      success: true,
      blog,
      isLiked,
      isBookmarked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new blog
// @route   POST /api/blogs
export const createBlog = async (req, res, next) => {
  try {
    const { title, coverImage, content, category, tags, status, shortDescription } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const blog = await Blog.create({
      title,
      coverImage: coverImage || undefined,
      content,
      category: category || 'Technology',
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map((t) => t.trim()) : ['General'],
      status: status || 'published',
      shortDescription: shortDescription || undefined,
      author: req.user._id,
    });

    const populatedBlog = await Blog.findById(blog._id).populate('author', 'name username avatar bio');

    res.status(201).json({
      success: true,
      blog: populatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
export const updateBlog = async (req, res, next) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Check ownership or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this blog' });
    }

    const { title, coverImage, content, category, tags, status, shortDescription } = req.body;

    if (title) blog.title = title;
    if (coverImage) blog.coverImage = coverImage;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (tags) blog.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    if (status) blog.status = status;
    if (shortDescription !== undefined) blog.shortDescription = shortDescription;

    await blog.save();

    const updatedBlog = await Blog.findById(blog._id).populate('author', 'name username avatar bio');

    res.json({
      success: true,
      blog: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this blog' });
    }

    // Clean up associated resources
    await Comment.deleteMany({ blog: blog._id });
    await Like.deleteMany({ blog: blog._id });
    await Bookmark.deleteMany({ blog: blog._id });
    await Notification.deleteMany({ blog: blog._id });
    await Report.deleteMany({ blog: blog._id });
    await blog.deleteOne();

    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Like on blog
// @route   POST /api/blogs/:id/like
export const toggleLikeBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const existingLike = await Like.findOne({ user: req.user._id, blog: blog._id });

    let isLiked = false;
    if (existingLike) {
      await existingLike.deleteOne();
      blog.likesCount = Math.max(0, blog.likesCount - 1);
      isLiked = false;
    } else {
      await Like.create({ user: req.user._id, blog: blog._id });
      blog.likesCount += 1;
      isLiked = true;

      // Notify author if not self
      if (blog.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: blog.author,
          sender: req.user._id,
          type: 'like',
          message: `${req.user.name} liked your blog "${blog.title}"`,
          blog: blog._id,
        });
      }
    }

    await blog.save();

    res.json({
      success: true,
      isLiked,
      likesCount: blog.likesCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Bookmark on blog
// @route   POST /api/blogs/:id/bookmark
export const toggleBookmarkBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const existingBookmark = await Bookmark.findOne({ user: req.user._id, blog: blog._id });

    let isBookmarked = false;
    if (existingBookmark) {
      await existingBookmark.deleteOne();
      isBookmarked = false;
    } else {
      await Bookmark.create({ user: req.user._id, blog: blog._id });
      isBookmarked = true;
    }

    res.json({
      success: true,
      isBookmarked,
      message: isBookmarked ? 'Blog bookmarked' : 'Bookmark removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related blogs (same category or tags)
// @route   GET /api/blogs/:id/related
export const getRelatedBlogs = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const related = await Blog.find({
      _id: { $ne: blog._id },
      category: blog.category,
      status: 'published',
    })
      .sort({ views: -1 })
      .limit(3)
      .populate('author', 'name username avatar');

    res.json({ success: true, blogs: related });
  } catch (error) {
    next(error);
  }
};

// @desc    Report a blog
// @route   POST /api/blogs/:id/report
export const reportBlog = async (req, res, next) => {
  try {
    const { reason, details } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const report = await Report.create({
      blog: blog._id,
      reporter: req.user._id,
      reason: reason || 'Other',
      details: details || '',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you. The report has been submitted to moderators for review.',
      report,
    });
  } catch (error) {
    next(error);
  }
};
