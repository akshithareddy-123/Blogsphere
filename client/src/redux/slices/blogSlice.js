import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTrendingBlogs = createAsyncThunk('blogs/fetchTrending', async () => {
  const { data } = await api.get('/blogs/trending');
  return data.blogs;
});

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async ({ page = 1, category = '', search = '', tag = '', sort = 'latest', append = false }) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', 8);
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    if (sort) params.append('sort', sort);

    const { data } = await api.get(`/blogs?${params.toString()}`);
    return { ...data, append };
  }
);

export const fetchBlogDetails = createAsyncThunk('blogs/fetchDetails', async (identifier) => {
  const { data } = await api.get(`/blogs/${identifier}`);
  return data;
});

export const toggleLike = createAsyncThunk('blogs/toggleLike', async (blogId) => {
  const { data } = await api.post(`/blogs/${blogId}/like`);
  return { blogId, ...data };
});

export const toggleBookmark = createAsyncThunk('blogs/toggleBookmark', async (blogId) => {
  const { data } = await api.post(`/blogs/${blogId}/bookmark`);
  return { blogId, ...data };
});

const blogSlice = createSlice({
  name: 'blogs',
  initialState: {
    trending: [],
    trendingLoading: false,
    feed: [],
    totalBlogs: 0,
    totalPages: 1,
    currentPage: 1,
    feedLoading: false,
    activeBlog: null,
    isLiked: false,
    isBookmarked: false,
    detailsLoading: false,
    error: null,
  },
  reducers: {
    clearActiveBlog: (state) => {
      state.activeBlog = null;
    },
    resetFeed: (state) => {
      state.feed = [];
      state.currentPage = 1;
    },
    incrementCommentsCount: (state, action) => {
      if (state.activeBlog && state.activeBlog._id === action.payload) {
        state.activeBlog.commentsCount = (state.activeBlog.commentsCount || 0) + 1;
      }
    },
    decrementCommentsCount: (state, action) => {
      if (state.activeBlog && state.activeBlog._id === action.payload) {
        state.activeBlog.commentsCount = Math.max(0, (state.activeBlog.commentsCount || 0) - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Trending
      .addCase(fetchTrendingBlogs.pending, (state) => {
        state.trendingLoading = true;
      })
      .addCase(fetchTrendingBlogs.fulfilled, (state, action) => {
        state.trendingLoading = false;
        state.trending = action.payload;
      })
      // Feed
      .addCase(fetchBlogs.pending, (state) => {
        state.feedLoading = true;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.feedLoading = false;
        const { blogs, total, totalPages, currentPage, append } = action.payload;
        state.totalBlogs = total;
        state.totalPages = totalPages;
        state.currentPage = currentPage;
        if (append) {
          // deduplicate
          const existingIds = new Set(state.feed.map((b) => b._id));
          const newBlogs = blogs.filter((b) => !existingIds.has(b._id));
          state.feed = [...state.feed, ...newBlogs];
        } else {
          state.feed = blogs;
        }
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.feedLoading = false;
        state.error = action.error.message;
      })
      // Details
      .addCase(fetchBlogDetails.pending, (state) => {
        state.detailsLoading = true;
      })
      .addCase(fetchBlogDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.activeBlog = action.payload.blog;
        state.isLiked = action.payload.isLiked;
        state.isBookmarked = action.payload.isBookmarked;
      })
      .addCase(fetchBlogDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.error.message;
      })
      // Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { isLiked, likesCount, blogId } = action.payload;
        if (state.activeBlog && state.activeBlog._id === blogId) {
          state.isLiked = isLiked;
          state.activeBlog.likesCount = likesCount;
        }
        state.feed = state.feed.map((b) =>
          b._id === blogId ? { ...b, likesCount: isLiked ? b.likesCount + 1 : Math.max(0, b.likesCount - 1) } : b
        );
      })
      // Bookmark
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        const { isBookmarked, blogId } = action.payload;
        if (state.activeBlog && state.activeBlog._id === blogId) {
          state.isBookmarked = isBookmarked;
        }
      });
  },
});

export const { clearActiveBlog, resetFeed, incrementCommentsCount, decrementCommentsCount } = blogSlice.actions;
export default blogSlice.reducer;
