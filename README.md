# PESU – Realtime Chat Application

> **PESU** means "Talking" — A modern, WhatsApp-inspired real-time chat application.

## ✨ Features

- 🔐 **Authentication** – Email/password signup & login via Supabase Auth
- 💬 **Private Chat** – One-to-one messaging with auto-created conversations
- ⚡ **Realtime** – Instant message delivery via Supabase Realtime
- 🟢 **Online Status** – Live presence tracking with "last seen" timestamps
- ✔ **Message Status** – Sent (✔), Delivered (✔✔), Read (✔✔ blue)
- ✍ **Typing Indicator** – Real-time "typing..." with auto-hide
- 📎 **Media Sharing** – Images, PDFs, and voice messages
- 🎤 **Voice Messages** – Record and send using MediaRecorder API
- 🔔 **Unread Badges** – Per-conversation unread message count
- 🗑 **Delete Messages** – Delete for me / Delete for everyone (5 min limit)
- 📱 **Mobile Responsive** – Full mobile support with sidebar toggle

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS, ShadCN UI |
| Backend | Supabase (Auth, Database, Realtime, Storage) |
| Deployment | Vercel |

## 🚀 Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd pesu-app
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon/public key** from Settings → API

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Migration

1. Open the **SQL Editor** in your Supabase dashboard
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

This creates all tables, RLS policies, triggers, and the storage bucket.

### 5. Enable Realtime

In Supabase Dashboard → Database → Replication, ensure the `messages` and `user_status` tables have Realtime enabled.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
src/
├── app/
│   ├── chat/page.tsx        # Main chat page (two-column layout)
│   ├── login/page.tsx       # Login page
│   ├── signup/page.tsx      # Signup page
│   ├── layout.tsx           # Root layout with AuthProvider
│   ├── page.tsx             # Home redirect
│   └── globals.css          # Global styles
├── components/
│   ├── chat/
│   │   ├── Sidebar.tsx      # Conversation list & user search
│   │   ├── ChatArea.tsx     # Message area with header
│   │   ├── MessageBubble.tsx # Individual message display
│   │   ├── MessageInput.tsx  # Input bar with attachments
│   │   ├── VoiceRecorder.tsx # Voice recording component
│   │   └── VoiceMessage.tsx  # Voice playback component
│   └── ui/                  # ShadCN UI components
├── contexts/
│   └── AuthContext.tsx      # Authentication provider
├── hooks/
│   ├── useMessages.ts       # Message fetching & realtime
│   ├── useConversations.ts  # Conversation management
│   ├── usePresence.ts       # Online/offline tracking
│   ├── useTyping.ts         # Typing indicator
│   └── useUserStatus.ts     # User status tracking
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── types.ts             # TypeScript interfaces
│   ├── storage.ts           # File upload utilities
│   └── message-actions.ts   # Delete & mark-as-read
└── middleware.ts            # Route middleware
```

## 🚀 Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

## 📜 License

MIT
