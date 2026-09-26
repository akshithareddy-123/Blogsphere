import React, { useRef } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

export default function RichEditor({ value, onChange, onOpenAI }) {
  const textareaRef = useRef(null);

  const applyFormat = (prefix, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleInsertImage = () => {
    const url = prompt('Enter Image URL:');
    if (url) {
      applyFormat(`\n![Image description](${url})\n`, '');
    }
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden glass-card shadow-xl">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-2.5 bg-slate-900/90 border-b border-slate-800 gap-1">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => applyFormat('**', '**', 'bold text')}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Bold (**text**)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('*', '*', 'italic text')}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Italic (*text*)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => applyFormat('\n# ', '\n', 'Heading 1')}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('\n## ', '\n', 'Heading 2')}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('\n### ', '\n', 'Heading 3')}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => applyFormat('\n- ', '', 'List item')}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('\n1. ', '', 'Numbered item')}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => applyFormat('\n```javascript\n', '\n```\n', '// write code here')}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('\n> ', '\n', 'Quote text')}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertImage}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        {/* AI Assistant Button */}
        {onOpenAI && (
          <button
            type="button"
            onClick={onOpenAI}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-brand-600 text-white shadow-md shadow-brand-500/20 hover:scale-105 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>AI Assistant</span>
          </button>
        )}
      </div>

      {/* Editor Content Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          placeholder="Tell your story... Write markdown, paste code, and share your technical journey."
          className="w-full p-5 bg-slate-950/60 text-slate-100 placeholder-slate-500 focus:outline-none font-mono text-sm leading-relaxed resize-y"
        />
      </div>

      {/* Word count & Reading time status bar */}
      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Markdown supported</span>
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>~{readTime} min read</span>
        </div>
      </div>
    </div>
  );
}
