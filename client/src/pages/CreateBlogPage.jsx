import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Sparkles,
  Eye,
  Edit3,
  Image as ImageIcon,
  Save,
  Send,
  Loader2,
  Tag,
  BookOpen,
  Check,
  AlertCircle,
  Upload,
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

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
];

export default function CreateBlogPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('React, Node.js, WebDev');
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState(`## Introduction

Start writing your technical journey here...

\`\`\`javascript
// Sample code snippet
const greet = (name) => {
  console.log(\`Welcome to BlogSphere, \${name}!\`);
};
\`\`\`

### Why this matters

Share the lessons you've learned and build authority in your field.
`);

  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle local file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.url) {
        setCoverImage(data.url);
      }
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (status) => {
    if (!title.trim() || !content.trim()) {
      setErrorMessage('Please provide both a title and content for your story.');
      return;
    }
    setSubmitting(true);
    setErrorMessage('');

    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const { data } = await api.post('/blogs', {
        title,
        coverImage,
        category,
        tags: tagArray,
        shortDescription,
        content,
        status, // 'draft' or 'published'
      });

      if (data.blog) {
        navigate(`/blog/${data.blog.slug || data.blog._id}`);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save blog post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Create New Story</span>
          </h1>
          <p className="text-xs text-slate-400">Share knowledge, tutorials, and engineering solutions with the world.</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mode Switcher */}
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

          {/* AI Trigger */}
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-brand-600 text-white shadow-md shadow-purple-600/20 hover:scale-105 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Assistant</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave('draft')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          {/* Publish */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave('published')}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Publish</span>
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
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article Title..."
              className="w-full text-2xl sm:text-4xl font-black bg-transparent text-white placeholder-slate-600 focus:outline-none tracking-tight leading-tight"
            />
          </div>

          {/* Metadata Row: Category & Tags */}
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="React, TypeScript, Architecture"
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Cover Image Selector */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-brand-400" />
                <span>Cover Image URL or Upload</span>
              </label>
              <label className="cursor-pointer text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-500"
            />

            {/* Quick Unsplash Cover Presets */}
            <div className="flex items-center gap-3 pt-1 overflow-x-auto no-scrollbar">
              <span className="text-[11px] text-slate-500 shrink-0">Presets:</span>
              {PRESET_COVERS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(preset)}
                  className={`w-14 h-9 rounded-lg overflow-hidden border transition shrink-0 ${
                    coverImage === preset ? 'border-brand-500 ring-2 ring-brand-500/40' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Short Description / Meta Excerpt (Optional - AI can generate this)
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief 1-2 sentence hook for feed cards and search results..."
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Rich Content Editor */}
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
        /* Live Preview Mode */
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <span>{category}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {title || 'Untitled Story'}
          </h1>

          {shortDescription && (
            <p className="text-base text-slate-400 leading-relaxed font-normal italic">
              {shortDescription}
            </p>
          )}

          {coverImage && (
            <div className="rounded-2xl overflow-hidden aspect-video max-h-[380px] bg-slate-900">
              <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose-custom pt-4 whitespace-pre-wrap">
            {content}
          </div>
        </div>
      )}

      {/* AI Writing Assistant Modal */}
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
