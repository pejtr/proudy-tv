import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { invokeLLM } from './_core/llm';
import { getDb } from './db';
import { chatMessages, streams } from '../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface ChatMessage {
  id: string;
  streamId: number;
  userId: number;
  username: string;
  message: string;
  timestamp: Date;
  isModerated: boolean;
}

export function setupChatServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    path: "/socket.io/"
  });

  io.on('connection', (socket) => {
    console.log(`[Chat] User connected: ${socket.id}`);

    // Join stream room
    socket.on('join_stream', async (streamId: number) => {
      socket.join(`stream_${streamId}`);
      console.log(`[Chat] User ${socket.id} joined stream ${streamId}`);

      // Send recent chat history
      try {
        const db = await getDb();
        if (db) {
          const recentMessages = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.streamId, streamId))
            .orderBy(desc(chatMessages.createdAt))
            .limit(50);

          socket.emit('chat_history', recentMessages.reverse());
        }
      } catch (error) {
        console.error('[Chat] Error loading history:', error);
      }
    });

    // Leave stream room
    socket.on('leave_stream', (streamId: number) => {
      socket.leave(`stream_${streamId}`);
      console.log(`[Chat] User ${socket.id} left stream ${streamId}`);
    });

    // Handle new chat message
    socket.on('send_message', async (data: {
      streamId: number;
      userId: number;
      username: string;
      message: string;
    }) => {
      try {
        // AI Moderation - check for toxic content
        const moderationResult = await moderateMessage(data.message);

        if (moderationResult.isToxic) {
          // Send moderation warning to sender only
          socket.emit('message_blocked', {
            reason: moderationResult.reason,
            message: 'Vaše zpráva byla zablokována AI moderátorem.'
          });
          console.log(`[Chat] Message blocked from ${data.username}: ${moderationResult.reason}`);
          return;
        }

        // Save message to database
        const db = await getDb();
        if (db) {
          await db.insert(chatMessages).values({
            streamId: data.streamId,
            userId: data.userId,
            username: data.username,
            message: data.message,
            isModerated: false
          });
        }

        // Broadcast message to all users in the stream room
        const chatMessage: ChatMessage = {
          id: `${Date.now()}_${data.userId}`,
          streamId: data.streamId,
          userId: data.userId,
          username: data.username,
          message: data.message,
          timestamp: new Date(),
          isModerated: false
        };

        io.to(`stream_${data.streamId}`).emit('new_message', chatMessage);
        console.log(`[Chat] Message sent in stream ${data.streamId}: ${data.username}: ${data.message}`);

      } catch (error) {
        console.error('[Chat] Error sending message:', error);
        socket.emit('error', { message: 'Nepodařilo se odeslat zprávu.' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Chat] User disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * AI Moderator - uses LLM to detect toxic content
 */
async function moderateMessage(message: string): Promise<{
  isToxic: boolean;
  reason?: string;
}> {
  try {
    // Use LLM to analyze message for toxic content
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are a chat moderator AI. Analyze messages for toxic content including:
- Hate speech, racism, sexism, homophobia
- Harassment, bullying, threats
- Spam, excessive caps, repetitive messages
- Sexual content, explicit language
- Personal attacks

Respond with JSON: { "isToxic": boolean, "reason": string }
Be strict but fair. Allow casual gaming banter and mild language.`
        },
        {
          role: 'user',
          content: `Analyze this message: "${message}"`
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'moderation_result',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              isToxic: {
                type: 'boolean',
                description: 'Whether the message contains toxic content'
              },
              reason: {
                type: 'string',
                description: 'Reason why the message is toxic (if applicable)'
              }
            },
            required: ['isToxic', 'reason'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === 'string' ? content : '{"isToxic":false,"reason":""}';
    const result = JSON.parse(contentStr);
    return result;

  } catch (error) {
    console.error('[AI Moderator] Error:', error);
    // If AI fails, allow message (fail-open for better UX)
    return { isToxic: false };
  }
}
