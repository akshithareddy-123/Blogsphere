import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Github, Twitter, Linkedin, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-black text-xl tracking-tight text-white">
                Blog<span className="text-brand-400">Sphere</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              A modern full-stack blogging universe engineered for developers, creators, and curious minds. Built with MERN, Tailwind CSS & real-time WebSockets.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/feed" className="hover:text-white transition">Home Feed</Link></li>
              <li><Link to="/search" className="hover:text-white transition">Trending Topics</Link></li>
              <li><Link to="/search?category=Technology" className="hover:text-white transition">Technology</Link></li>
              <li><Link to="/search?category=AI+%26+Machine+Learning" className="hover:text-white transition">AI & Machine Learning</Link></li>
              <li><Link to="/search?category=Web+Development" className="hover:text-white transition">Web Development</Link></li>
            </ul>
          </div>

          {/* Creator Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Creators & Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/create" className="hover:text-white transition">Write a Story</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition">Creator Analytics</Link></li>
              <li><Link to="/bookmarks" className="hover:text-white transition">Saved Bookmarks</Link></li>
              <li><Link to="/admin" className="hover:text-white transition">Admin Moderation</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Weekly Digest</h4>
            <p className="text-xs leading-relaxed text-slate-400 mb-3">
              Get the top trending tech stories and architectural deep-dives delivered straight to your inbox every Sunday.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs py-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>You are subscribed! Welcome aboard.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BlogSphere MERN Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>using React, Node, Express, MongoDB & Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
