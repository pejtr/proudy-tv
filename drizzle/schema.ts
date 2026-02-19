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
  // Profile fields
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  socialLinks: text("social_links"), // JSON: { twitter, instagram, youtube, tiktok, discord }
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
  hlsUrl: text("hls_url"), // HLS stream URL (for live or looped video)
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

/**
 * Direct messages between users
 */
export const messages = mysqlTable("messages", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  senderId: int("sender_id").notNull(),
  receiverId: int("receiver_id").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  senderIdx: index("sender_idx").on(table.senderId),
  receiverIdx: index("receiver_idx").on(table.receiverId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

/**
 * User follows/favorites for notifications
 */
export const follows = mysqlTable("follows", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("follower_id").notNull(),
  followingId: int("following_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  followerIdx: index("follower_idx").on(table.followerId),
  followingIdx: index("following_idx").on(table.followingId),
  uniqueFollow: index("unique_follow").on(table.followerId, table.followingId),
}));

/**
 * Stories (24-hour temporary content)
 */
export const stories = mysqlTable("stories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: mysqlEnum("media_type", ["image", "video"]).notNull(),
  duration: int("duration").default(15).notNull(), // seconds
  viewCount: int("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // 24 hours from creation
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  expiresAtIdx: index("expires_at_idx").on(table.expiresAt),
}));

/**
 * Story views tracking
 */
export const storyViews = mysqlTable("story_views", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  storyId: int("story_id").notNull(),
  viewerId: int("viewer_id").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
}, (table) => ({
  storyIdx: index("story_idx").on(table.storyId),
  viewerIdx: index("viewer_idx").on(table.viewerId),
  uniqueView: index("unique_view").on(table.storyId, table.viewerId),
}));

/**
 * For You feed items (clips, highlights, recommendations)
 */
export const feedItems = mysqlTable("feed_items", {
  id: int("id").autoincrement().primaryKey(),
  streamId: int("stream_id"),
  userId: int("user_id").notNull(), // creator
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  mediaUrl: text("media_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: int("duration").notNull(), // seconds
  viewCount: int("view_count").default(0).notNull(),
  likeCount: int("like_count").default(0).notNull(),
  commentCount: int("comment_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  streamIdx: index("stream_idx").on(table.streamId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

/**
 * Feed item interactions (likes, views)
 */
export const feedInteractions = mysqlTable("feed_interactions", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  feedItemId: int("feed_item_id").notNull(),
  userId: int("user_id").notNull(),
  interactionType: mysqlEnum("interaction_type", ["view", "like", "share", "not_interested"]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  feedItemIdx: index("feed_item_idx").on(table.feedItemId),
  userIdx: index("user_idx").on(table.userId),
  typeIdx: index("type_idx").on(table.interactionType),
}));

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;
export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;
export type StoryView = typeof storyViews.$inferSelect;
export type InsertStoryView = typeof storyViews.$inferInsert;
export type FeedItem = typeof feedItems.$inferSelect;
export type InsertFeedItem = typeof feedItems.$inferInsert;
export type FeedInteraction = typeof feedInteractions.$inferSelect;
export type InsertFeedInteraction = typeof feedInteractions.$inferInsert;
