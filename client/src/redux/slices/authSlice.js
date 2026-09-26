import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

// Load stored auth
const storedToken = localStorage.getItem('blogsphere_token');
const storedUser = localStorage.getItem('blogsphere_user')
  ? JSON.parse(localStorage.getItem('blogsphere_user'))
  : null;

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('blogsphere_token', data.token);
    localStorage.setItem('blogsphere_user', JSON.stringify(data.user));
    const socket = getSocket();
    if (socket) socket.emit('join_user', data.user._id);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('blogsphere_token', data.token);
    localStorage.setItem('blogsphere_user', JSON.stringify(data.user));
    const socket = getSocket();
    if (socket) socket.emit('join_user', data.user._id);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const googleAuth = createAsyncThunk('auth/googleAuth', async (googleData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/google', googleData);
    localStorage.setItem('blogsphere_token', data.token);
    localStorage.setItem('blogsphere_user', JSON.stringify(data.user));
    const socket = getSocket();
    if (socket) socket.emit('join_user', data.user._id);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Google login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedToken,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('blogsphere_token');
      localStorage.removeItem('blogsphere_user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('blogsphere_user', JSON.stringify(state.user));
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Google Auth
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      });
  },
});

export const { logout, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
