# PROUDY.TV - Project TODO

## Phase 1: Database Schema & Core API
- [x] Design database schema for users, streams, chat messages, stream archives
- [x] Add indexes for critical queries (stream lookup, chat history, viewer counts)
- [x] Implement stream key generation and validation
- [x] Create tRPC procedures for stream management
- [x] Add role-based access control (admin, streamer, viewer)

## Phase 2: UI Components & Atari Retro Design
- [x] Set up Atari retro color palette with rainbow accents
- [x] Create custom fonts and retro gaming aesthetic
- [x] Build navigation header with PROUDY logo
- [x] Design stream card components with rainbow borders
- [x] Create loading states and error boundaries
- [x] Implement dark theme with rainbow gradient accents

## Phase 3: Streaming Infrastructure & Video Player
- [ ] Implement HLS/DASH protocol support for adaptive streaming
- [ ] Build video player component with quality selection
- [ ] Add connection monitoring and automatic reconnect
- [ ] Implement stream health checks and fallback mechanisms
- [ ] Create stream detail page with player and info sidebar
- [ ] Add viewer count tracking in real-time

## Phase 4: Real-time Chat with WebSocket & AI Moderator
- [ ] Set up WebSocket server for real-time chat
- [ ] Implement WebSocket fallback for reliability
- [ ] Build chat UI component (Twitch-style, always visible)
- [ ] Integrate LLM for automatic chat moderation
- [ ] Filter toxic content, spam, and inappropriate messages
- [ ] Add chat history persistence to database
- [ ] Implement chat reconnection logic

## Phase 5: Streamer Dashboard & Monitoring
- [ ] Create streamer dashboard with stream key management
- [ ] Display live statistics (viewers, duration, chat activity)
- [ ] Add stream start/stop controls
- [ ] Implement automatic notifications for critical events:
  - [ ] New streamer goes live
  - [ ] Stream exceeds 100 viewers
  - [ ] Technical problems detected
- [ ] Build browse page with live stream grid
- [ ] Add real-time viewer count updates

## Phase 6: Stream Archive & S3 Storage
- [ ] Implement automatic stream recording
- [ ] Save completed streams to S3 cloud storage
- [ ] Create VOD (Video on Demand) playback page
- [ ] Add stream archive browser
- [ ] Implement thumbnail generation for archived streams

## Phase 7: Testing, Optimization & Delivery
- [ ] Write vitest tests for critical paths
- [ ] Test streaming stability under load
- [ ] Verify chat reconnection and fallback
- [ ] Test AI moderator accuracy
- [ ] Optimize database queries with indexes
- [ ] Test error handling and graceful degradation
- [ ] Create checkpoint for deployment
- [ ] Document deployment and usage instructions

## Additional Features (Future)
- [ ] Multistreaming support (RTMP restream to multiple platforms)
- [ ] Merchandise integration
- [ ] Revenue split system (85/15 model)
- [ ] Analytics dashboard for platform owner

## Phase 8: AR Filters, Voice Changer & 3D Avatars
- [ ] Implement Snapchat-style AR face filters using face-api.js or MediaPipe
- [ ] Add filter library (funny faces, animal ears, glasses, effects)
- [ ] Create filter selection UI in streamer dashboard
- [ ] Implement real-time voice changer with Web Audio API
- [ ] Add voice presets (deep voice, chipmunk, robot, echo, etc.)
- [ ] Build 3D avatar system (VTuber style) with face tracking
- [ ] Integrate Ready Player Me or custom 3D avatar models
- [ ] Add avatar customization UI (hair, clothes, accessories)
- [ ] Implement facial expression tracking for avatar animation
- [ ] Allow streamers to switch between camera, filters, and avatar modes

## Phase 9: Background & PIP Layout Customization
- [ ] Implement custom background upload (images/videos)
- [ ] Add green screen/chroma key effect for background removal
- [ ] Create virtual background library (gaming scenes, abstract, etc.)
- [ ] Build PIP (Picture-in-Picture) layout system
- [ ] Add rectangular PIP layout option (classic style)
- [ ] Add circular PIP layout option (modern style)
- [ ] Implement PIP position controls (4 corners, center options)
- [ ] Add PIP size controls (small, medium, large)
- [ ] Allow switching between full camera and screen share with PIP
- [ ] Save layout preferences per streamer


## Homepage Redesign - MadmoQQ Style (User Request)
- [x] Redesign homepage with modern, clean MadmoQQ-inspired layout
- [x] Add animated PROUDY logo (three rainbow streams) with smooth flow
- [x] Implement smooth gradient animations on title
- [x] Add professional button animations with glow effects
- [x] Create modern feature cards with subtle hover effects
- [x] Use clean typography and spacing
- [x] Add smooth scroll animations and transitions


## Advanced Features Implementation (User Request)
- [ ] Install Socket.io for real-time WebSocket communication
- [ ] Implement WebSocket chat server with message broadcasting
- [ ] Add AI moderator using LLM API for toxic content filtering
- [ ] Create chat UI component with Twitch-style layout
- [ ] Add automatic reconnection for chat
- [ ] Install HLS.js or Video.js for adaptive streaming
- [ ] Implement video player component with quality selector
- [ ] Add playback controls and fullscreen support
- [ ] Install face-api.js or MediaPipe for AR face tracking
- [ ] Implement AR filter system with filter library
- [ ] Add Web Audio API voice changer with presets
- [ ] Create filter/voice selection UI in streamer dashboard


## Streaming Infrastructure Implementation (User Request - Priority)
- [ ] Install streaming packages (hls.js, video.js, fluent-ffmpeg)
- [ ] Implement RTMP ingest server for receiving streams from OBS
- [ ] Create HLS transcoding pipeline with adaptive bitrate
- [ ] Build video player component with HLS.js
- [ ] Add stream quality selector (Auto, 1080p, 720p, 480p, 360p)
- [ ] Implement multistreaming to multiple platforms
- [ ] Add stream health monitoring and auto-reconnect
- [ ] Create stream archive system with S3 storage
- [ ] Build streamer dashboard with stream key and controls
- [ ] Add viewer count tracking and real-time updates


## User Messaging & Profile System (New User Request)
- [x] Add messages table to database for DM/inbox functionality
- [x] Add avatarUrl, bio, socialLinks fields to users table
- [x] Create tRPC router for messaging (sendMessage, getConversations, getMessages, markAsRead)
- [x] Create tRPC router for profile management (updateProfile, uploadAvatar)
- [x] Create database functions for messaging
- [x] Create database functions for profile management
- [ ] Build Messages/Inbox page with conversation list
- [ ] Build conversation view with message thread
- [ ] Create Profile page with avatar upload and bio editing
- [ ] Add social links section (Twitter, Instagram, YouTube, etc.)
- [ ] Add Messages link to main navigation
- [ ] Implement real-time message notifications with Socket.io
- [ ] Add unread message counter badge
- [ ] Create user search/autocomplete for starting new conversations


## Stories & For You Page (New User Request - Social Features)
- [x] Add stories table to database (userId, mediaUrl, mediaType, expiresAt, viewCount)
- [x] Add story_views table for tracking who viewed stories
- [x] Create tRPC router for stories (createStory, getStories, viewStory, deleteStory)
- [x] Create database functions for stories
- [x] Add feed_items and feed_interactions tables
- [x] Create tRPC router for For You feed
- [x] Create database functions for personalized feed
- [ ] Build Stories carousel component (Instagram-style horizontal scroll)
- [ ] Implement story viewer with auto-advance and progress bars
- [ ] Add story upload UI (image/video, max 15 seconds)
- [ ] Implement 24-hour auto-expiration for stories
- [ ] Add story viewer list (who viewed your story)
- [ ] Create For You page with personalized content feed
- [ ] Implement recommendation algorithm based on:
  - [ ] User watch history
  - [ ] Followed streamers
  - [ ] Popular streams in user's region (Czech)
  - [ ] Similar content preferences
- [ ] Build infinite scroll feed with stream clips and highlights
- [ ] Add like/share/comment functionality to feed items
- [ ] Implement feed item analytics (views, engagement rate)
- [ ] Add "Not Interested" feedback for algorithm improvement


## Follow/Favorite System with Notifications (New User Request)
- [x] Add follows table to database (followerId, followingId, createdAt)
- [x] Create tRPC router for follows (followUser, unfollowUser, getFollowers, getFollowing, isFollowing)
- [x] Create database functions for follow system
- [ ] Add heart/favorite button to streamer profiles and stream pages
- [ ] Display follower count on streamer profiles
- [ ] Create "Following" page showing all followed streamers
- [ ] Implement real-time notification when followed streamer goes live
- [ ] Add notification preferences (email, push, in-app)
- [ ] Show notification badge in header when followed streamer is live
- [ ] Create notifications dropdown with live streamer alerts
- [ ] Add "Your followed streamers" section on homepage
- [ ] Highlight followed streamers in Browse page
- [ ] Send notification when followed streamer posts new story


## Friendly Komunita (New User Request - Community Features)
- [ ] Add community_posts table for forum/discussion posts
- [ ] Add community_comments table for post comments
- [ ] Add community_groups table for user-created communities
- [ ] Add group_members table for group membership
- [ ] Add community_events table for scheduled events/meetups
- [ ] Create tRPC router for community posts (create, edit, delete, like, report)
- [ ] Create tRPC router for comments (add, edit, delete, like)
- [ ] Create tRPC router for groups (create, join, leave, manage)
- [ ] Create tRPC router for events (create, RSVP, cancel)
- [ ] Build Community page with post feed
- [ ] Build Groups page with group discovery
- [ ] Build Events calendar page
- [ ] Implement AI moderation for community posts and comments
- [ ] Add reputation/karma system for active community members
- [ ] Add badges and achievements for community participation
- [ ] Implement post categories (Discussion, Help, Showcase, Memes, etc.)
- [ ] Add trending posts algorithm
- [ ] Create community guidelines and reporting system


## UI Implementation (Current Task)
- [x] Create Profile page component with avatar upload
- [x] Add bio editing with character counter
- [x] Add social links input fields (Twitter, Instagram, YouTube, TikTok, Discord)
- [x] Implement avatar upload to S3
- [x] Create Messages/Inbox page with conversation list
- [x] Build chat window component for direct messaging
- [x] Add real-time message updates (polling every 2-3 seconds)
- [x] Create For You feed page with infinite scroll
- [x] Build feed item card component
- [x] Implement like/share/not interested interactions
- [x] Add navigation links to new pages in header
- [x] Add routes to App.tsx for /profile/:id, /messages, /feed


## New Features (User Request)
- [x] Create /api/upload-avatar endpoint with S3 storage
- [x] Connect avatar upload to Profile page
- [x] Build Stories carousel component (Instagram-style)
- [x] Add story upload UI
- [x] Implement auto-advance with progress bars
- [x] Add 24h auto-expiration for stories (handled in DB schema)
- [x] Create Community forum page
- [x] Add community posts CRUD
- [x] Add comments system
- [x] Add user-created groups
- [x] Add group membership management
- [x] Add community tRPC routers
- [x] Add community database functions
- [x] Add /community route to App.tsx
- [x] Add AI Powered badge to homepage hero section
- [x] Fix VideoPlayer to support direct MP4 loop playback
- [x] Fix fullscreen with cross-browser support
- [x] Fix Socket.io chat connection and event names


## Monetization System (New User Request)
- [x] Set up Stripe integration with webdev_add_feature
- [x] Create Proudy Coins wallet system (1 coin = 1 Kč)
- [x] Add coins balance to user profile
- [x] Create coin purchase packages (100, 500, 1000, 5000, 10000 coins)
- [x] Database schema for subscriptions (88 coins/month)
- [ ] Create subscription management UI
- [x] Database schema for 12 custom donation tiers (100-10000 coins)
- [ ] Create donation tier configuration for streamers
- [ ] Add video/audio upload for each donation tier (12 slots)
- [ ] Implement real-time donation alerts on stream
- [ ] Create transaction history page
- [x] Add revenue split calculation (85/15) in products.ts
- [ ] Create payout management for streamers
- [ ] Add donation leaderboard


## Watch Points System (New User Request)
- [x] Add watch_points balance to users table
- [x] Create watch_sessions table for tracking watch time
- [x] Create custom_rewards table for streamer-defined rewards
- [x] Add reward_redemptions table for tracking claims
- [x] Create watch_streaks table for consecutive days tracking
- [ ] Implement point accumulation (5 points/min base, 15 points/min with sub)
- [ ] Build watch time tracker with real-time point updates
- [ ] Create rewards management UI for streamers
- [ ] Add rewards redemption UI for viewers
- [ ] Implement streak system (daily/weekly bonuses)
- [ ] Create viewer leaderboard per streamer
- [ ] Add point multiplier logic for subscribers


## Interactive Chat Polls (New User Request)
- [x] Create chat_polls table (question, options, duration, sticky)
- [x] Create poll_votes table (one vote per user)
- [x] Add poll creation UI for streamer/moderators (ChatPoll component)
- [x] Implement sticky poll display in chat (pinned at top)
- [x] Add real-time voting with live results
- [x] Create visual progress bars for poll options
- [x] Add auto-close after time limit (countdown timer)
- [ ] Implement poll results announcement
- [ ] Add poll history/archive


## Custom Emotes System with AI Generator (New User Request)
- [x] Create custom_emotes table (streamer-specific emotes)
- [ ] Add AI emote generator using Manus image generation API
- [ ] Create emote management UI for streamers
- [ ] Implement emote upload (manual + AI generated)
- [x] Add unlock tiers (free vs subscriber-only emotes) in schema
- [x] Build emote picker component for chat (EmotePicker with 30 global + 8 sub emotes)
- [x] Implement emote parsing in chat messages (:emoteName:)
- [ ] Create emote preview/gallery page per streamer
- [ ] Add emote packs/collections
- [ ] Implement emote usage statistics


## Clip Creation System (New User Request)
- [ ] Create clips table (streamId, creatorId, title, startTime, endTime, videoUrl)
- [ ] Add clip_views and clip_likes tables
- [ ] Build clip creation UI with time selector (5-60 seconds)
- [ ] Implement video trimming/extraction
- [ ] Create clip player page with share URL
- [ ] Add clip gallery per streamer
- [ ] Build top clips/trending page
- [ ] Add clip embed support
- [ ] Implement clip moderation tools


## Stream Goals & Challenges (New User Request)
- [ ] Create stream_goals table (streamId, type: sub/donation, targetValue, currentValue, challenge, isActive)
- [ ] Add goal_milestones table for tracking progress updates
- [ ] Create tRPC router for goal management (create, update, getActive, complete)
- [ ] Build sticky goal widget overlay component
- [ ] Add real-time progress updates via Socket.io
- [ ] Create streamer dashboard for goal configuration
- [ ] Add celebration animation when goal is reached
- [ ] Implement goal history/archive page
- [ ] Add customizable widget design (colors, position)


## Chat @Mentions System (New User Request)
- [x] Add mention parsing to chat messages (detect @username)
- [x] Add visual highlight for mentioned users
- [ ] Implement notification sound when user is mentioned
- [ ] Add mention counter badge
- [ ] Create autocomplete dropdown for @mentions
- [ ] Store mentions in database for notification tracking
- [ ] Add "jump to mention" functionality


## AI Virtual Streamers Admin Panel (New)
- [x] Create VirtualStreamers admin page (/admin/virtual-streamers)
- [x] Add 6 personality presets (Friendly, Gamer, Chill, Educational, Comedian, Custom)
- [x] Create/edit/delete virtual streamers
- [x] Go Live/Stop controls with status indicators
- [x] Chat AI settings (enable/disable, response delay)
- [x] TTS settings for virtual streamers
- [x] Lip-sync configuration
- [x] AI model settings (temperature, response length)
- [x] Category selection (Just Chatting, Gaming, Music, IRL, Creative, Education)
- [x] Stats dashboard (total streamers, live count, viewers, personalities)


## Coins Purchase Page (New)
- [x] Create CoinsPage (/coins) with 6 coin packages
- [x] Stripe Checkout integration for coin purchases
- [x] Success/cancel redirect handling
- [x] Feature explanation section


## TTS Highlighted Messages (New User Request)
- [x] Add TTS highlighted message UI in Chat component
- [x] Add payment integration for highlights (50+ coins)
- [x] Implement TTS queue system with Web Speech API
- [x] Add Czech voice selection (multiple voices)
- [x] Create TTS playback with speechSynthesis API
- [x] Add visual highlight styling in chat (golden glow effect)
- [x] Implement volume control for TTS
- [ ] Add highlight duration settings
- [ ] Create streamer dashboard for TTS settings


## Gift Subscriptions (New User Request)
- [ ] Add gift_subscriptions table to database
- [ ] Add payment flow for gift subs (88 coins)
- [ ] Create gift sub UI modal (select recipient or random)
- [ ] Implement chat announcement for gift subs
- [ ] Add celebration animation (confetti effect)
- [ ] Create gift history tracking
- [ ] Add top gifters leaderboard per streamer
- [ ] Implement mass gifting (5, 10, 20 subs at once)
- [ ] Add notification to recipient when they receive gift sub


## Custom Animated Emotes Update (User Request - Replace Emoji Picker)
- [ ] Remove emoji-picker-react dependency
- [ ] Create custom emote picker component (Twitch-style)
- [ ] Add support for animated GIF/APNG emotes
- [ ] Implement global PROUDY platform emotes
- [ ] Add streamer-specific emote slots
- [ ] Create emote upload UI for streamers
- [ ] Integrate AI emote generator (text-to-image)
- [ ] Add subscriber-only emote tiers
- [ ] Implement emote autocomplete in chat (:emotename:)
- [ ] Add emote preview on hover
- [ ] Create emote management dashboard for streamers


## Phase: Custom Animated Emotes, TTS, AI Virtual Streamers
- [ ] Replace emoji-picker-react with custom emote picker (Twitch-style)
- [ ] Create EmotePicker component with categories (Global, Streamer, Sub-only)
- [ ] Add animated emote support (CSS animations for bounce, shake, spin)
- [ ] Implement emote rendering in chat messages (:emoteName:)
- [ ] Add AI emote generator endpoint using image generation API
- [ ] Create emote management UI for streamers
- [ ] Build TTS Highlighted Messages modal (50+ coins)
- [ ] Add Czech voice selection for streamers (Web Speech API)
- [ ] Implement TTS queue and playback system
- [ ] Create visual highlight styling for paid messages
- [ ] Build AI Virtual Streamers admin panel
- [ ] Add virtual stream creation form (name, video, personality)
- [ ] Implement AI chat responder using LLM
- [ ] Add looping video stream management


## AI Emote Generator (Completed)
- [x] Add tRPC mutation for AI emote generation (emotes.generateWithAI)
- [x] Integrate generateImage() from server/_core/imageGeneration.ts
- [x] Upload generated emote to S3 storage
- [x] Save emote metadata to custom_emotes table
- [x] Create EmoteGenerator UI component with prompt input
- [x] Build EmoteManagement page for streamers (/dashboard/emotes)
- [x] Add emote preview gallery
- [x] Implement emote enable/disable toggle
- [x] Add emote delete functionality
- [x] Write vitest tests for emote generation flow (21 tests passing)


## Urgent Fixes (Completed)
- [x] Fix fullscreen button not responding in VideoPlayer (event propagation issue)

- [x] Change revenue split from 85/15 to 80/20 (80% streamer, 20% platform)
