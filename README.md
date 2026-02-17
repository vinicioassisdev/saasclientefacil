<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ClienteSimples - CRM

A SaaS CRM application built with React, Vite, TailwindCSS, and PostgreSQL (Neon/Vercel).

## Features

- **Client Management**: Add, update, delete clients.
- **Sync**: Automatic synchronization with backend database.
- **Reports**: Visual reports and stats.
- **Admin Panel**: User management.

## Prerequisites

- Node.js (v18+)
- PostgreSQL Database (e.g., Neon, Vercel Postgres, Supabase)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root based on correct keys:
   
   ```env
   # Database Connection (PostgreSQL)
   DATABASE_URL="postgres://user:password@host:port/dbname?sslmode=require"
   
   # Security
   SYNC_SECRET="your-super-secret-key-for-sync"
   
   # AI Features
   GEMINI_API_KEY="your-gemini-api-key"
   ```

   Also update `.env.local` if using Vercel local dev.

3. **Initialize Database**
   The application includes a setup endpoint.
   You can trigger it by sending a POST request to `/api/setup` or configured manually.
   
   *Tip: In development, you can access the database directly or use the sync functionality which will attempt to insert data.*

4. **Run Locally**
   ```bash
   npm run dev
   ```

## Deployment on Vercel

1. Push to GitHub.
2. Import project in Vercel.
3. Set the Environment Variables (`DATABASE_URL`, `SYNC_SECRET`, `GEMINI_API_KEY`) in Vercel Project Settings.
4. Deploy.

## Architecture

- **Frontend**: React + Vite + TailwindCSS.
- **Backend**: Vercel Serverless Functions (`api/` folder).
- **Database**: PostgreSQL.
- **Sync**: The `App.tsx` synchronizes local state with the server via `/api/sync`.

## Security Notes

- **Authentication**: Currently uses a basic shared secret (`x-sync-secret`) for sync endpoints.
- **Production**: Ensure `SYNC_SECRET` is strong and kept private.

