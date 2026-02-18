import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  streams, InsertStream,
  chatMessages, InsertChatMessage,
  streamSettings, InsertStreamSettings,
  viewerSessions, InsertViewerSession,
  notifications, InsertNotification
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
