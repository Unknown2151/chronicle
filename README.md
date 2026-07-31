# Chronicle

Chronicle is a full-stack, synchronized reading platform designed for book clubs and social readers. It introduces a unique **"Spoiler Gate"** architecture that allows readers to progress at different paces without ruining the story for one another. Members read in scheduled "chunks," and community discussions are strictly locked until a reader marks a specific chunk as complete.

---

## ✨ Features (v1.0)

- **Spoiler-Gated Discussions:** Zero-trust architecture ensures readers cannot access chapter discussions via the UI or direct API requests until they explicitly record their reading progress.
- **Role-Based Workspaces:** "Rooms" are managed by Admins who dictate the reading schedule, chunk breakdowns, and member lists, while Readers participate in discussions.
- **The Vault:** A private, isolated storage system where users can save personal quotes, notes, and annotations without sharing them publicly.
- **Magic Link Authentication:** Passwordless, secure email login powered by Auth.js and Resend.
- **High-Performance Caching:** Read-heavy database queries are cached at the edge, while rate limiting prevents API abuse using Upstash Redis.
- **Real-Time Error Monitoring:** Integrated Sentry monitoring tracks unauthorized access attempts (Spoiler Gate breaches) and application crashes.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router), React, TypeScript |
| **Database** | PostgreSQL (Supabase), Prisma ORM |
| **Authentication** | Auth.js (NextAuth), Resend |
| **Caching & Rate Limiting** | Upstash Redis |
| **Monitoring** | Sentry |
| **Styling** | Tailwind CSS |
| **Deployment** | Vercel |

---

# 🚀 Getting Started

## Prerequisites

Before running the project, make sure you have:

- Node.js (v18+)
- Git
- A Supabase project
- An Upstash Redis database
- A Resend account

---

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/chronicle.git
cd chronicle
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Database Setup

Generate the Prisma client and apply migrations.

```bash
npx prisma generate
npx prisma migrate deploy
```

---

## 4. Run the Development Server

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

# 🚢 Deployment

This project is configured for deployment on **Vercel**.

A `vercel.json` file should contain:

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

Make sure all required environment variables are configured in your deployment platform before deploying.

---

# 🗺️ Roadmap

## v1.1 — The Discovery Loop

### 📖 Open Library Integration

Automatically populate:

- Book cover
- Author
- Page count
- Publication details

when creating a room.

### 🌍 Public Room Discovery

A `/discover` dashboard where users can browse and join public reading rooms.

### 🔗 Invite Links

JWT-backed invite URLs allowing users to join rooms without manual admin invitations.

---

## v1.2 — Engagement & Stats

### 🗳️ Discussion Polls

Admin-created polls attached to reading chunks.

Example:

> **Who was guiltier: Victor or the Creature?**

### 📊 Reading Wrapped

Personalized yearly statistics including:

- Books completed
- Reading streaks
- Discussion posts
- Favorite genres
- Reading partners

---

# 👨‍💻 Author

Built with by **Sushminthiran**