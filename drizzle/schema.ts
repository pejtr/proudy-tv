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
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationToken: varchar("verification_token", { length: 64 }),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  // Profile fields
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  socialLinks: text("social_links"), // JSON: { twitter, instagram, youtube, tiktok, discord }
  // Partner Program
  partnerTier: mysqlEnum("partner_tier", ["basic", "affiliate", "partner"]).default("basic").notNull(),
  monthlyStreamHours: int("monthly_stream_hours").default(0).notNull(),
  activeSubscribers: int("active_subscribers").default(0).notNull(),
  lastTierCheck: timestamp("last_tier_check").defaultNow().notNull(),
  // Monetization
  coinsBalance: int("coins_balance").default(0).notNull(),
  watchPoints: int("watch_points").default(0).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
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
  category: mysqlEnum("category", ["Chill & Talk", "Gaming", "Music", "ASMR"]).default("Chill & Talk").notNull(),
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


/**
 * Community posts - forum posts and discussions
 */
export const communityPosts = mysqlTable("community_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  groupId: int("group_id"), // null for general posts
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["discussion", "help", "showcase", "memes", "announcement"]).default("discussion").notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  likeCount: int("like_count").default(0).notNull(),
  commentCount: int("comment_count").default(0).notNull(),
  viewCount: int("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  groupIdx: index("group_idx").on(table.groupId),
  categoryIdx: index("category_idx").on(table.category),
}));

export type InsertCommunityPost = typeof communityPosts.$inferInsert;

/**
 * Community comments - replies to posts
 */
export const communityComments = mysqlTable("community_comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("post_id").notNull(),
  userId: int("user_id").notNull(),
  content: text("content").notNull(),
  likeCount: int("like_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  postIdx: index("post_idx").on(table.postId),
  userIdx: index("user_idx").on(table.userId),
}));

export type InsertCommunityComment = typeof communityComments.$inferInsert;

/**
 * Community groups - user-created communities
 */
export const communityGroups = mysqlTable("community_groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  creatorId: int("creator_id").notNull(),
  iconUrl: text("icon_url"),
  bannerUrl: text("banner_url"),
  memberCount: int("member_count").default(0).notNull(),
  postCount: int("post_count").default(0).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  creatorIdx: index("creator_idx").on(table.creatorId),
}));

export type InsertCommunityGroup = typeof communityGroups.$inferInsert;

/**
 * Group members - tracks group membership
 */
export const groupMembers = mysqlTable("group_members", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("group_id").notNull(),
  userId: int("user_id").notNull(),
  role: mysqlEnum("role", ["member", "moderator", "admin"]).default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  groupIdx: index("group_idx").on(table.groupId),
  userIdx: index("user_idx").on(table.userId),
  uniqueMembership: index("unique_membership").on(table.groupId, table.userId),
}));

export type InsertGroupMember = typeof groupMembers.$inferInsert;

/**
 * Post likes - tracks who liked which posts
 */
export const postLikes = mysqlTable("post_likes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("post_id").notNull(),
  userId: int("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("post_idx").on(table.postId),
  userIdx: index("user_idx").on(table.userId),
  uniqueLike: index("unique_like").on(table.postId, table.userId),
}));

export type InsertPostLike = typeof postLikes.$inferInsert;


/**
 * Coin transactions - tracks all coin purchases and spending
 */
export const coinTransactions = mysqlTable("coin_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  amount: int("amount").notNull(), // positive for purchase, negative for spending
  type: mysqlEnum("type", ["purchase", "donation", "subscription", "refund"]).notNull(),
  description: text("description"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  typeIdx: index("type_idx").on(table.type),
}));

export type InsertCoinTransaction = typeof coinTransactions.$inferInsert;

/**
 * Subscriptions - tracks active subscriptions to streamers
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  subscriberId: int("subscriber_id").notNull(),
  streamerId: int("streamer_id").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  subscriberIdx: index("subscriber_idx").on(table.subscriberId),
  streamerIdx: index("streamer_idx").on(table.streamerId),
  statusIdx: index("status_idx").on(table.status),
}));

export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Donation tiers - custom donation amounts with video/audio alerts
 */
export const donationTiers = mysqlTable("donation_tiers", {
  id: int("id").autoincrement().primaryKey(),
  streamerId: int("streamer_id").notNull(),
  amount: int("amount").notNull(), // in coins
  slotNumber: int("slot_number").notNull(), // 1-12
  videoUrl: text("video_url"), // S3 URL for alert video
  audioUrl: text("audio_url"), // S3 URL for alert sound
  isEnabled: boolean("is_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  streamerIdx: index("streamer_idx").on(table.streamerId),
  uniqueSlot: index("unique_slot").on(table.streamerId, table.slotNumber),
}));

export type InsertDonationTier = typeof donationTiers.$inferInsert;

/**
 * Donations - tracks all donations made to streamers
 */
export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  donorId: int("donor_id").notNull(),
  streamerId: int("streamer_id").notNull(),
  streamId: int("stream_id"), // null if offline donation
  amount: int("amount").notNull(), // in coins
  message: text("message"),
  tierSlot: int("tier_slot"), // which donation tier was used (1-12)
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  donorIdx: index("donor_idx").on(table.donorId),
  streamerIdx: index("streamer_idx").on(table.streamerId),
  streamIdx: index("stream_idx").on(table.streamId),
}));

export type InsertDonation = typeof donations.$inferInsert;


/**
 * Watch sessions - tracks viewer watch time for point accumulation
 */
export const watchSessions = mysqlTable("watch_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  streamerId: int("streamer_id").notNull(),
  streamId: int("stream_id"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  durationMinutes: int("duration_minutes").default(0).notNull(),
  pointsEarned: int("points_earned").default(0).notNull(),
  hadSubscription: boolean("had_subscription").default(false).notNull(), // 3x multiplier
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  streamerIdx: index("streamer_idx").on(table.streamerId),
  streamIdx: index("stream_idx").on(table.streamId),
}));

export type InsertWatchSession = typeof watchSessions.$inferInsert;

/**
 * Custom rewards - streamer-defined rewards that viewers can redeem with points
 */
export const customRewards = mysqlTable("custom_rewards", {
  id: int("id").autoincrement().primaryKey(),
  streamerId: int("streamer_id").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  cost: int("cost").notNull(), // points required
  iconUrl: text("icon_url"),
  backgroundColor: varchar("background_color", { length: 7 }).default("#9146FF"), // hex color
  isEnabled: boolean("is_enabled").default(true).notNull(),
  requiresInput: boolean("requires_input").default(false).notNull(), // e.g., "request a song"
  cooldownMinutes: int("cooldown_minutes").default(0).notNull(),
  maxRedemptionsPerStream: int("max_redemptions_per_stream"),
  maxRedemptionsPerUser: int("max_redemptions_per_user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  streamerIdx: index("streamer_idx").on(table.streamerId),
}));

export type InsertCustomReward = typeof customRewards.$inferInsert;

/**
 * Reward redemptions - tracks when viewers redeem rewards
 */
export const rewardRedemptions = mysqlTable("reward_redemptions", {
  id: int("id").autoincrement().primaryKey(),
  rewardId: int("reward_id").notNull(),
  userId: int("user_id").notNull(),
  streamerId: int("streamer_id").notNull(),
  streamId: int("stream_id"),
  userInput: text("user_input"), // if reward requires input
  status: mysqlEnum("status", ["pending", "fulfilled", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  fulfilledAt: timestamp("fulfilled_at"),
}, (table) => ({
  rewardIdx: index("reward_idx").on(table.rewardId),
  userIdx: index("user_idx").on(table.userId),
  streamerIdx: index("streamer_idx").on(table.streamerId),
  statusIdx: index("status_idx").on(table.status),
}));

export type InsertRewardRedemption = typeof rewardRedemptions.$inferInsert;

/**
 * Watch streaks - tracks consecutive days watching a streamer
 */
export const watchStreaks = mysqlTable("watch_streaks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  streamerId: int("streamer_id").notNull(),
  currentStreak: int("current_streak").default(0).notNull(),
  longestStreak: int("longest_streak").default(0).notNull(),
  lastWatchDate: timestamp("last_watch_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  streamerIdx: index("streamer_idx").on(table.streamerId),
  uniqueStreak: index("unique_streak").on(table.userId, table.streamerId),
}));

export type InsertWatchStreak = typeof watchStreaks.$inferInsert;


/**
 * Chat polls - interactive polls created by streamers/moderators
 */
export const chatPolls = mysqlTable("chat_polls", {
  id: int("id").autoincrement().primaryKey(),
  streamId: int("stream_id").notNull(),
  creatorId: int("creator_id").notNull(),
  question: varchar("question", { length: 255 }).notNull(),
  options: text("options").notNull(), // JSON array of options
  durationMinutes: int("duration_minutes").default(5).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  totalVotes: int("total_votes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
}, (table) => ({
  streamIdx: index("stream_idx").on(table.streamId),
  creatorIdx: index("creator_idx").on(table.creatorId),
  activeIdx: index("active_idx").on(table.isActive),
}));

export type InsertChatPoll = typeof chatPolls.$inferInsert;

/**
 * Poll votes - tracks user votes on polls (one vote per user per poll)
 */
export const pollVotes = mysqlTable("poll_votes", {
  id: int("id").autoincrement().primaryKey(),
  pollId: int("poll_id").notNull(),
  userId: int("user_id").notNull(),
  optionIndex: int("option_index").notNull(), // 0-based index into options array
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pollIdx: index("poll_idx").on(table.pollId),
  userIdx: index("user_idx").on(table.userId),
  uniqueVote: index("unique_vote").on(table.pollId, table.userId),
}));

export type InsertPollVote = typeof pollVotes.$inferInsert;


/**
 * Custom emotes - streamer-specific emotes for chat
 */
export const customEmotes = mysqlTable("custom_emotes", {
  id: int("id").autoincrement().primaryKey(),
  streamerId: int("streamer_id").notNull(),
  name: varchar("name", { length: 50 }).notNull(), // e.g., "happycat", "rage"
  imageUrl: text("image_url").notNull(), // S3 URL
  tier: mysqlEnum("tier", ["free", "subscriber"]).default("free").notNull(),
  usageCount: int("usage_count").default(0).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  generatedByAI: boolean("generated_by_ai").default(false).notNull(),
  aiPrompt: text("ai_prompt"), // Original AI prompt if generated
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  streamerIdx: index("streamer_idx").on(table.streamerId),
  uniqueName: index("unique_name").on(table.streamerId, table.name),
}));

export type InsertCustomEmote = typeof customEmotes.$inferInsert;


/**
 * Stream Goals & Challenges - Sub goals and donation goals with progress tracking
 */
export const streamGoals = mysqlTable("stream_goals", {
  id: int("id").autoincrement().primaryKey(),
  streamerId: int("streamer_id").notNull(),
  type: mysqlEnum("type", ["sub_goal", "donation_goal"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(), // e.g., "Road to 100 Subs!"
  description: text("description"), // Challenge description - what streamer will do
  targetValue: int("target_value").notNull(), // Target number (subs or coins)
  currentValue: int("current_value").default(0).notNull(), // Current progress
  isActive: boolean("is_active").default(true).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  // Widget customization
  widgetColor: varchar("widget_color", { length: 7 }).default("#8b5cf6"), // Hex color
  widgetPosition: mysqlEnum("widget_position", ["top_left", "top_right", "bottom_left", "bottom_right"]).default("top_right"),
  showOnStream: boolean("show_on_stream").default(true).notNull(), // Sticky widget visibility
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  streamerIdx: index("streamer_idx").on(table.streamerId),
  activeIdx: index("active_idx").on(table.isActive),
  typeIdx: index("type_idx").on(table.type),
}));

export type InsertStreamGoal = typeof streamGoals.$inferInsert;
export type SelectStreamGoal = typeof streamGoals.$inferSelect;

/**
 * Goal Milestones - Track progress updates and celebrations
 */
export const goalMilestones = mysqlTable("goal_milestones", {
  id: int("id").autoincrement().primaryKey(),
  goalId: int("goal_id").notNull(),
  milestoneValue: int("milestone_value").notNull(), // e.g., 25, 50, 75, 100
  reachedAt: timestamp("reached_at").defaultNow().notNull(),
  celebrationShown: boolean("celebration_shown").default(false).notNull(),
}, (table) => ({
  goalIdx: index("goal_idx").on(table.goalId),
}));

export type InsertGoalMilestone = typeof goalMilestones.$inferInsert;
export type SelectGoalMilestone = typeof goalMilestones.$inferSelect;


/**
 * Clips - User-created 5-60s clips from live streams
 */
export const clips = mysqlTable("clips", {
  id: int("id").autoincrement().primaryKey(),
  streamId: int("stream_id").notNull(),
  creatorId: int("creator_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: int("start_time").notNull(), // seconds from stream start
  endTime: int("end_time").notNull(), // seconds from stream start
  duration: int("duration").notNull(), // seconds (5-60)
  videoUrl: text("video_url").notNull(), // S3 URL for clip video
  thumbnailUrl: text("thumbnail_url"),
  viewCount: int("view_count").default(0).notNull(),
  likeCount: int("like_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  streamIdx: index("stream_idx").on(table.streamId),
  creatorIdx: index("creator_idx").on(table.creatorId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type InsertClip = typeof clips.$inferInsert;
export type SelectClip = typeof clips.$inferSelect;

/**
 * Clip views - tracks who viewed which clips
 */
export const clipViews = mysqlTable("clip_views", {
  id: int("id").autoincrement().primaryKey(),
  clipId: int("clip_id").notNull(),
  userId: int("user_id"),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
}, (table) => ({
  clipIdx: index("clip_idx").on(table.clipId),
  userIdx: index("user_idx").on(table.userId),
}));

export type InsertClipView = typeof clipViews.$inferInsert;

/**
 * Clip likes - tracks who liked which clips
 */
export const clipLikes = mysqlTable("clip_likes", {
  id: int("id").autoincrement().primaryKey(),
  clipId: int("clip_id").notNull(),
  userId: int("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  clipIdx: index("clip_idx").on(table.clipId),
  userIdx: index("user_idx").on(table.userId),
  uniqueLike: index("unique_like").on(table.clipId, table.userId),
}));

export type InsertClipLike = typeof clipLikes.$inferInsert;


/**
 * Alert Customizations - Streamer preferences for follow/sub/donation alerts
 */
export const alertCustomizations = mysqlTable("alert_customizations", {
  id: int("id").autoincrement().primaryKey(),
  streamerId: int("streamer_id").notNull().unique(),
  // Follow alert settings
  followEnabled: boolean("follow_enabled").default(true).notNull(),
  followSoundUrl: text("follow_sound_url"),
  followAnimation: mysqlEnum("follow_animation", ["bounce", "slide", "fade", "confetti", "fireworks"]).default("bounce"),
  followTextTemplate: text("follow_text_template"),
  followDuration: int("follow_duration").default(5).notNull(), // seconds
  // Subscription alert settings
  subEnabled: boolean("sub_enabled").default(true).notNull(),
  subSoundUrl: text("sub_sound_url"),
  subAnimation: mysqlEnum("sub_animation", ["bounce", "slide", "fade", "confetti", "fireworks"]).default("confetti"),
  subTextTemplate: text("sub_text_template"),
  subDuration: int("sub_duration").default(7).notNull(), // seconds
  // Donation alert settings
  donationEnabled: boolean("donation_enabled").default(true).notNull(),
  donationSoundUrl: text("donation_sound_url"),
  donationAnimation: mysqlEnum("donation_animation", ["bounce", "slide", "fade", "confetti", "fireworks"]).default("fireworks"),
  donationTextTemplate: text("donation_text_template"),
  donationDuration: int("donation_duration").default(10).notNull(), // seconds
  // Raid alert settings
  raidEnabled: boolean("raid_enabled").default(true).notNull(),
  raidSoundUrl: text("raid_sound_url"),
  raidAnimation: mysqlEnum("raid_animation", ["bounce", "slide", "fade", "confetti", "fireworks"]).default("slide"),
  raidTextTemplate: text("raid_text_template"),
  raidDuration: int("raid_duration").default(10).notNull(), // seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  streamerIdx: index("streamer_idx").on(table.streamerId),
}));

export type InsertAlertCustomization = typeof alertCustomizations.$inferInsert;
export type SelectAlertCustomization = typeof alertCustomizations.$inferSelect;


/**
 * Multistream Connections - Platform connections for RTMP restreaming
 */
export const multistreamConnections = mysqlTable("multistream_connections", {
  id: int("id").autoincrement().primaryKey(),
  streamerId: int("streamer_id").notNull(),
  platform: mysqlEnum("platform", ["twitch", "kick", "youtube", "facebook"]).notNull(),
  platformUsername: varchar("platform_username", { length: 255 }),
  streamKey: text("stream_key"), // Encrypted RTMP stream key
  ingestUrl: text("ingest_url"), // RTMP ingest URL
  enabled: boolean("enabled").default(true).notNull(),
  isTwitchPartner: boolean("is_twitch_partner").default(false).notNull(), // Blocks Twitch restreaming if true
  lastStreamedAt: timestamp("last_streamed_at"),
  totalStreamHours: int("total_stream_hours").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  streamerIdx: index("streamer_idx").on(table.streamerId),
  platformIdx: index("platform_idx").on(table.platform),
  uniqueConnection: index("unique_connection").on(table.streamerId, table.platform),
}));

export type InsertMultistreamConnection = typeof multistreamConnections.$inferInsert;
export type SelectMultistreamConnection = typeof multistreamConnections.$inferSelect;

/**
 * Multistream Settings - Streamer preferences for multistreaming mode
 */
export const multistreamSettings = mysqlTable("multistream_settings", {
  id: int("id").autoincrement().primaryKey(),
  streamerId: int("streamer_id").notNull().unique(),
  mode: mysqlEnum("mode", ["affiliate", "partner", "exclusive"]).default("affiliate").notNull(),
  // affiliate: Stream to PROUDY + all connected platforms (default)
  // partner: Stream to PROUDY + Kick/YouTube only (respects Twitch Partner exclusivity)
  // exclusive: Stream ONLY to PROUDY (85/15 split, no redistribution)
  autoEnableNewPlatforms: boolean("auto_enable_new_platforms").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  streamerIdx: index("streamer_idx").on(table.streamerId),
}));

export type InsertMultistreamSettings = typeof multistreamSettings.$inferInsert;
export type SelectMultistreamSettings = typeof multistreamSettings.$inferSelect;

/**
 * Stream Analytics Snapshots - Periodic viewer/chat data for charting
 */
export const streamAnalytics = mysqlTable("stream_analytics", {
  id: int("id").autoincrement().primaryKey(),
  streamId: int("stream_id").notNull(),
  streamerId: int("streamer_id").notNull(),
  viewerCount: int("viewer_count").default(0).notNull(),
  chatMessagesPerMin: int("chat_messages_per_min").default(0).notNull(),
  newFollowers: int("new_followers").default(0).notNull(),
  newSubscribers: int("new_subscribers").default(0).notNull(),
  donationAmount: int("donation_amount").default(0).notNull(), // in CZK cents
  snapshotAt: timestamp("snapshot_at").defaultNow().notNull(),
}, (table) => ({
  streamIdx: index("stream_idx").on(table.streamId),
  streamerIdx: index("streamer_idx").on(table.streamerId),
  snapshotAtIdx: index("snapshot_at_idx").on(table.snapshotAt),
}));

export type InsertStreamAnalytics = typeof streamAnalytics.$inferInsert;
export type SelectStreamAnalytics = typeof streamAnalytics.$inferSelect;
