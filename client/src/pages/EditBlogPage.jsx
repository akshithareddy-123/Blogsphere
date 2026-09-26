import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Sparkles,
  Eye,
  Edit3,
  Image as ImageIcon,
  Save,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import RichEditor from '../components/blog/RichEditor';
import AIAssistantModal from '../components/ai/AIAssistantModal';
import api from '../services/api';

const CATEGORIES = [
  'Technology',
  'Web Development',
  'AI & Machine Learning',
  'Cloud & DevOps',
  'UI/UX Design',
  'Career & Growth',
  'Cybersecurity',
  'Mobile App Dev',
];

export default function EditBlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [blogId, setBlogId] = useState('');
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('published');

  const [viewMode, setViewMode] = useState('edit');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch blog data
  useEffect(() => {
    if (id) {
      api
        .get(`/blogs/${id}`)
        .then(({ data }) => {
          const b = data.blog;
          setBlogId(b._id);
          setTitle(b.title);
          setCoverImage(b.coverImage || '');
          setCategory(b.category);
          setTags((b.tags || []).join(', '));
          setShortDescription(b.shortDescription || '');
          setContent(b.content);
          setStatus(b.status);
          setLoading(false);
        })
        .catch((err) => {
          setErrorMessage('Blog not found or unauthorized');
          setLoading(false);
        });
    }
  }, [id]);

  const handleUpdate = async (newStatus) => {
    if (!title.trim() || !content.trim()) {
      setErrorMessage('Please provide both title and content.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const { data } = await api.put(`/blogs/${blogId}`, {
        title,
        coverImage,
        category,
        tags: tagArray,
        shortDescription,
        content,
        status: newStatus || status,
      });

      if (data.blog) {
        navigate(`/blog/${data.blog.slug || data.blog._id}`);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this story? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/blogs/${blogId}`);
      navigate('/feed');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete blog');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Edit Story</h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'edit' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* AI trigger */}
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-brand-600 text-white shadow-md shadow-purple-600/20 hover:scale-105 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Assistant</span>
          </button>

          {/* Delete Blog */}
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="p-2 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 transition"
            title="Delete blog permanently"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>

          {/* Update Blog */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleUpdate()}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Update Blog</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {viewMode === 'edit' ? (
        <div className="space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article Title..."
              className="w-full text-2xl sm:text-4xl font-black bg-transparent text-white placeholder-slate-600 focus:outline-none tracking-tight leading-tight"
            />
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="React, TypeScript"
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cover Image URL</label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Short Excerpt</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief summary..."
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Rich Editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Article Content</label>
            <RichEditor
              value={content}
              onChange={setContent}
              onOpenAI={() => setAiModalOpen(true)}
            />
          </div>
        </div>
      ) : (
        /* Preview */
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6">
          <span className="text-brand-400 text-xs font-bold uppercase">{category}</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">{title}</h1>
          {coverImage && (
            <div className="rounded-2xl overflow-hidden aspect-video max-h-[380px]">
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="prose-custom pt-4 whitespace-pre-wrap">{content}</div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        currentTitle={title}
        currentContent={content}
        currentCategory={category}
        onApplyTitle={(t) => setTitle(t)}
        onApplyTags={(tagsList) => setTags(tagsList.join(', '))}
        onApplySummary={(s) => setShortDescription(s)}
      />
    </div>
  );
}
