// Intelligent AI Content Assistant Engine

// @desc    Generate AI blog summary
// @route   POST /api/ai/summarize
export const generateSummary = async (req, res, next) => {
  try {
    const { content, title } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required to generate a summary' });
    }

    // Strip HTML/Markdown tags
    const cleanText = content.replace(/<[^>]*>/g, '').replace(/[#*`_~\[\]]/g, '').trim();
    const sentences = cleanText
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    let summary = '';
    if (sentences.length <= 3) {
      summary = sentences.join(' ');
    } else {
      // Pick key impactful sentences (first sentence, a middle thematic sentence, and a concluding takeaway)
      const first = sentences[0];
      const middle = sentences[Math.floor(sentences.length / 2)];
      const last = sentences[sentences.length - 1];
      summary = `${first} ${middle} In conclusion, ${last.toLowerCase().startsWith('in conclusion') ? last.slice(13) : last}`;
    }

    if (summary.length > 320) {
      summary = summary.substring(0, 317) + '...';
    }

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suggest AI tags based on content and title
// @route   POST /api/ai/suggest-tags
export const suggestTags = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    const combined = `${title || ''} ${category || ''} ${content || ''}`.toLowerCase();

    const techVocabulary = [
      'React', 'JavaScript', 'Node.js', 'MongoDB', 'Express', 'TailwindCSS',
      'WebDev', 'TypeScript', 'Next.js', 'FullStack', 'Frontend', 'Backend',
      'Architecture', 'Performance', 'Security', 'DevOps', 'Cloud', 'API',
      'Design', 'UI/UX', 'Productivity', 'Career', 'AI', 'MachineLearning',
      'Python', 'CleanCode', 'Database', 'Docker', 'Microservices'
    ];

    const matchedTags = new Set();

    techVocabulary.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
      if (regex.test(combined)) {
        matchedTags.add(keyword);
      }
    });

    if (category) {
      matchedTags.add(category);
    }

    // Default fallbacks if content is short
    if (matchedTags.size < 3) {
      ['WebDev', 'TechTrends', 'Programming'].forEach((t) => matchedTags.add(t));
    }

    const tags = Array.from(matchedTags).slice(0, 6);

    res.json({
      success: true,
      tags,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suggest AI blog titles
// @route   POST /api/ai/suggest-titles
export const suggestTitles = async (req, res, next) => {
  try {
    const { topic, category } = req.body;
    const baseTopic = (topic || category || 'Modern Web Development').trim();

    const suggestions = [
      `The Complete Guide to ${baseTopic} in 2025`,
      `Why Every Developer Needs to Master ${baseTopic}`,
      `10 Game-Changing Lessons Learned from ${baseTopic}`,
      `Demystifying ${baseTopic}: From Zero to Production`,
      `How ${baseTopic} is Transforming the Tech Landscape`,
    ];

    res.json({
      success: true,
      titles: suggestions,
    });
  } catch (error) {
    next(error);
  }
};
