import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { getDb } from './db';
import { chatMessages } from '../drizzle/schema';

export function initializeSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io/',
  });

  io.on('connection', (socket) => {
    console.log('[Socket.io] Client connected:', socket.id);

    // Join stream room
    socket.on('join-stream', async (streamId: number) => {
      const roomName = `stream-${streamId}`;
      await socket.join(roomName);
      console.log(`[Socket.io] Client ${socket.id} joined ${roomName}`);
      
      // Notify others
      socket.to(roomName).emit('user-joined', {
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Leave stream room
    socket.on('leave-stream', async (streamId: number) => {
      const roomName = `stream-${streamId}`;
      await socket.leave(roomName);
      console.log(`[Socket.io] Client ${socket.id} left ${roomName}`);
      
      socket.to(roomName).emit('user-left', {
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Send chat message
    socket.on('send-message', async (data: {
      streamId: number;
      userId: number;
      userName: string;
      message: string;
      avatarUrl?: string;
    }) => {
      try {
        // Save to database
        const db = await getDb();
        if (!db) {
          socket.emit('error', { message: 'Database not available' });
          return;
        }
        
        const [result] = await db.insert(chatMessages).values({
          streamId: data.streamId,
          userId: data.userId,
          username: data.userName,
          message: data.message,
        });

        const roomName = `stream-${data.streamId}`;
        
        // Broadcast to all clients in the room
        io.to(roomName).emit('new-message', {
          id: result.insertId,
          streamId: data.streamId,
          userId: data.userId,
          userName: data.userName,
          avatarUrl: data.avatarUrl,
          message: data.message,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[Socket.io] Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('[Socket.io] Client disconnected:', socket.id);
    });
  });

  console.log('[Socket.io] WebSocket server initialized');
  return io;
}
