import React, { useState } from 'react';
import { X, Copy, Check, Twitter, Linkedin, MessageCircle } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, blog }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !blog) return null;

  const shareUrl = `${window.location.origin}/blog/${blog.slug || blog._id}`;
  const shareTitle = encodeURIComponent(blog.title);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-slate-800 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="font-display font-bold text-lg text-white">Share this story</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-sky-950/20 text-slate-300 hover:text-sky-400 transition group"
            >
              <Twitter className="w-5 h-5 mb-1.5 text-sky-400" />
              <span className="text-xs font-medium">Twitter / X</span>
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/20 text-slate-300 hover:text-blue-400 transition group"
            >
              <Linkedin className="w-5 h-5 mb-1.5 text-blue-400" />
              <span className="text-xs font-medium">LinkedIn</span>
            </a>

            <a
              href={`https://api.whatsapp.com/send?text=${shareTitle}%20${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-slate-300 hover:text-emerald-400 transition group"
            >
              <MessageCircle className="w-5 h-5 mb-1.5 text-emerald-400" />
              <span className="text-xs font-medium">WhatsApp</span>
            </a>
          </div>

          <div className="pt-2">
            <label className="text-xs text-slate-400 block mb-1.5">Or copy article link</label>
            <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-2 py-1 text-xs bg-transparent text-slate-300 focus:outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg flex items-center gap-1.5 transition shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
