import React, { useState } from 'react';
import { Reply, Heart, Edit2, Trash2, Check, X, CornerDownRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { timeAgo } from '../../utils/formatDate';

export default function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  currentUserId,
  isAdmin,
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isAuthor = currentUserId && comment.user?._id === currentUserId;
  const canModify = isAuthor || isAdmin;
  const isLiked = currentUserId && comment.likes?.includes(currentUserId);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(comment._id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editContent.trim()) {
      onEdit(comment._id, editContent.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-3 group/comment">
      <div className="flex items-start gap-3 p-4 rounded-xl glass-card border border-slate-800/80 hover:border-slate-700/80 transition">
        {/* Avatar */}
        <img
          src={comment.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
          alt={comment.user?.name}
          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0 mt-0.5"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-white truncate">{comment.user?.name}</span>
              <span className="text-[10px] text-slate-400">@{comment.user?.username}</span>
              {comment.user?.role === 'author' && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-brand-950 text-brand-400 border border-brand-800/40">
                  Author
                </span>
              )}
              {comment.user?.role === 'admin' && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-950 text-amber-400 border border-amber-800/40">
                  Admin
                </span>
              )}
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[10px] text-slate-500">{timeAgo(comment.createdAt)}</span>
              {comment.isEdited && <span className="text-[10px] text-slate-500 italic">(edited)</span>}
            </div>

            {/* Actions for comment owner / admin */}
            {canModify && !isEditing && (
              <div className="flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                {isAuthor && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-slate-400 hover:text-white rounded transition"
                    title="Edit comment"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(comment._id)}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                  title="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Content or Edit Field */}
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words">{comment.content}</p>
          )}

          {/* Footer toolbar: Like and Reply */}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-slate-800/50 text-xs text-slate-400">
              <button
                onClick={() => onLike(comment._id)}
                className={`inline-flex items-center gap-1 hover:text-rose-400 transition ${
                  isLiked ? 'text-rose-400 font-semibold' : ''
                }`}
              >
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-400' : ''}`} />
                <span>{comment.likes?.length || 0}</span>
              </button>

              <button
                onClick={() => setIsReplying(!isReplying)}
                className="inline-flex items-center gap-1 hover:text-white transition"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            </div>
          )}

          {/* Inline Reply Input Box */}
          {isReplying && (
            <form onSubmit={handleReplySubmit} className="mt-3 pl-2 border-l-2 border-brand-500/40 space-y-2 animate-in fade-in">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Replying to @${comment.user?.username}...`}
                className="w-full p-2.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-brand-500"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-sm"
                >
                  Reply
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Recursive Nested Replies Tree (Comment -> Reply -> Reply) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 sm:pl-8 border-l border-slate-800/80 space-y-3 ml-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
