import { eq, and, or, desc, sql } from 'drizzle-orm';
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  streams, InsertStream,
  chatMessages, InsertChatMessage,
  streamSettings, InsertStreamSettings,
  viewerSessions, InsertViewerSession,
  notifications, InsertNotification,
  messages, follows, stories, storyViews, feedItems, feedInteractions
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from 'nanoid';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER OPERATIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= STREAM OPERATIONS =============

export async function generateStreamKey(): Promise<string> {
  return `sk_${nanoid(32)}`;
}

export async function createStream(streamerId: number, title: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const streamKey = await generateStreamKey();
  
  await db.insert(streams).values({
    streamerId,
    title,
    description: description || null,
    streamKey,
    isLive: false,
  });

  const result = await db.select().from(streams).where(eq(streams.streamKey, streamKey)).limit(1);
  return result[0]?.id;
}

export async function getStreamByKey(streamKey: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(streams).where(eq(streams.streamKey, streamKey)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStreamById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(streams).where(eq(streams.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLiveStreams() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(streams).where(eq(streams.isLive, true)).orderBy(desc(streams.viewerCount));
}

export async function getStreamerStreams(streamerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(streams).where(eq(streams.streamerId, streamerId)).orderBy(desc(streams.createdAt));
}

export async function updateStreamStatus(streamId: number, isLive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: any = { isLive };
  
  if (isLive) {
    updates.startedAt = new Date();
  } else {
    updates.endedAt = new Date();
  }

  await db.update(streams).set(updates).where(eq(streams.id, streamId));
}

export async function updateViewerCount(streamId: number, count: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const stream = await getStreamById(streamId);
  if (!stream) return;

  const updates: any = { viewerCount: count };
  
  if (count > stream.peakViewerCount) {
    updates.peakViewerCount = count;
  }

  await db.update(streams).set(updates).where(eq(streams.id, streamId));
}

// ============= CHAT OPERATIONS =============

export async function saveChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(chatMessages).values(message);
  const result = await db.select().from(chatMessages)
    .where(and(
      eq(chatMessages.streamId, message.streamId),
      eq(chatMessages.userId, message.userId)
    ))
    .orderBy(desc(chatMessages.createdAt))
    .limit(1);
  return result[0]?.id;
}

export async function getChatHistory(streamId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(chatMessages)
    .where(and(
      eq(chatMessages.streamId, streamId),
      eq(chatMessages.isModerated, false)
    ))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
}

// ============= STREAM SETTINGS OPERATIONS =============

export async function getStreamSettings(streamerId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(streamSettings).where(eq(streamSettings.streamerId, streamerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertStreamSettings(settings: InsertStreamSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(streamSettings).values(settings).onDuplicateKeyUpdate({
    set: settings,
  });
}

// ============= VIEWER SESSION OPERATIONS =============

export async function createViewerSession(streamId: number, userId: number | null, sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(viewerSessions).values({
    streamId,
    userId: userId || null,
    sessionId,
    isActive: true,
  });
}

export async function endViewerSession(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(viewerSessions).set({
    leftAt: new Date(),
    isActive: false,
  }).where(eq(viewerSessions.sessionId, sessionId));
}

export async function getActiveViewerCount(streamId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select()
    .from(viewerSessions)
    .where(and(
      eq(viewerSessions.streamId, streamId),
      eq(viewerSessions.isActive, true)
    ));

  return result.length;
}

// ============= NOTIFICATION OPERATIONS =============

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(notifications).values(notification);
}

export async function getUnreadNotifications() {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(notifications)
    .where(eq(notifications.isRead, false))
    .orderBy(desc(notifications.createdAt));
}


// ============= MESSAGING OPERATIONS =============

export async function sendMessage(senderId: number, receiverId: number, message: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(messages).values({
    senderId,
    receiverId,
    message,
    isRead: false,
  });
  
  return result.insertId;
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const sent = await db.select().from(messages).where(eq(messages.senderId, userId));
  const received = await db.select().from(messages).where(eq(messages.receiverId, userId));
  
  const allMessages = [...sent, ...received];
  const otherUserIds = new Set<number>();
  
  allMessages.forEach(msg => {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    otherUserIds.add(otherId);
  });
  
  const conversations = [];
  for (const otherId of Array.from(otherUserIds)) {
    const otherUser = await db.select().from(users).where(eq(users.id, otherId)).limit(1);
    const lastMessage = allMessages
      .filter(m => m.senderId === otherId || m.receiverId === otherId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    
    const unreadCount = await db.select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(and(
        eq(messages.receiverId, userId),
        eq(messages.senderId, otherId),
        eq(messages.isRead, false)
      ));
    
    if (otherUser[0]) {
      conversations.push({
        user: otherUser[0],
        lastMessage,
        unreadCount: Number(unreadCount[0]?.count || 0),
      });
    }
  }
  
  return conversations.sort((a, b) => 
    b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
  );
}

export async function getMessagesBetweenUsers(userId1: number, userId2: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const msgs = await db.select().from(messages)
    .where(or(
      and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
      and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
    ))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
  
  return msgs.reverse();
}

export async function markMessagesAsRead(receiverId: number, senderId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(messages)
    .set({ isRead: true })
    .where(and(
      eq(messages.receiverId, receiverId),
      eq(messages.senderId, senderId),
      eq(messages.isRead, false)
    ));
}

export async function getUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(
      eq(messages.receiverId, userId),
      eq(messages.isRead, false)
    ));
  
  return Number(result[0]?.count || 0);
}

// ============= FOLLOW OPERATIONS =============

export async function followUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(follows).values({
    followerId,
    followingId,
  });
}

export async function unfollowUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(follows).where(and(
    eq(follows.followerId, followerId),
    eq(follows.followingId, followingId)
  ));
}

export async function isFollowing(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(follows)
    .where(and(
      eq(follows.followerId, followerId),
      eq(follows.followingId, followingId)
    ))
    .limit(1);
  
  return result.length > 0;
}

export async function getFollowers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const followerRecords = await db.select().from(follows)
    .where(eq(follows.followingId, userId));
  
  const followerUsers = [];
  for (const record of followerRecords) {
    const user = await db.select().from(users).where(eq(users.id, record.followerId)).limit(1);
    if (user[0]) followerUsers.push(user[0]);
  }
  
  return followerUsers;
}

export async function getFollowing(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const followingRecords = await db.select().from(follows)
    .where(eq(follows.followerId, userId));
  
  const followingUsers = [];
  for (const record of followingRecords) {
    const user = await db.select().from(users).where(eq(users.id, record.followingId)).limit(1);
    if (user[0]) followingUsers.push(user[0]);
  }
  
  return followingUsers;
}

export async function getFollowerCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(follows)
    .where(eq(follows.followingId, userId));
  
  return Number(result[0]?.count || 0);
}

// ============= STORIES OPERATIONS =============

export async function createStory(userId: number, mediaUrl: string, mediaType: 'image' | 'video', duration: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  const [result] = await db.insert(stories).values({
    userId,
    mediaUrl,
    mediaType,
    duration,
    expiresAt,
  });
  
  return result.insertId;
}

export async function getFollowingStories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const followingUsers = await getFollowing(userId);
  const followingIds = followingUsers.map(u => u.id);
  
  if (followingIds.length === 0) return [];
  
  const activeStories = await db.select().from(stories)
    .where(and(
      sql`${stories.userId} IN (${followingIds.join(',')})`,
      sql`${stories.expiresAt} > NOW()`
    ))
    .orderBy(desc(stories.createdAt));
  
  return activeStories;
}

export async function getUserStories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(stories)
    .where(and(
      eq(stories.userId, userId),
      sql`${stories.expiresAt} > NOW()`
    ))
    .orderBy(desc(stories.createdAt));
}

export async function getStoryById(storyId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(stories).where(eq(stories.id, storyId)).limit(1);
  return result[0] || null;
}

export async function viewStory(storyId: number, viewerId: number) {
  const db = await getDb();
  if (!db) return;
  
  // Check if already viewed
  const existing = await db.select().from(storyViews)
    .where(and(
      eq(storyViews.storyId, storyId),
      eq(storyViews.viewerId, viewerId)
    ))
    .limit(1);
  
  if (existing.length === 0) {
    await db.insert(storyViews).values({
      storyId,
      viewerId,
    });
    
    // Increment view count
    await db.update(stories)
      .set({ viewCount: sql`${stories.viewCount} + 1` })
      .where(eq(stories.id, storyId));
  }
}

export async function getStoryViewers(storyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const views = await db.select().from(storyViews)
    .where(eq(storyViews.storyId, storyId))
    .orderBy(desc(storyViews.viewedAt));
  
  const viewers = [];
  for (const view of views) {
    const user = await db.select().from(users).where(eq(users.id, view.viewerId)).limit(1);
    if (user[0]) {
      viewers.push({
        user: user[0],
        viewedAt: view.viewedAt,
      });
    }
  }
  
  return viewers;
}

export async function deleteStory(storyId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(storyViews).where(eq(storyViews.storyId, storyId));
  await db.delete(stories).where(eq(stories.id, storyId));
}

// ============= FEED OPERATIONS =============

export async function createFeedItem(userId: number, data: {
  streamId?: number;
  title: string;
  description?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  duration: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(feedItems).values({
    userId,
    ...data,
  });
  
  return result.insertId;
}

export async function getPersonalizedFeed(userId: number, limit: number, offset: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Simple algorithm: show recent content from followed users + popular content
  const followingUsers = await getFollowing(userId);
  const followingIds = followingUsers.map(u => u.id);
  
  let items;
  if (followingIds.length > 0) {
    items = await db.select().from(feedItems)
      .where(sql`${feedItems.userId} IN (${followingIds.join(',')})`)
      .orderBy(desc(feedItems.createdAt))
      .limit(limit)
      .offset(offset);
  } else {
    // Show popular content for new users
    items = await db.select().from(feedItems)
      .orderBy(desc(feedItems.viewCount), desc(feedItems.likeCount))
      .limit(limit)
      .offset(offset);
  }
  
  return items;
}

export async function likeFeedItem(feedItemId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  // Check if already liked
  const existing = await db.select().from(feedInteractions)
    .where(and(
      eq(feedInteractions.feedItemId, feedItemId),
      eq(feedInteractions.userId, userId),
      eq(feedInteractions.interactionType, 'like')
    ))
    .limit(1);
  
  if (existing.length === 0) {
    await db.insert(feedInteractions).values({
      feedItemId,
      userId,
      interactionType: 'like',
    });
    
    await db.update(feedItems)
      .set({ likeCount: sql`${feedItems.likeCount} + 1` })
      .where(eq(feedItems.id, feedItemId));
  }
}

export async function markNotInterested(feedItemId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(feedInteractions).values({
    feedItemId,
    userId,
    interactionType: 'not_interested',
  });
}

export async function recordFeedView(feedItemId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(feedInteractions).values({
    feedItemId,
    userId,
    interactionType: 'view',
  });
  
  await db.update(feedItems)
    .set({ viewCount: sql`${feedItems.viewCount} + 1` })
    .where(eq(feedItems.id, feedItemId));
}

// ============= PROFILE OPERATIONS =============

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] || null;
}

export async function updateUserProfile(userId: number, data: {
  name?: string;
  bio?: string;
  socialLinks?: any;
}) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.socialLinks !== undefined) updateData.socialLinks = JSON.stringify(data.socialLinks);
  
  await db.update(users).set(updateData).where(eq(users.id, userId));
}

export async function updateUserAvatar(userId: number, avatarUrl: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users).set({ avatarUrl }).where(eq(users.id, userId));
}
