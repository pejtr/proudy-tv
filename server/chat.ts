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
  emailVerified?: boolean;
  partnerTier?: 'basic' | 'affiliate' | 'partner';
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

        // Save message to database and fetch user data
        const db = await getDb();
        let emailVerified = false;
        let partnerTier: 'basic' | 'affiliate' | 'partner' = 'basic';
        
        if (db) {
          await db.insert(chatMessages).values({
            streamId: data.streamId,
            userId: data.userId,
            username: data.username,
            message: data.message,
            isModerated: false
          });
          
          // Fetch user verification and partner tier
          const { users } = await import('../drizzle/schema');
          const [user] = await db.select({
            emailVerified: users.emailVerified,
            partnerTier: users.partnerTier
          }).from(users).where(eq(users.id, data.userId)).limit(1);
          
          if (user) {
            emailVerified = user.emailVerified || false;
            partnerTier = user.partnerTier as 'basic' | 'affiliate' | 'partner' || 'basic';
          }
        }

        // Broadcast message to all users in the stream room
        const chatMessage: ChatMessage = {
          id: `${Date.now()}_${data.userId}`,
          streamId: data.streamId,
          userId: data.userId,
          username: data.username,
          message: data.message,
          timestamp: new Date(),
          isModerated: false,
          emailVerified,
          partnerTier
        };

        io.to(`stream_${data.streamId}`).emit('new_message', chatMessage);
        console.log(`[Chat] Message sent in stream ${data.streamId}: ${data.username}: ${data.message}`);

      } catch (error) {
        console.error('[Chat] Error sending message:', error);
        socket.emit('error', { message: 'Nepodařilo se odeslat zprávu.' });
      }
    });

    // ProudyAlerts - Follow event
    socket.on('alert_follow', async (data: {
      streamId: number;
      followerName: string;
      followerAvatar?: string;
    }) => {
      io.to(`stream_${data.streamId}`).emit('proudy_alert', {
        type: 'follow',
        username: data.followerName,
        avatar: data.followerAvatar,
        timestamp: new Date()
      });
      console.log(`[ProudyAlerts] Follow alert in stream ${data.streamId}: ${data.followerName}`);
    });

    // ProudyAlerts - Subscription event
    socket.on('alert_subscription', async (data: {
      streamId: number;
      subscriberName: string;
      tier: number;
      months: number;
      message?: string;
    }) => {
      io.to(`stream_${data.streamId}`).emit('proudy_alert', {
        type: 'subscription',
        username: data.subscriberName,
        tier: data.tier,
        months: data.months,
        message: data.message,
        timestamp: new Date()
      });
      console.log(`[ProudyAlerts] Sub alert in stream ${data.streamId}: ${data.subscriberName} (Tier ${data.tier})`);
    });

    // ProudyAlerts - Donation event
    socket.on('alert_donation', async (data: {
      streamId: number;
      donorName: string;
      amount: number;
      message?: string;
      tierLevel?: number;
    }) => {
      io.to(`stream_${data.streamId}`).emit('proudy_alert', {
        type: 'donation',
        username: data.donorName,
        amount: data.amount,
        message: data.message,
        tierLevel: data.tierLevel,
        timestamp: new Date()
      });
      console.log(`[ProudyAlerts] Donation alert in stream ${data.streamId}: ${data.donorName} - ${data.amount} coins`);
    });

    // ProudyAlerts - Raid event
    socket.on('alert_raid', async (data: {
      streamId: number;
      raiderName: string;
      viewerCount: number;
    }) => {
      io.to(`stream_${data.streamId}`).emit('proudy_alert', {
        type: 'raid',
        username: data.raiderName,
        viewerCount: data.viewerCount,
        timestamp: new Date()
      });
      console.log(`[ProudyAlerts] Raid alert in stream ${data.streamId}: ${data.raiderName} with ${data.viewerCount} viewers`);
    });

    // Chat Moderation - Timeout user
    socket.on('moderate_timeout', async (data: {
      streamId: number;
      userId: number;
      username: string;
      duration: number; // seconds
      moderatorName: string;
    }) => {
      io.to(`stream_${data.streamId}`).emit('user_timeout', {
        userId: data.userId,
        username: data.username,
        duration: data.duration,
        moderatorName: data.moderatorName,
        timestamp: new Date()
      });
      console.log(`[Moderation] User ${data.username} timed out for ${data.duration}s in stream ${data.streamId}`);
    });

    // Chat Moderation - Ban user
    socket.on('moderate_ban', async (data: {
      streamId: number;
      userId: number;
      username: string;
      moderatorName: string;
      reason?: string;
    }) => {
      io.to(`stream_${data.streamId}`).emit('user_banned', {
        userId: data.userId,
        username: data.username,
        moderatorName: data.moderatorName,
        reason: data.reason,
        timestamp: new Date()
      });
      console.log(`[Moderation] User ${data.username} banned in stream ${data.streamId}`);
    });

    // Chat Moderation - Slow mode
    socket.on('moderate_slow_mode', async (data: {
      streamId: number;
      enabled: boolean;
      duration: number; // seconds between messages
      moderatorName: string;
    }) => {
      io.to(`stream_${data.streamId}`).emit('slow_mode_update', {
        enabled: data.enabled,
        duration: data.duration,
        moderatorName: data.moderatorName,
        timestamp: new Date()
      });
      console.log(`[Moderation] Slow mode ${data.enabled ? 'enabled' : 'disabled'} in stream ${data.streamId}`);
    });

    // Chat Moderation - Subscriber-only mode
    socket.on('moderate_sub_only', async (data: {
      streamId: number;
      enabled: boolean;
      moderatorName: string;
    }) => {
      io.to(`stream_${data.streamId}`).emit('sub_only_update', {
        enabled: data.enabled,
        moderatorName: data.moderatorName,
        timestamp: new Date()
      });
      console.log(`[Moderation] Sub-only mode ${data.enabled ? 'enabled' : 'disabled'} in stream ${data.streamId}`);
    });

    // Polls - Create poll
    socket.on('poll_create', async (data: {
      streamId: number;
      pollId: number;
      question: string;
      options: string[];
      duration: number;
    }) => {
      io.to(`stream_${data.streamId}`).emit('poll_created', {
        pollId: data.pollId,
        question: data.question,
        options: data.options,
        duration: data.duration,
        timestamp: new Date()
      });
      console.log(`[Polls] Poll created in stream ${data.streamId}: ${data.question}`);
    });

    // Polls - Vote
    socket.on('poll_vote', async (data: {
      streamId: number;
      pollId: number;
      optionIndex: number;
      userId: number;
    }) => {
      // Broadcast vote update to all viewers
      io.to(`stream_${data.streamId}`).emit('poll_vote_update', {
        pollId: data.pollId,
        optionIndex: data.optionIndex,
        timestamp: new Date()
      });
      console.log(`[Polls] Vote cast in stream ${data.streamId}, poll ${data.pollId}, option ${data.optionIndex}`);
    });

    // Polls - End poll
    socket.on('poll_end', async (data: {
      streamId: number;
      pollId: number;
      results: { option: string; votes: number }[];
    }) => {
      io.to(`stream_${data.streamId}`).emit('poll_ended', {
        pollId: data.pollId,
        results: data.results,
        timestamp: new Date()
      });
      console.log(`[Polls] Poll ${data.pollId} ended in stream ${data.streamId}`);
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
