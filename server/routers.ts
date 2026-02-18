import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

// Helper to check if user is streamer or admin
const streamerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'streamer' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only streamers can access this' });
  }
  return next({ ctx });
});

// Helper to check if user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  streams: router({
    // Get all live streams
    getLive: publicProcedure.query(async () => {
      return await db.getLiveStreams();
    }),

    // Get stream by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const stream = await db.getStreamById(input.id);
        if (!stream) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Stream not found' });
        }
        return stream;
      }),

    // Get streamer's streams
    getMyStreams: streamerProcedure.query(async ({ ctx }) => {
      return await db.getStreamerStreams(ctx.user.id);
    }),

    // Create new stream
    create: streamerProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const streamId = await db.createStream(ctx.user.id, input.title, input.description);
        return { streamId };
      }),

    // Start stream (go live)
    startStream: streamerProcedure
      .input(z.object({ streamId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const stream = await db.getStreamById(input.streamId);
        if (!stream || stream.streamerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await db.updateStreamStatus(input.streamId, true);

        // Notify owner about new stream
        await notifyOwner({
          title: 'New Stream Started',
          content: `${ctx.user.name} started streaming: ${stream.title}`,
        });

        await db.createNotification({
          type: 'stream_started',
          streamId: input.streamId,
          title: 'Stream Started',
          message: `${ctx.user.name} went live`,
        });

        return { success: true };
      }),

    // Stop stream
    stopStream: streamerProcedure
      .input(z.object({ streamId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const stream = await db.getStreamById(input.streamId);
        if (!stream || stream.streamerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await db.updateStreamStatus(input.streamId, false);
        return { success: true };
      }),

    // Update viewer count
    updateViewerCount: publicProcedure
      .input(z.object({
        streamId: z.number(),
        count: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateViewerCount(input.streamId, input.count);

        // Notify owner if stream exceeds 100 viewers
        if (input.count >= 100) {
          const stream = await db.getStreamById(input.streamId);
          if (stream && stream.peakViewerCount < 100) {
            await notifyOwner({
              title: 'High Viewer Count!',
              content: `Stream "${stream.title}" has ${input.count} viewers!`,
            });

            await db.createNotification({
              type: 'high_viewers',
              streamId: input.streamId,
              title: 'High Viewer Count',
              message: `Stream reached ${input.count} viewers`,
            });
          }
        }

        return { success: true };
      }),
  }),

  chat: router({
    // Get chat history
    getHistory: publicProcedure
      .input(z.object({
        streamId: z.number(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getChatHistory(input.streamId, input.limit);
      }),

    // Send chat message with AI moderation
    sendMessage: protectedProcedure
      .input(z.object({
        streamId: z.number(),
        message: z.string().min(1).max(500),
      }))
      .mutation(async ({ ctx, input }) => {
        // AI moderation check
        let isModerated = false;
        let moderationReason: string | null = null;

        try {
          const moderationResult = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: 'You are a chat moderator. Analyze the message and respond with JSON: {"toxic": boolean, "reason": string}. Detect toxic content, spam, harassment, hate speech, or inappropriate content.',
              },
              {
                role: 'user',
                content: input.message,
              },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'moderation_result',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    toxic: { type: 'boolean' },
                    reason: { type: 'string' },
                  },
                  required: ['toxic', 'reason'],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = moderationResult.choices[0]?.message?.content;
          const contentStr = typeof content === 'string' ? content : '{"toxic": false, "reason": ""}';
          const result = JSON.parse(contentStr);
          isModerated = result.toxic;
          moderationReason = result.toxic ? result.reason : null;
        } catch (error) {
          console.error('[Chat Moderation] Error:', error);
          // If moderation fails, allow message but log error
        }

        const messageId = await db.saveChatMessage({
          streamId: input.streamId,
          userId: ctx.user.id,
          username: ctx.user.name || 'Anonymous',
          message: input.message,
          isModerated,
          moderationReason,
        });

        return {
          messageId,
          isModerated,
          moderationReason,
        };
      }),
  }),

  settings: router({
    // Get stream settings
    get: streamerProcedure.query(async ({ ctx }) => {
      const settings = await db.getStreamSettings(ctx.user.id);
      return settings || null;
    }),

    // Update stream settings
    update: streamerProcedure
      .input(z.object({
        arFilterEnabled: z.boolean().optional(),
        arFilterType: z.string().optional(),
        voiceChangerEnabled: z.boolean().optional(),
        voiceChangerPreset: z.string().optional(),
        avatarEnabled: z.boolean().optional(),
        avatarModelUrl: z.string().optional(),
        avatarConfig: z.string().optional(),
        backgroundType: z.enum(['none', 'image', 'video', 'greenscreen']).optional(),
        backgroundUrl: z.string().optional(),
        pipLayout: z.enum(['rectangular', 'circular']).optional(),
        pipPosition: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']).optional(),
        pipSize: z.enum(['small', 'medium', 'large']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertStreamSettings({
          streamerId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  viewers: router({
    // Join stream as viewer
    join: publicProcedure
      .input(z.object({
        streamId: z.number(),
        sessionId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createViewerSession(
          input.streamId,
          ctx.user?.id || null,
          input.sessionId
        );

        const count = await db.getActiveViewerCount(input.streamId);
        await db.updateViewerCount(input.streamId, count);

        return { success: true };
      }),

    // Leave stream
    leave: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        await db.endViewerSession(input.sessionId);
        return { success: true };
      }),

    // Get active viewer count
    getCount: publicProcedure
      .input(z.object({ streamId: z.number() }))
      .query(async ({ input }) => {
        return await db.getActiveViewerCount(input.streamId);
      }),
  }),

  notifications: router({
    // Get unread notifications (admin only)
    getUnread: adminProcedure.query(async () => {
      return await db.getUnreadNotifications();
    }),
  }),
});

export type AppRouter = typeof appRouter;
