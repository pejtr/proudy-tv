import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";

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

  // Messages (DM/Inbox)
  messages: router({
    // Send message
    send: protectedProcedure
      .input(z.object({
        receiverId: z.number(),
        message: z.string().min(1).max(2000),
      }))
      .mutation(async ({ ctx, input }) => {
        const messageId = await db.sendMessage(ctx.user.id, input.receiverId, input.message);
        return { messageId, success: true };
      }),

    // Get conversations list
    getConversations: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserConversations(ctx.user.id);
    }),

    // Get messages with specific user
    getMessages: protectedProcedure
      .input(z.object({
        otherUserId: z.number(),
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getMessagesBetweenUsers(ctx.user.id, input.otherUserId, input.limit);
      }),

    // Mark messages as read
    markAsRead: protectedProcedure
      .input(z.object({ senderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markMessagesAsRead(ctx.user.id, input.senderId);
        return { success: true };
      }),

    // Get unread count
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadMessageCount(ctx.user.id);
    }),
  }),

  // Follow/Favorite System
  follows: router({
    // Follow user
    follow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.id === input.userId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot follow yourself' });
        }
        await db.followUser(ctx.user.id, input.userId);
        return { success: true };
      }),

    // Unfollow user
    unfollow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.unfollowUser(ctx.user.id, input.userId);
        return { success: true };
      }),

    // Check if following
    isFollowing: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.isFollowing(ctx.user.id, input.userId);
      }),

    // Get followers
    getFollowers: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFollowers(input.userId);
      }),

    // Get following
    getFollowing: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFollowing(input.userId);
      }),

    // Get follower count
    getFollowerCount: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFollowerCount(input.userId);
      }),
  }),

  // Stories
  stories: router({
    // Create story
    create: protectedProcedure
      .input(z.object({
        mediaUrl: z.string().url(),
        mediaType: z.enum(['image', 'video']),
        duration: z.number().default(15),
      }))
      .mutation(async ({ ctx, input }) => {
        const storyId = await db.createStory(ctx.user.id, input.mediaUrl, input.mediaType, input.duration);
        return { storyId, success: true };
      }),

    // Get active stories from followed users
    getFollowingStories: protectedProcedure.query(async ({ ctx }) => {
      return await db.getFollowingStories(ctx.user.id);
    }),

    // Get user's stories
    getUserStories: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserStories(input.userId);
      }),

    // View story
    view: protectedProcedure
      .input(z.object({ storyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.viewStory(input.storyId, ctx.user.id);
        return { success: true };
      }),

    // Get story viewers
    getViewers: protectedProcedure
      .input(z.object({ storyId: z.number() }))
      .query(async ({ ctx, input }) => {
        const story = await db.getStoryById(input.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return await db.getStoryViewers(input.storyId);
      }),

    // Delete story
    delete: protectedProcedure
      .input(z.object({ storyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const story = await db.getStoryById(input.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.deleteStory(input.storyId);
        return { success: true };
      }),
  }),

  // For You Feed
  feed: router({
    // Get personalized feed
    getForYou: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getPersonalizedFeed(ctx.user.id, input.limit, input.offset);
      }),

    // Create feed item (clip/highlight)
    create: protectedProcedure
      .input(z.object({
        streamId: z.number().optional(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        mediaUrl: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        duration: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const feedItemId = await db.createFeedItem(ctx.user.id, input);
        return { feedItemId, success: true };
      }),

    // Like feed item
    like: protectedProcedure
      .input(z.object({ feedItemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.likeFeedItem(input.feedItemId, ctx.user.id);
        return { success: true };
      }),

    // Mark as not interested
    notInterested: protectedProcedure
      .input(z.object({ feedItemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markNotInterested(input.feedItemId, ctx.user.id);
        return { success: true };
      }),

    // Record view
    recordView: protectedProcedure
      .input(z.object({ feedItemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.recordFeedView(input.feedItemId, ctx.user.id);
        return { success: true };
      }),
  }),

  // Profile Management
  profile: router({
    // Get user profile
    get: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserProfile(input.userId);
      }),

    // Update profile
    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        bio: z.string().max(500).optional(),
        socialLinks: z.object({
          twitter: z.string().optional(),
          instagram: z.string().optional(),
          youtube: z.string().optional(),
          tiktok: z.string().optional(),
          discord: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),

    // Update avatar
    updateAvatar: protectedProcedure
      .input(z.object({ avatarUrl: z.string().url() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserAvatar(ctx.user.id, input.avatarUrl);
        return { success: true };
      }),
  }),

  // Community Forum
  community: router({
    // Create post
    createPost: protectedProcedure
      .input(z.object({
        groupId: z.number().optional(),
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        category: z.enum(['discussion', 'help', 'showcase', 'memes', 'announcement']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const postId = await db.createCommunityPost(ctx.user.id, input);
        return { postId, success: true };
      }),

    // Get posts
    getPosts: publicProcedure
      .input(z.object({
        groupId: z.number().optional(),
        category: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await db.getCommunityPosts(input.groupId, input.category, input.limit, input.offset);
      }),

    // Get post by ID
    getPost: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPostById(input.postId);
      }),

    // Like post
    likePost: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.likePost(input.postId, ctx.user.id);
        return { success: true };
      }),

    // Unlike post
    unlikePost: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.unlikePost(input.postId, ctx.user.id);
        return { success: true };
      }),

    // Add comment
    addComment: protectedProcedure
      .input(z.object({
        postId: z.number(),
        content: z.string().min(1).max(2000),
      }))
      .mutation(async ({ ctx, input }) => {
        const commentId = await db.addComment(input.postId, ctx.user.id, input.content);
        return { commentId, success: true };
      }),

    // Get comments
    getComments: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPostComments(input.postId);
      }),

    // Create group
    createGroup: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        isPublic: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const groupId = await db.createGroup(ctx.user.id, input);
        return { groupId, success: true };
      }),

    // Get groups
    getGroups: publicProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await db.getGroups(input.limit);
      }),

    // Get group by ID
    getGroup: publicProcedure
      .input(z.object({ groupId: z.number() }))
      .query(async ({ input }) => {
        return await db.getGroupById(input.groupId);
      }),

    // Join group
    joinGroup: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.joinGroup(input.groupId, ctx.user.id);
        return { success: true };
      }),

    // Leave group
    leaveGroup: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.leaveGroup(input.groupId, ctx.user.id);
        return { success: true };
      }),

    // Check membership
    isMember: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.isGroupMember(input.groupId, ctx.user.id);
      }),
  }),

  // Stream Goals & Challenges
  goals: router({
    // Create goal
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["sub_goal", "donation_goal"]),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        targetValue: z.number().min(1),
        widgetColor: z.string().optional(),
        widgetPosition: z.enum(["top_left", "top_right", "bottom_left", "bottom_right"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const goalId = await db.createGoal(ctx.user.id, input);
        return { goalId, success: true };
      }),

    // Update goal progress
    updateProgress: protectedProcedure
      .input(z.object({
        goalId: z.number(),
        currentValue: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateGoalProgress(input.goalId, input.currentValue);
        return { success: true };
      }),

    // Get active goal for streamer
    getActive: publicProcedure
      .input(z.object({ streamerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getActiveGoal(input.streamerId);
      }),

    // Complete goal
    complete: protectedProcedure
      .input(z.object({ goalId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.completeGoal(input.goalId);
        return { success: true };
      }),

    // Get goal history
    getHistory: publicProcedure
      .input(z.object({ streamerId: z.number(), limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await db.getGoalHistory(input.streamerId, input.limit);
      }),
   }),

  // Custom Emotes with AI Generation
  emotes: router({
    // Get emotes for a streamer
    getByStreamer: publicProcedure
      .input(z.object({ streamerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStreamerEmotes(input.streamerId);
      }),

    // Generate emote with AI
    generateWithAI: streamerProcedure
      .input(z.object({
        name: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores'),
        prompt: z.string().min(5).max(500),
        tier: z.enum(['free', 'subscriber']).default('free'),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if emote name already exists for this streamer
        const existing = await db.getEmoteByName(ctx.user.id, input.name);
        if (existing) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Emote name already exists' });
        }

        // Generate image with AI (optimized prompt for emotes)
        const emotePrompt = `${input.prompt}, emote style, transparent background, simple cartoon style, expressive, 112x112 pixels, high quality digital art`;
        const { url: imageUrl } = await generateImage({ prompt: emotePrompt });

        if (!imageUrl) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate emote image' });
        }

        // Upload to S3 with proper naming
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `emotes/${ctx.user.id}/${input.name}-${timestamp}-${randomSuffix}.png`;
        
        // Download image and re-upload to S3
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        const { url: s3Url } = await storagePut(fileKey, imageBuffer, 'image/png');

        // Save to database
        const emoteId = await db.createEmote({
          streamerId: ctx.user.id,
          name: input.name,
          imageUrl: s3Url,
          tier: input.tier,
          generatedByAI: true,
          aiPrompt: input.prompt,
        });

        return { emoteId, imageUrl: s3Url, success: true };
      }),

    // Upload custom emote (manual)
    uploadCustom: streamerProcedure
      .input(z.object({
        name: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_]+$/),
        imageUrl: z.string().url(),
        tier: z.enum(['free', 'subscriber']).default('free'),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getEmoteByName(ctx.user.id, input.name);
        if (existing) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Emote name already exists' });
        }

        const emoteId = await db.createEmote({
          streamerId: ctx.user.id,
          name: input.name,
          imageUrl: input.imageUrl,
          tier: input.tier,
          generatedByAI: false,
        });

        return { emoteId, success: true };
      }),

    // Toggle emote enabled status
    toggleEnabled: streamerProcedure
      .input(z.object({ emoteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const emote = await db.getEmoteById(input.emoteId);
        if (!emote || emote.streamerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.toggleEmoteEnabled(input.emoteId);
        return { success: true };
      }),

    // Delete emote
    delete: streamerProcedure
      .input(z.object({ emoteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const emote = await db.getEmoteById(input.emoteId);
        if (!emote || emote.streamerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.deleteEmote(input.emoteId);
        return { success: true };
      }),

    // Get my emotes (for streamer)
    getMyEmotes: streamerProcedure.query(async ({ ctx }) => {
      return await db.getStreamerEmotes(ctx.user.id);
    }),
  }),

  // Payment & Monetization
  payment: router({
    // Create Stripe Checkout session for coin purchase
    createCheckout: protectedProcedure
      .input(z.object({
        productType: z.enum(['coins', 'subscription', 'donation']),
        coinAmount: z.number().optional(),
        priceInCzk: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'czk',
                product_data: {
                  name: input.productType === 'coins' 
                    ? `${input.coinAmount} Proudy Coins`
                    : input.productType === 'subscription'
                    ? 'Monthly Subscription (88 coins)'
                    : 'Donation',
                  description: input.productType === 'coins'
                    ? `Purchase ${input.coinAmount} Proudy Coins (1 coin = 1 Kč)`
                    : undefined,
                },
                unit_amount: input.priceInCzk * 100, // Convert to cents
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${ctx.req.headers.origin}/coins?success=true`,
          cancel_url: `${ctx.req.headers.origin}/coins?canceled=true`,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            product_type: input.productType,
            coin_amount: input.coinAmount?.toString() || '0',
          },
        });

        return { url: session.url };
      }),
  }),
});
export type AppRouter = typeof appRouter;
