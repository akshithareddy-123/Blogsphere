import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socket/socketHandler.js';

// @desc    Get comments for a blog (nested structure)
// @route   GET /api/comments/blog/:blogId
export const getBlogComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId })
      .sort({ createdAt: 1 })
      .populate('user', 'name username avatar role');

    // Build hierarchical tree
    const commentMap = {};
    const nestedComments = [];

    comments.forEach((c) => {
      const commentObj = c.toObject();
      commentObj.replies = [];
      commentMap[commentObj._id.toString()] = commentObj;
    });

    comments.forEach((c) => {
      const commentObj = commentMap[c._id.toString()];
      if (c.parentComment) {
        const parent = commentMap[c.parentComment.toString()];
        if (parent) {
          parent.replies.push(commentObj);
        } else {
          nestedComments.push(commentObj);
        }
      } else {
        nestedComments.push(commentObj);
      }
    });

    res.json({
      success: true,
      count: comments.length,
      comments: nestedComments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment or reply
// @route   POST /api/comments
export const addComment = async (req, res, next) => {
  try {
    const { blogId, content, parentCommentId } = req.body;

    if (!blogId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Blog ID and comment content are required' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const comment = await Comment.create({
      blog: blogId,
      user: req.user._id,
      content: content.trim(),
      parentComment: parentCommentId || null,
    });

    // Increment blog commentsCount
    blog.commentsCount += 1;
    await blog.save();

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name username avatar role');

    // Emit live real-time comment via Socket.io
    try {
      const io = getIO();
      if (io) {
        io.to(`blog_${blogId}`).emit('new_comment', {
          comment: populatedComment,
          parentCommentId: parentCommentId || null,
        });
      }
    } catch (sockErr) {
      console.warn('Socket broadcast skipped:', sockErr.message);
    }

    // Send notifications
    if (parentCommentId) {
      // Notify parent comment author
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment && parentComment.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: parentComment.user,
          sender: req.user._id,
          type: 'comment',
          message: `${req.user.name} replied to your comment on "${blog.title}"`,
          blog: blog._id,
        });
      }
    } else if (blog.author.toString() !== req.user._id.toString()) {
      // Notify blog author
      await Notification.create({
        recipient: blog.author,
        sender: req.user._id,
        type: 'comment',
        message: `${req.user.name} commented on your blog "${blog.title}"`,
        blog: blog._id,
      });
    }

    res.status(201).json({
      success: true,
      comment: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
export const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this comment' });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    await comment.save();

    const updated = await Comment.findById(comment._id).populate('user', 'name username avatar role');

    try {
      const io = getIO();
      if (io) {
        io.to(`blog_${comment.blog}`).emit('update_comment', updated);
      }
    } catch (e) {}

    res.json({ success: true, comment: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    const blogId = comment.blog;
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    await Blog.findByIdAndUpdate(blogId, { $inc: { commentsCount: -1 } });

    try {
      const io = getIO();
      if (io) {
        io.to(`blog_${blogId}`).emit('delete_comment', { commentId: req.params.id });
      }
    } catch (e) {}

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like comment
// @route   POST /api/comments/:id/like
export const toggleLikeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const userId = req.user._id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      isLiked: !isLiked,
      likesCount: comment.likes.length,
    });
  } catch (error) {
    next(error);
  }
};
