import React, { useState } from 'react';
import { Sparkles, X, Copy, Check, Hash, Heading, FileText, Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function AIAssistantModal({
  isOpen,
  onClose,
  currentTitle,
  currentContent,
  currentCategory,
  onApplyTitle,
  onApplyTags,
  onApplySummary,
}) {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'tags' | 'titles'
  const [loading, setLoading] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [suggestedTitles, setSuggestedTitles] = useState([]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    if (!currentContent) {
      alert('Please write some blog content first so the AI can analyze it.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/ai/summarize', {
        title: currentTitle,
        content: currentContent,
      });
      setGeneratedSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTags = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/suggest-tags', {
        title: currentTitle,
        content: currentContent,
        category: currentCategory,
      });
      setSuggestedTags(data.tags);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTitles = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/suggest-titles', {
        topic: currentTitle || currentCategory,
        category: currentCategory,
      });
      setSuggestedTitles(data.titles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl glass-card rounded-3xl border border-purple-500/30 shadow-2xl p-6 relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">AI Writing Assistant</h3>
              <p className="text-xs text-slate-400">Intelligent summaries, SEO tag recommendations & title crafting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 my-5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'summary' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Blog Summary</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tags')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'tags' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Tag Suggestions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('titles')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'titles' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heading className="w-3.5 h-3.5" />
            <span>Catchy Titles</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[220px]">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Generate an engaging, concise preview summary for your blog to boost reader interest and search snippets.
              </p>

              {generatedSummary ? (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm leading-relaxed">
                  <p>{generatedSummary}</p>
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedSummary)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    {onApplySummary && (
                      <button
                        type="button"
                        onClick={() => {
                          onApplySummary(generatedSummary);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md flex items-center gap-1.5 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use as Description</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleGenerateSummary}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-purple-600 to-brand-600 text-white shadow-lg shadow-purple-600/25 hover:scale-105 transition disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                    <span>Generate AI Summary</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Extract high-relevance topics and keywords tailored to your article content.
              </p>

              {suggestedTags.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-brand-300 border border-slate-700 flex items-center gap-1"
                      >
                        <Hash className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  {onApplyTags && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyTags(suggestedTags);
                        onClose();
                      }}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md flex items-center justify-center gap-2 transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Apply These Tags</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSuggestTags}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-purple-600 to-brand-600 text-white shadow-lg shadow-purple-600/25 hover:scale-105 transition disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                    <span>Suggest Tags Now</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Titles Tab */}
          {activeTab === 'titles' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Generate catchy, clickable headlines engineered to hook readers and maximize click-through rate.
              </p>

              {suggestedTitles.length > 0 ? (
                <div className="space-y-2.5">
                  {suggestedTitles.map((title, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 flex items-center justify-between gap-3 group transition"
                    >
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-white flex-1">{title}</p>
                      {onApplyTitle && (
                        <button
                          type="button"
                          onClick={() => {
                            onApplyTitle(title);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white rounded-lg transition shrink-0 flex items-center gap-1"
                        >
                          <span>Use</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSuggestTitles}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-purple-600 to-brand-600 text-white shadow-lg shadow-purple-600/25 hover:scale-105 transition disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                    <span>Generate Viral Titles</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
