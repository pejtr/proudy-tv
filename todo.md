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
