import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow connections from frontend dev server
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    // Join personal user room for targeted notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Join blog discussion room
    socket.on('join_blog', (blogId) => {
      if (blogId) {
        socket.join(`blog_${blogId}`);
      }
    });

    // Leave blog discussion room
    socket.on('leave_blog', (blogId) => {
      if (blogId) {
        socket.leave(`blog_${blogId}`);
      }
    });

    // Typing indicator
    socket.on('typing_comment', ({ blogId, user }) => {
      socket.to(`blog_${blogId}`).emit('user_typing', { user });
    });

    socket.on('stop_typing_comment', ({ blogId }) => {
      socket.to(`blog_${blogId}`).emit('user_stop_typing');
    });

    socket.on('disconnect', () => {
      // Client disconnected
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};
