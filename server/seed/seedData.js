import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import Category from '../models/Category.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';
import Report from '../models/Report.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Connecting to database...');
      await connectDB();
    }

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Blog.deleteMany({});
    await Comment.deleteMany({});
    await Category.deleteMany({});
    await Like.deleteMany({});
    await Bookmark.deleteMany({});
    await Follow.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});

    console.log('[Seed] Creating demo users...');
    const admin = await User.create({
      name: 'Alex Vance (Admin)',
      username: 'alexvance',
      email: 'admin@blogsphere.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: 'Platform Administrator & Chief Editor at BlogSphere. Ensuring community safety and top quality content.',
    });

    const elena = await User.create({
      name: 'Elena Rostova',
      username: 'elenarostova',
      email: 'author@blogsphere.com',
      password: 'author123',
      role: 'author',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bio: 'Staff Cloud Architect & Tech Evangelist. Writing about distributed systems, React, and scalable AI infrastructure.',
    });

    const marcus = await User.create({
      name: 'Marcus Chen',
      username: 'marcuschen',
      email: 'marcus@blogsphere.com',
      password: 'author123',
      role: 'author',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Frontend Lead at HyperScale. UI/UX design fanatic, Tailwind CSS advocate, and open-source creator.',
    });

    const reader = await User.create({
      name: 'Sophia Miller',
      username: 'sophiamiller',
      email: 'reader@blogsphere.com',
      password: 'reader123',
      role: 'reader',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      bio: 'Software engineering student & avid tech reader. Learning full-stack development and DevOps.',
    });

    console.log('[Seed] Creating categories...');
    const categoriesData = [
      { name: 'Technology', slug: 'technology', description: 'Emerging tech innovations, software paradigms, and industry insights.', color: '#3b82f6', icon: 'Cpu' },
      { name: 'Web Development', slug: 'web-development', description: 'Frontend, backend, React, Next.js, and browser engineering.', color: '#10b981', icon: 'Code' },
      { name: 'AI & Machine Learning', slug: 'ai-machine-learning', description: 'LLMs, generative models, transformers, and practical AI applications.', color: '#8b5cf6', icon: 'Sparkles' },
      { name: 'Cloud & DevOps', slug: 'cloud-devops', description: 'Kubernetes, AWS, Docker, serverless architectures, and CI/CD pipelines.', color: '#f59e0b', icon: 'Cloud' },
      { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'Design systems, accessibility, micro-interactions, and visual design.', color: '#ec4899', icon: 'Palette' },
      { name: 'Career & Growth', slug: 'career-growth', description: 'Engineering leadership, interview prep, and high-impact habits.', color: '#06b6d4', icon: 'TrendingUp' },
    ];
    const categories = await Category.insertMany(categoriesData);

    console.log('[Seed] Creating blogs...');
    const blogsData = [
      {
        title: 'Building Enterprise MERN Stack Applications in 2025: Patterns and Anti-Patterns',
        slug: 'building-enterprise-mern-stack-applications-2025',
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        author: elena._id,
        category: 'Web Development',
        tags: ['MERN', 'React', 'Node.js', 'Architecture', 'MongoDB'],
        status: 'published',
        isFeatured: true,
        views: 8420,
        likesCount: 142,
        commentsCount: 3,
        shortDescription: 'Discover battle-tested architectural guidelines for scaling Express backends, structuring clean React state, and optimizing MongoDB schemas.',
        content: `## The Modern State of Full-Stack JavaScript

The JavaScript ecosystem in 2025 has matured tremendously. The MERN stack (MongoDB, Express, React, Node.js) remains one of the most versatile combinations for rapid product shipping. However, moving from hobby projects to scalable enterprise applications requires deliberate architectural discipline.

### 1. Unified Layered Architecture

A common pitfall in Express.js is bloating controller files with raw database queries, schema validation, and third-party API orchestration. Instead, enforce a clean three-layer boundary:

\`\`\`javascript
// Controller -> Handles HTTP Transport & DTOs
export const getBlog = async (req, res, next) => {
  const blog = await blogService.getBlogBySlug(req.params.slug, req.user);
  res.json({ success: true, blog });
};
\`\`\`

### 2. Real-Time Interactions with Socket.io

Adding bidirectional WebSocket connections turns static reading into collaborative community engagement. By grouping sockets into discrete rooms (such as \`blog_<id>\`), notifications and live nested comments can be delivered instantly without polling server endpoints.

> "True real-time communication bridges the gap between passive readers and active contributors."

### 3. Database Indexing Strategy

Never deploy a production MongoDB collection without compound indexes on your most frequent query pairs:

\`\`\`javascript
// Compound index for fast feeds filtered by category and sorted by creation
blogSchema.index({ category: 1, createdAt: -1 });
\`\`\`

Adopt these practices early, and your application will effortlessly scale from dozens of users to hundreds of thousands!`,
      },
      {
        title: 'Architecting Real-Time Microservices with Node.js and Socket.io',
        slug: 'architecting-real-time-microservices-node-socketio',
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        author: elena._id,
        category: 'Cloud & DevOps',
        tags: ['Socket.io', 'Node.js', 'Microservices', 'RealTime'],
        status: 'published',
        isFeatured: true,
        views: 6150,
        likesCount: 98,
        commentsCount: 2,
        shortDescription: 'A deep dive into horizontally scaling WebSocket servers with Redis adapters, heartbeat mechanisms, and cluster setups.',
        content: `## Scalable WebSocket Architecture

When thousands of users simultaneously connect to your application, standard single-process Socket.io instances quickly run out of memory. 

### Overcoming Process Isolation with Redis Adapters

By attaching a Redis pub/sub adapter to Socket.io, multiple Node.js worker instances can broadcast messages across completely separate physical hosts.

\`\`\`javascript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));
\`\`\`

### Key Takeaways

1. **Heartbeat Tuning**: Set realistic pingInterval and pingTimeout values to gracefully handle flaky mobile network connections.
2. **Channel Namespacing**: Use explicit room prefixes like \`user_\` and \`blog_\` to prevent accidental data leaks.`,
      },
      {
        title: 'Crafting Divine Interfaces: Modern UI/UX with Tailwind CSS and Framer Motion',
        slug: 'crafting-divine-interfaces-tailwind-framer-motion',
        coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        author: marcus._id,
        category: 'UI/UX Design',
        tags: ['TailwindCSS', 'UI/UX', 'DesignSystems', 'Frontend'],
        status: 'published',
        isFeatured: true,
        views: 7890,
        likesCount: 165,
        commentsCount: 2,
        shortDescription: 'How subtle micro-interactions, curated color palettes, and glassmorphic depth transform average websites into award-winning digital experiences.',
        content: `## Beyond Generic Styling

First impressions in web applications are formed in less than 50 milliseconds. A sterile, utilitarian interface communicates that the software is disposable, while an interface crafted with visual depth, tactile feedback, and purposeful typography evokes trust.

### 1. The Power of Glassmorphism and Layered Shadows

Modern dark interfaces excel when layering subtle translucent backgrounds over vibrant ambient color bursts:

\`\`\`css
.glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
\`\`\`

### 2. Fluid Typography Scales

Rather than hardcoded font sizes, adopt fluid clamp calculations:
- Title sizes scale smoothly between mobile viewports and 4K displays.
- Visual hierarchy remains crisp without jarring breakpoint jumps.

Keep pushing the boundaries of what frontends can feel like!`,
      },
      {
        title: 'Demystifying Generative AI: From Transformers to Production Agents',
        slug: 'demystifying-generative-ai-transformers-production-agents',
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
        author: elena._id,
        category: 'AI & Machine Learning',
        tags: ['AI', 'GenerativeAI', 'LLM', 'MachineLearning', 'Python'],
        status: 'published',
        isFeatured: false,
        views: 9420,
        likesCount: 210,
        commentsCount: 1,
        shortDescription: 'A practical engineer’s guide to understanding attention mechanisms, prompt engineering, RAG pipelines, and autonomous agent loops.',
        content: `## The Agentic Era

Generative models have transitioned from amusing chat toys into core enterprise automation engines. 

### The Core Loop of an Agentic System

An autonomous agent isn't merely a prompt sent to an LLM; it is an iterative loop of:
1. **Observation**: Gathering user intent, system state, and environment logs.
2. **Reasoning & Planning**: Synthesizing goals into discrete tool actions.
3. **Execution**: Running commands, querying APIs, or editing files.
4. **Self-Reflection & Error Correction**: Evaluating outputs and adapting dynamically.

The future of software is not just writing code manually, but architecting the systems that pair seamlessly with intelligent assistants.`,
      },
      {
        title: 'Mastering Full-Stack Authentication: JWT, Refresh Tokens, and RBAC',
        slug: 'mastering-fullstack-authentication-jwt-rbac',
        coverImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=80',
        author: marcus._id,
        category: 'Technology',
        tags: ['Security', 'JWT', 'Node.js', 'Auth', 'BestPractices'],
        status: 'published',
        isFeatured: false,
        views: 5320,
        likesCount: 88,
        commentsCount: 1,
        shortDescription: 'A complete security blueprint for role-based access control, cryptographic signature validation, and protecting Express routes.',
        content: `## Securing Modern Web Applications

Authentication is one of those features where a single mistake can lead to catastrophic data leaks.

### Role-Based Access Control (RBAC) Done Right

Enforcing permissions at the router layer keeps endpoints clean:

\`\`\`javascript
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
\`\`\`

Always store passwords with high-cost salt rounds in Bcrypt and sign tokens with strong 256-bit secrets.`,
      },
      {
        title: 'How to Build a Standout Software Engineering Portfolio in 2025',
        slug: 'how-to-build-standout-software-engineering-portfolio',
        coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        author: admin._id,
        category: 'Career & Growth',
        tags: ['Career', 'Portfolio', 'Resume', 'Hiring'],
        status: 'published',
        isFeatured: false,
        views: 4210,
        likesCount: 112,
        commentsCount: 1,
        shortDescription: 'Hiring managers are tired of identical todo apps. Here is how to build end-to-end full-stack projects that guarantee interview callbacks.',
        content: `## What Truly Impresses Senior Interviewers

Most portfolios feature generic tutorial clones: a calculator, a weather widget, or a basic todo list. To stand out among thousands of applicants, your portfolio projects must demonstrate:

1. **Role-Based Access Control (RBAC)**: Distinct experiences for Readers, Authors, and Admins.
2. **Real-Time Capabilities**: Socket.io or WebSockets for live notifications and chat/comments.
3. **Data Polish & Seed Resilience**: Seed data that makes the platform look vibrant on first visit.
4. **Rich Content Editing & AI Features**: Going beyond basic textareas with rich text formatting and smart AI suggestions.

Projects like BlogSphere showcase full-stack mastery from database to CSS polish!`,
      },
    ];

    const createdBlogs = await Blog.insertMany(blogsData);

    console.log('[Seed] Creating nested comments...');
    // Comment on Blog 1
    const blog1 = createdBlogs[0];
    const comment1 = await Comment.create({
      blog: blog1._id,
      user: reader._id,
      content: 'This breakdown of layered architecture is spot on! We had so much controller bloat until we decoupled our service layer.',
    });

    const reply1 = await Comment.create({
      blog: blog1._id,
      user: elena._id,
      parentComment: comment1._id,
      content: 'Thanks Sophia! Decoupling early saves countless hours when testing and refactoring down the road.',
    });

    const reply2 = await Comment.create({
      blog: blog1._id,
      user: marcus._id,
      parentComment: reply1._id,
      content: 'Completely agree! Especially when writing unit tests for your business logic.',
    });

    // Comment on Blog 2
    const blog2 = createdBlogs[1];
    const comment2 = await Comment.create({
      blog: blog2._id,
      user: reader._id,
      content: 'Socket.io rooms are so intuitive once you get past the initial setup. Great article Elena!',
    });
    await Comment.create({
      blog: blog2._id,
      user: elena._id,
      parentComment: comment2._id,
      content: 'Glad you found it helpful Sophia! Watch out for reconnection storms on mobile devices.',
    });

    // Comment on Blog 3
    const blog3 = createdBlogs[2];
    await Comment.create({
      blog: blog3._id,
      user: reader._id,
      content: 'The glassmorphic visual aesthetic on BlogSphere is stunning Marcus!',
    });

    console.log('[Seed] Creating social interactions (likes, bookmarks, follows)...');
    await Like.create({ user: reader._id, blog: blog1._id });
    await Like.create({ user: marcus._id, blog: blog1._id });
    await Like.create({ user: admin._id, blog: blog1._id });
    await Like.create({ user: reader._id, blog: blog2._id });
    await Like.create({ user: reader._id, blog: blog3._id });

    await Bookmark.create({ user: reader._id, blog: blog1._id, readLater: true });
    await Bookmark.create({ user: reader._id, blog: blog3._id, readLater: true });
    await Bookmark.create({ user: admin._id, blog: blog2._id, readLater: false });

    await Follow.create({ follower: reader._id, following: elena._id });
    await Follow.create({ follower: reader._id, following: marcus._id });
    await Follow.create({ follower: marcus._id, following: elena._id });

    console.log('[Seed] Creating notifications...');
    await Notification.create({
      recipient: elena._id,
      sender: reader._id,
      type: 'like',
      message: 'Sophia Miller liked your blog "Building Enterprise MERN Stack Applications in 2025"',
      blog: blog1._id,
      isRead: false,
    });
    await Notification.create({
      recipient: elena._id,
      sender: reader._id,
      type: 'comment',
      message: 'Sophia Miller commented on "Building Enterprise MERN Stack Applications in 2025"',
      blog: blog1._id,
      isRead: false,
    });
    await Notification.create({
      recipient: elena._id,
      sender: reader._id,
      type: 'follow',
      message: 'Sophia Miller started following you',
      isRead: true,
    });
    await Notification.create({
      recipient: elena._id,
      sender: admin._id,
      type: 'milestone',
      message: 'Congratulations! Your blog reached over 8,000 views!',
      blog: blog1._id,
      isRead: false,
    });

    console.log('[Seed] Creating sample moderation reports...');
    await Report.create({
      blog: createdBlogs[4]._id,
      reporter: reader._id,
      reason: 'Other',
      details: 'Spelling typo spotted in code block section 2.',
      status: 'pending',
    });

    console.log('----------------------------------------------------');
    console.log('✅ BlogSphere Database Seed Completed Successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Accounts:');
    console.log('👑 Admin:  admin@blogsphere.com   / admin123');
    console.log('✍️  Author: author@blogsphere.com  / author123 (Elena Rostova)');
    console.log('✍️  Author: marcus@blogsphere.com  / author123 (Marcus Chen)');
    console.log('📖 Reader: reader@blogsphere.com  / reader123 (Sophia Miller)');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// If run directly from CLI
if (process.argv[1]?.includes('seedData.js')) {
  seedDatabase().then(() => {
    console.log('Seed execution finished.');
    process.exit(0);
  });
}

export default seedDatabase;
