# AmpFlow

## Overview

AmpFlow is an automated content distribution platform for content creators. It monitors YouTube channels for new video uploads and automatically distributes announcements to connected community platforms (Discord, Telegram, Whop). The system uses YouTube's PubSubHubbub (PuSH) webhook mechanism for real-time video notifications and enables creators to customize message templates with dynamic video information.

**Core Functionality:**
- YouTube channel monitoring via PuSH webhooks
- Multi-platform distribution (Discord, Telegram, Whop)
- Customizable message templates with video placeholders
- User authentication and connection management
- Automation workflow configuration

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
**Framework:** Next.js 15 with App Router and React 19
- **Styling:** Tailwind CSS with dark theme (blue/purple color scheme)
- **State Management:** React hooks with local component state
- **Authentication:** Client-side auth guards using Appwrite Account SDK
- **Key Pages:**
  - `/login` - Email/password authentication
  - `/` (Dashboard) - Platform connection management
  - `/automations` - Automation workflow configuration
  - `/settings` - User settings (planned)

**Design Pattern:** Server-side rendering disabled for client-heavy interactivity; all pages use 'use client' directive for client-side data fetching and state management.

### Backend Architecture
**BaaS Platform:** Appwrite Cloud (Backend-as-a-Service)
- **Authentication:** Appwrite Account service with email/password sessions
- **Database:** Appwrite Databases with document-based storage
- **Serverless Functions:** Appwrite Functions (Node.js runtime) for webhook handling and message distribution

**Data Models (Collections):**

1. **connections** - Stores platform integration credentials
   - User-scoped permissions (read/write per userId)
   - Encrypted storage for tokens (accessToken, refreshToken, botToken)
   - Supports: YouTube, Discord, Telegram, Whop

2. **automations** - Defines distribution workflows
   - Links YouTube source to target platforms
   - Stores message templates with placeholder support
   - Boolean toggle for active/inactive state

3. **youtubeSubscriptions** - Manages PuSH webhook subscriptions
   - Function-only access (no user permissions for security)
   - Stores userId, youtubeChannelId, and youtubeConnectionId for proper automation scoping
   - Tracks subscription status and expiry
   - Stores encrypted webhook verification secrets (hubSecret)

### Webhook & Distribution Flow

**Architecture Decision:** Real-time video detection using YouTube PubSubHubbub instead of polling
- **Rationale:** Reduces API quota usage, provides instant notifications, scalable
- **Tradeoff:** Requires public webhook endpoint and subscription management

**Flow:**
1. User connects YouTube channel → `subscribeToYouTube` function triggered
2. Function subscribes to PuSH hub with secure callback URL
3. YouTube verifies subscription via GET request to `youtubeWebhook`
4. New video published → YouTube sends XML notification to webhook
5. Webhook validates HMAC signature, extracts video details
6. Triggers `distributeMessage` function with automation config
7. Message distributed to all active target platforms

**Security Measures:**
- Required HMAC SHA1 signature verification on all webhook payloads (fails with 403 if missing/invalid)
- Encrypted token storage in Appwrite Database
- User-scoped database permissions on connections and automations
- Function-only access to youtubeSubscriptions (prevents public exposure of hubSecret)
- Automation scoping by userId and youtubeConnectionId prevents cross-tenant leakage
- API key authentication for function-to-function calls

### Message Distribution System

**Platform Integrations:**

- **Discord:** Bot token authentication, direct channel posting via Discord API v10
- **Telegram:** Bot API for message sending
- **Whop:** Placeholder API integration (community endpoint)

**Template System:**
- Placeholder replacement: `{{video_title}}`, `{{video_url}}`, `{{video_id}}`
- Per-automation customization
- Runtime template processing in distributeMessage function

**Error Handling:**
- Per-platform delivery status tracking
- Retry logic for failed distributions (planned)
- Comprehensive logging for debugging

## External Dependencies

### Backend Services
- **Appwrite Cloud** - Primary BaaS platform
  - Account service (authentication)
  - Databases service (data storage)
  - Functions service (serverless compute)
  - Required environment variables: `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, collection IDs

### Third-Party APIs
- **YouTube PubSubHubbub Hub** (`https://pubsubhubbub.appspot.com`) - Webhook subscription service
- **Discord API v10** (`https://discord.com/api/v10`) - Bot message posting
- **Telegram Bot API** - Message distribution (implementation pending)
- **Whop API** - Community announcements (integration pending)

### Platform Integration Requirements
- **Discord:** Bot token with channel message permissions
- **Telegram:** Bot token from BotFather
- **YouTube:** Channel ID for RSS feed subscription
- **Whop:** API credentials (specific endpoints TBD)

### NPM Dependencies
- `appwrite` (^21.1.0) - Appwrite Web SDK
- `axios` (^1.12.2) - HTTP client for external API calls
- `xml2js` (^0.6.2) - YouTube XML feed parsing
- `node-appwrite` (^13.0.0) - Appwrite Functions SDK (for serverless functions)
- `next` (^15.5.4) - React framework
- `tailwindcss` (^3.4.18) - Styling framework
- `react` (^19.2.0) - UI library
- `typescript` (^5.9.3) - Type safety

### Deployment Infrastructure
- **Frontend Hosting:** Vercel (configured via vercel.json)
- **Functions Runtime:** Appwrite Cloud (Node.js)
- **Database:** Appwrite Cloud (managed document store)