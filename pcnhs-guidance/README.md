# 🎓 PCNHS Guidance Office & Student Profiling System

> Palayan City National High School — Guidance Office Management System  
> Built for **Sir Mico** (Guidance Counselor Admin)

## 🚀 Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Icons:** Lucide React
- **PDF/Print:** Native browser print with styled templates

## 📦 Features (Option A — Core MVP)

| Feature | Description |
|---------|------------|
| 🔐 **Admin Login** | Single Supabase Auth login for guidance counselor |
| 📊 **Dashboard** | Metric cards, recent incidents & sessions overview |
| 👨‍🎓 **Student Directory** | Full CRUD with search, filter by grade, pagination |
| ⚠️ **Incident Logs** | Log behavioral/academic incidents, update case status |
| 🔒 **Counseling Vault** | Confidential session notes with reveal/hide toggle |
| 📄 **Call Slips** | Printable "Guidance Chat Invitation" generator |

## 🛠️ Setup Instructions

### 1. Clone & Install
```bash
cd pcnhs-guidance
npm install
```

### 2. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `../supabase-schema.sql`
3. Copy your project URL and Anon Key from **Settings > API**

### 3. Configure Environment
```bash
# Edit .env.local with your actual credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Create Admin User
In Supabase Dashboard:
1. Go to **Authentication > Users**
2. Click **Add User** > create with email/password
3. The trigger function will auto-create a profile with `guidance_admin` role

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure
```
pcnhs-guidance/
├── src/
│   ├── app/
│   │   ├── login/              # Auth login page
│   │   ├── auth/callback/      # OAuth callback route
│   │   ├── dashboard/
│   │   │   ├── layout.tsx      # Sidebar + top bar
│   │   │   ├── page.tsx        # Dashboard overview
│   │   │   ├── students/       # Student Directory CRUD
│   │   │   ├── incidents/      # Incident Logs
│   │   │   ├── counseling/     # Counseling Vault
│   │   │   └── call-slips/     # Printable Call Slips
│   │   ├── globals.css         # Design system
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Redirect to /login
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser Supabase client
│   │   │   ├── server.ts       # Server Supabase client
│   │   │   └── middleware.ts   # Session middleware helper
│   │   └── types.ts            # TypeScript type definitions
│   └── middleware.ts           # Auth route protection
├── supabase-schema.sql         # Database migration script
└── .env.local                  # Environment variables
```

## 🎨 Design System
- **Colors:** Slate / Sky / Emerald palette (DepEd-appropriate)
- **Typography:** Inter (Google Fonts)
- **Components:** Cards, metric cards, modals, tables, status badges, buttons
- **Responsive:** Desktop & tablet optimized

## 🔮 Upgrade Path
The database schema is pre-wired for:
- **Option B (₱40K):** Batch CSV import, analytics charts, teacher referral portal
- **Full Suite (₱50K):** AI risk scoring, SMS notifications, export reports

---
*Built with ❤️ for PCNHS Guidance Office*
