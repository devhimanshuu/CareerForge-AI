# Resumify — AI-Powered Resume Builder

> Build stunning, ATS-optimized resumes in minutes with AI.

## 🚀 Features

- 🤖 **AI-Powered Content** — Generate professional summaries and bullet points with Groq AI
- 🔐 **Secure Authentication** — Powered by Clerk (Google, GitHub, Email)
- ✏️ **Real-Time Editor** — Live preview as you type
- 🎨 **Custom Theme Colors** — Personalize your resume's look
- 📄 **PDF Export** — Download high-quality PDFs
- 🔗 **Shareable Links** — Share resumes with a unique URL
- 🌓 **Dark Mode** — Beautiful light and dark themes
- 📱 **Responsive** — Works on all devices
- 🗑️ **Trash & Restore** — Safely archive and recover resumes

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Clerk
- **AI**: Groq (Llama 3.3 70B)
- **Database**: Vercel Postgres + Drizzle ORM
- **API**: Hono + Tanstack React Query
- **Styling**: Tailwind CSS + Shadcn UI
- **PDF**: jsPDF + html2canvas

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Push database schema
npm run db:push

# Start development server
npm run dev
```

## 🔐 Environment Variables

```env
DATABASE_URL=your_postgres_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
GROQ_API_KEY=your_groq_key
NEXT_PUBLIC_GROQ_API_KEY=your_groq_key
```

## 📁 Project Structure

```
├── app/
│   ├── (home)/          # Authenticated routes
│   ├── (landingPage)/   # Public landing page
│   ├── (public)/        # Public resume views
│   └── api/             # API routes (Hono)
├── components/          # Shared UI components
├── db/                  # Database schema & config
├── features/            # Feature-specific hooks
├── lib/                 # Utilities & AI model
└── types/               # TypeScript types
```

## 📄 License

MIT © Resumify
