import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, bigint, index } from "drizzle-orm/mysql-core";

/**
 * Core user table with role-based access control
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["viewer", "streamer", "admin"]).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  roleIdx: index("role_idx").on(table.role),
}));

/**
 * Streams table - tracks live and archived streams
 */
export const streams = mysqlTable("streams", {
  id: int("id").autoincrement().primaryKey(),
  streamerId: int("streamer_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  streamKey: varchar("stream_key", { length: 64 }).notNull().unique(),
  isLive: boolean("is_live").default(false).notNull(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  viewerCount: int("viewer_count").default(0).notNull(),
  peakViewerCount: int("peak_viewer_count").default(0).notNull(),
  thumbnailUrl: text("thumbnail_url"),
  vodUrl: text("vod_url"), // S3 URL for archived stream
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  streamerIdx: index("streamer_idx").on(table.streamerId),
  isLiveIdx: index("is_live_idx").on(table.isLive),
  startedAtIdx: index("started_at_idx").on(table.startedAt),
}));

/**
 * Chat messages with AI moderation tracking
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  streamId: int("stream_id").notNull(),
  userId: int("user_id").notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isModerated: boolean("is_moderated").default(false).notNull(),
  moderationReason: text("moderation_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  streamIdx: index("stream_idx").on(table.streamId),
  userIdx: index("user_idx").on(table.userId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

/**
 * Stream settings - AR filters, voice changer, avatar preferences
 */
export const streamSettings = mysqlTable("stream_settings", {
  id: int("id").autoincrement().primaryKey(),
  streamerId: int("streamer_id").notNull().unique(),
  arFilterEnabled: boolean("ar_filter_enabled").default(false).notNull(),
  arFilterType: varchar("ar_filter_type", { length: 64 }),
  voiceChangerEnabled: boolean("voice_changer_enabled").default(false).notNull(),
  voiceChangerPreset: varchar("voice_changer_preset", { length: 64 }),
  avatarEnabled: boolean("avatar_enabled").default(false).notNull(),
  avatarModelUrl: text("avatar_model_url"),
  avatarConfig: text("avatar_config"), // JSON config for avatar customization
  // Background settings
  backgroundType: mysqlEnum("background_type", ["none", "image", "video", "greenscreen"]).default("none"),
  backgroundUrl: text("background_url"),
  // PIP layout settings
  pipLayout: mysqlEnum("pip_layout", ["rectangular", "circular"]).default("rectangular"),
  pipPosition: mysqlEnum("pip_position", ["top-left", "top-right", "bottom-left", "bottom-right", "center"]).default("bottom-right"),
  pipSize: mysqlEnum("pip_size", ["small", "medium", "large"]).default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  streamerIdx: index("streamer_idx").on(table.streamerId),
}));

/**
 * Viewer sessions - track who's watching what
 */
export const viewerSessions = mysqlTable("viewer_sessions", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  streamId: int("stream_id").notNull(),
  userId: int("user_id"),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at"),
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => ({
  streamIdx: index("stream_idx").on(table.streamId),
  sessionIdx: index("session_idx").on(table.sessionId),
  isActiveIdx: index("is_active_idx").on(table.isActive),
}));

/**
 * Notifications - system alerts for owner
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["stream_started", "high_viewers", "technical_issue"]).notNull(),
  streamId: int("stream_id"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("type_idx").on(table.type),
  isReadIdx: index("is_read_idx").on(table.isRead),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Stream = typeof streams.$inferSelect;
export type InsertStream = typeof streams.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type StreamSettings = typeof streamSettings.$inferSelect;
export type InsertStreamSettings = typeof streamSettings.$inferInsert;
export type ViewerSession = typeof viewerSessions.$inferSelect;
export type InsertViewerSession = typeof viewerSessions.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
