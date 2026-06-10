# 📄 CareerForge AI: The Ultimate AI-Powered Career Suite

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk)
![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=for-the-badge&logo=groq)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel)

CareerForge AI is a cutting-edge, comprehensive, AI-driven career management suite designed for modern professionals. It helps job seekers construct ATS-optimized resumes, track applications, prepare for interviews, and get strategic market suggestions. Powered by highly optimized AI LLM agents, CareerForge AI bridges the gap between candidates and recruiters.

---

## 🌟 Comprehensive Feature Tour

### 1. 🤖 Agentic AI Career Engine *(NEW)*
A fleet of six specialized AI agents working in concert to automate your entire job search pipeline:

| Agent | Powered By | Description |
|-------|-----------|-------------|
| **ATS Resume Optimizer** | LangChain + NVIDIA Kimi K2.6 + Groq Llama 3.3 70B | Analyzes job descriptions against your resume. Generates tailored bullet points, identifies keyword gaps, and boosts ATS match scores with structured Zod schema output. |
| **Auto-Apply Agent** | LangChain + Groq | One-click application package generation. Produces tailored cover letters, STAR-method interview answers, and rewrites every bullet point to match JD keywords. |
| **Job Scraper Agent** | Puppeteer (Headless Chromium) | Bypasses WAF protections across LinkedIn, Indeed, and Glassdoor. Rotates user-agents and viewports to extract clean job details including hidden salary ranges. |
| **Networking Agent** | LangChain + Groq | Generates contextual follow-ups, thank-you notes, recruiter connection requests, and negotiation scripts tailored to your application stage (applied/interviewing/offer/rejected). |
| **Interview Coach Agent** | WebRTC + ElevenLabs + AudioContext API | Live WebRTC interview simulator with HD camera, real-time speech detection via AnalyserNode, and ElevenLabs voice-synthesized recruiter questions. |
| **Web Research Agent** | Tavily Search API | Researches companies, industry trends, and salary benchmarks in real-time. Enriches your application context with up-to-date market intelligence. |

*All agents share context through a unified pipeline — resume data flows seamlessly from optimization → application → networking → interview prep.*

### 2. 🤖 AI Career Coach & Market Insights Agent
A live, interactive command-center agent built directly into the main workspace.

- **Resume Selector Dropdown**: Analyzes any active resume selected by the user, immediately refreshing insights.
- **Live Market Standout Score**: A visual circular gauge (0-100%) indicating how well the selected resume aligns with current hiring demands and tracked pipelines.
- **Detailed Gaps & Strengths Diagnostic**: Extracts 3 standout strengths and flags 3 critical gaps (experience/skills mismatch) in a premium responsive modal.
- **Strategic Action Items**: Provides 3 highly actionable next steps for the user's career search.
- **Salary & Region Insights**: Evaluates expected average salary ranges (e.g. `$110k - $145k`) and hiring velocity for target roles.

---

### 3. ✨ Magic AI Suite
A collection of futuristic career-optimization tools located inside the editor workspace:

- **🧠 Mind-Reader**: Simulates recruiter eye-tracking patterns. It analyzes resume typography and structure to output a heatmap of candidate highlights that will attract senior recruiters.
- **🛡️ Liar Detector**: Audits candidate credentials for temporal gaps, inconsistencies, and exaggerated achievements, helping users build a highly credible, verifiable history.
- **⏳ Time-Traveler**: Projects the user's professional trajectory forward to 2030, showing how current roles will evolve and suggesting future skills to master.
- **🎙️ Podcast Resume**: Leverages ElevenLabs Text-to-Speech and AI dialog synthesis to transform the resume into a high-impact, 2-minute audio podcast-style conversation between a professional host and the candidate.
- **🔥 Resume Roast**: Provides brutally honest, humorous, and constructive critiques to purge corporate jargon and list clear, metric-based achievements.
- **💻 Hacker Mode**: A terminal-style CLI editor designed for power users who prefer keyboard shortcuts, commands, and markdown-like control to edit their resume.

---

### 4. 🧠 Advanced AI Generation & Autocomplete

- **NVIDIA NIM & Groq Integrations**: Generates professional summaries, educational highlights, and experience bullet points using high-velocity LLM APIs. Primary model: NVIDIA Kimi K2.6 with automatic fallback to Groq Llama 3.3 70B.
- **LangChain Orchestration**: Centralized model configuration (`lib/langchain/config.ts`) with structured output support via Zod schemas, automatic fallback chains, and temperature calibration at 0.4 for consistent, professional results.
- **Tailored Tone & Keywords**: Injects relevant key phrases specific to the selected industry or job role.
- **ATS Optimization**: Scores your bullet points against top Applicant Tracking Systems (ATS) algorithms.
- **Structured Output**: All AI responses are validated against Zod schemas ensuring type-safe, predictable outputs for resume data, cover letters, interview answers, and networking messages.

---

### 5. 💼 Kanban Job Tracker

A fully integrated, drag-and-drop Kanban board for job applications.

- **Pipeline Management**: Categorize applications into stages: *Applied, Shortlisted, Interviewing, Offer, Rejected*.
- **Interactive Analytics**: Tracks your interview-to-offer conversion rate and renders dynamic success metrics on the main dashboard.
- **Resume Mapping**: Associates specific resume versions with each job tracker entry to keep document customization organized.

---

### 6. ✉️ AI Cover Letter Generator

- **Contextual Crafting**: Reads the personal information, experience, and skills from the active resume to compile highly tailored letters.
- **Job Specific Alignment**: Simply paste the target job description, and the AI will draft a compelling cover letter highlighting the exact experiences that match the role.

---

### 7. 🎯 Skill Gap Analyzer

- **Missing Skills Audits**: Scans the user's active resume against modern profiles for their target role.
- **Course Recommendations**: Identifies specific missing skills and suggests concrete courses, certifications, or projects to bridge the gaps.

---

### 8. 🎙️ AI Interview Coach

- **Behavioral & Technical Questions**: Generates mock questions tailored specifically to the candidate's experience and target job.
- **Performance Metrics & Feedback**: Analyzes candidate responses, rating answer completeness, relevance, and communication tone.
- **WebRTC Live Mode**: Real-time camera feed with silence detection and ElevenLabs-synthesized recruiter voice questions.

---

### 9. 🎨 Custom Layout Builder & Customizer

- **Premium Visual Styles**: Control background cards, borders, glassmorphism layers, and responsive typography using font families like Inter, Outfit, Open Sans, Roboto Mono, and Lora.
- **Drag-and-Drop Reordering**: Rearrange sections (Education, Experience, Projects, Skills) on the fly.
- **Live Preview Canvas**: Renders real-time document updates. What you see is exactly what gets built.
- **Secure Public Links**: Generate shareable URLs (`/p/[documentId]`) for recruiters to view a responsive, web-based version of your portfolio, secured by cryptographically hashed `pdfSecret` tokens.

---

### 10. 🌐 Premium Landing Page *(NEW)*

- **Floating Glassmorphism Navbar**: Transforms from a full-width glass bar to a centered floating pill (1100px max-width) on scroll with smooth `cubic-bezier(0.22, 0.61, 0.36, 1)` animation over 700ms.
- **Mobile Hamburger Menu**: Frosted glass overlay with matching glassmorphism nav items, theme toggle, and authentication buttons.
- **Animated Hero Section**: Typewriter text cycling through "Resumes", "Interviews", "Cover Letters", "Job Hunt" with falling pattern background and animated blobs.
- **Animated Counters**: Live-counting statistics (10,000+ resumes, 95% ATS pass rate, 500+ jobs landed, 4.9 rating).
- **Interactive Feature Showcase**: Tabbed demo interface with circular score gauges, podcast transcript players, and mock interview WebRTC previews.
- **Cybernetic Bento Grid**: Premium features grid with hover effects.
- **Testimonial Marquee**: Auto-scrolling testimonial carousel.
- **Pricing Section**: Three-tier pricing (Starter/Pro/Executive) with monthly/yearly toggle, glassmorphism cards, and popular badge highlight.
- **FAQ Accordion**: Expandable sections with smooth height transitions.
- **Agentic AI Section**: Six-card grid showcasing each AI agent with tech badges, hover glow effects, and gradient icon containers.
- **Legal Pages**: Privacy Policy, Terms of Service, and Cookie Policy — authentic SaaS-grade content covering GDPR, CCPA, AI disclaimers, and detailed cookie tables.

---

## 🏗️ Architecture & Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.2 | React framework with App Router, Server Components, and API routes |
| **React** | 18.x | UI component library |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 3.4 | Utility-first CSS framework with custom design tokens |
| **Framer Motion** | Latest | Animations and micro-interactions |
| **Shadcn/ui** | Latest | Accessible, customizable UI primitives (Button, Dialog, Select, DropdownMenu, etc.) |
| **TanStack React Query** | v5 | Server state management, caching, and async data fetching |
| **Lucide React** | Latest | Consistent icon library |

### Authentication & Security
| Technology | Purpose |
|-----------|---------|
| **Clerk** | Full authentication suite — sign in, sign up, session management, MFA support, organization management. Clerk middleware protects all non-public routes. |
| **Middleware** (`middleware.ts`) | Route-level auth protection using `clerkMiddleware`. Public routes: `/`, `/sign-in`, `/sign-up`, `/api/*`, `/p/*`, `/privacy`, `/terms`, `/cookies` |
| **pdfSecret** | Cryptographically hashed token (`createHash('sha256')`) derived from the app secret key for secure PDF generation access |

### AI & Machine Learning
| Technology | Purpose |
|-----------|---------|
| **LangChain** | AI orchestration framework — centralized model config (`lib/langchain/config.ts`), structured output via Zod schemas, prompt templates, resume extraction chains |
| **NVIDIA NIM** (Kimi K2.6) | Primary LLM via OpenAI-compatible endpoint at `integrate.api.nvidia.com/v1` |
| **Groq** (Llama 3.3 70B) | Secondary/fallback LLM for high-speed inference. Used directly when NVIDIA key is unavailable or as automatic fallback |
| **ElevenLabs** | Voice synthesis for AI podcast resume generation and mock interview recruiter questions |
| **Zod** | Schema validation for all structured LLM outputs — ensures type-safe application packages, networking messages, and resume data |
| **Tavily Search API** | Real-time web search for company research, salary benchmarks, and industry trends |

### Web Scraping
| Technology | Purpose |
|-----------|---------|
| **Puppeteer** | Headless Chromium for job scraping across LinkedIn, Indeed, and Glassdoor |
| **User-Agent Rotation** | Four rotating browser UAs (Chrome 122-124, Firefox 125) |
| **Viewport Rotation** | Four viewport dimensions (1920x1080, 1366x768, 1440x900, 1536x864) |
| **WAF Bypass** | Custom browser headers and network delay strategies to emulate authentic requests |

### Database & ORM
| Technology | Purpose |
|-----------|---------|
| **Neon DB** | Serverless PostgreSQL with connection pooling, IP allowlisting, and automated backups |
| **Drizzle ORM** | Type-safe SQL query builder and schema management. Migrations in `drizzle/` directory |
| **Drizzle Kit** | Schema generation and migration tooling |

### Backend & API
| Technology | Purpose |
|-----------|---------|
| **Hono** | Lightweight, ultrafast web framework for Next.js API routes with full RPC type safety (`lib/hono-rpc.ts`) |
| **Next.js API Routes** | Serverless API endpoints under `app/api/` |
| **Vercel** | Hosting, edge network deployment, DDoS protection, WAF rules, automatic SSL |

### Real-Time Communication
| Technology | Purpose |
|-----------|---------|
| **WebRTC** | Peer-to-peer video/audio for live mock interviews with HD camera capture |
| **AudioContext API** | Browser-native audio analysis — AnalyserNode for real-time speech detection and silence monitoring |
| **MediaRecorder API** | Session recording for interview playback and self-review |
| **Liveblocks** | Real-time collaborative editing for multi-user document sessions |

### Analytics & Monitoring
| Technology | Purpose |
|-----------|---------|
| **PostHog** | Product analytics — feature adoption, session recordings, interaction patterns (pseudonymized) |
| **Vercel Analytics** | Performance monitoring — Core Web Vitals, page load times, API latency |
| **Custom Analytics** (`lib/analytics.ts`) | Visitor hashing with SHA-256 (`ip:userAgent:salt`), geo lookup, device detection, referrer tracking |

### Styling & Design System
| Feature | Details |
|---------|---------|
| **CSS Variables** | Full design token system in `globals.css` — `--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, `--ring`, etc. |
| **Dark Mode** | Class-based dark mode via `next-themes` with complete dark variants for all components |
| **Glassmorphism** | Multiple glass tiers: `.glass` (base), `.glass-flat` (navbar top), `.glass-premium` (navbar scrolled), `.glass-flat-header`, `.glass-premium-header`, `.glass-mobile-menu` |
| **Animations** | Custom keyframes: `gradient-shift`, `float`, `pulse-glow`, `shimmer`, `fade-up`, `scale-in`, `subtle-drift`, `marquee-left/right`, `slide-in-left/right`, `glow-pulse`, `gradient-x` |
| **Fonts** | Inter (body), Outfit (display), Plus Jakarta Sans (alt), Open Sans, Roboto Mono (code), Lora (serif) |
| **Responsive Breakpoints** | `xs` (400px), `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px), `3xl` (1920px), `4xl` (2560px) |

### Additional Integrations
| Technology | Purpose |
|-----------|---------|
| **GitHub API** (`lib/github-client.ts`) | Repository and contribution data fetching |
| **html2canvas + jsPDF** | Client-side PDF generation from live preview canvas |
| **react-resizable-panels** | Resizable layout panels in the editor workspace |

---

## 📂 Project Directory Breakdown

```text
├── app/                        # Next.js 14 App Router workspace
│   ├── (auth)/                 # SignIn/SignUp authentication layouts
│   ├── (home)/                 # Main Application Workspace
│   │   ├── dashboard/          # Analytics hub, Document selector, Applications Timeline
│   │   ├── _components/        # Dashboard cards, Dialog triggers, sidebar components
│   │   └── layout.tsx          # Navbars and Mobile Customizer wrappers
│   ├── (landingPage)/          # Marketing/pricing landing page
│   │   ├── page.tsx            # Main landing page with all sections
│   │   ├── layout.tsx          # Landing layout with Header + Clerk auth check
│   │   ├── privacy/            # Privacy Policy page
│   │   ├── terms/              # Terms of Service page
│   │   └── cookies/            # Cookie Policy page
│   ├── (public)/               # Recruiter public links and preview canvases
│   │   └── preview/[documentId]/
│   ├── api/                    # Hono RPC server backend (document CRUD, AI endpoints)
│   ├── fonts/                  # Custom font files
│   ├── p/                      # Public resume sharing routes
│   ├── globals.css             # Global styles, design tokens, animations, glassmorphism
│   └── layout.tsx              # Root layout with Clerk, Theme, Query providers
├── components/                 # Shared React Components
│   ├── audio/                  # Podcast audio player components
│   ├── collaboration/          # Liveblocks real-time collaboration UI
│   ├── editor/                 # Resume editor components (rich text, drag-drop)
│   ├── interview/              # Mock interview WebRTC components
│   ├── landing/                # Landing page section components
│   ├── nav-bar/                # Navigation bar component
│   ├── notifications/          # Toast and notification components
│   ├── portfolio/              # Portfolio display components
│   ├── preview/                # Interactive Resume Templates & Theme renderers
│   ├── skeleton-loader/        # Loading skeleton components
│   └── ui/                     # Shadcn base primitives (Button, Dialog, header-2, FallingPattern, CyberneticBentoGrid, TypewriterText, AnimatedCounter, TestimonialMarquee, MenuToggleIcon, ThemeToggle, etc.)
├── constant/                   # Constant values
│   └── colors.ts               # Resume theme color definitions
├── context/                    # React context providers
│   ├── query-provider.tsx      # TanStack Query client provider
│   ├── resume-info-provider.tsx # Resume editing state context
│   └── theme-provider.tsx      # next-themes provider (light/dark/system)
├── db/                         # Database queries and schema definitions
│   ├── index.ts                # Drizzle database client initialization
│   └── schema/                 # Drizzle schemas
├── drizzle/                    # Drizzle migration files (0000-0005)
├── features/                   # Heavyweight CRUD hooks and logic layers
│   └── document/               # TanStack query hooks for resume CRUD
├── hooks/                      # Global Custom React hooks
│   ├── use-debounce.ts
│   ├── use-origin.ts
│   └── use-toast.ts
├── lib/                        # Core library modules
│   ├── analytics.ts            # Visitor tracking, geo lookup, device detection
│   ├── auto-apply-agent.ts     # Application package generation (cover letters, STAR answers)
│   ├── avatar-generator.ts
│   ├── clerk.ts
│   ├── dummy.ts
│   ├── elevenlabs.ts           # ElevenLabs voice synthesis client
│   ├── github-client.ts        # GitHub API client
│   ├── groq-model.ts           # Browser-side AI chat session wrapper
│   ├── helper.ts
│   ├── hono-rpc.ts             # Hono RPC type-safe client
│   ├── liveblocks.ts
│   ├── networking-agent.ts     # Networking message generation (LinkedIn/email)
│   ├── notifications.ts
│   ├── polyfill.ts
│   ├── puppeteer-scraper.ts    # Headless Chromium job scraper
│   ├── resume-import.ts
│   ├── sanitize-html.ts
│   ├── tavily.ts               # Tavily search API client
│   ├── utils.ts                # Tailwind class merge utility (cn)
│   ├── webrtc-interview.ts     # WebRTC interview session manager
│   └── langchain/              # LangChain AI configuration
│       ├── config.ts           # Central model (NVIDIA Kimi K2.6 + Groq fallback)
│       ├── index.ts
│       ├── prompts.ts          # AI prompt templates
│       ├── resume-extractor.ts # Resume data extraction chain
│       └── schemas.ts          # Zod schemas for structured outputs
├── public/                     # Static files
│   ├── CareerForge_ai_final.png
│   └── sw.js
├── types/
│   └── resume.type.ts
├── .env.example
├── middleware.ts                # Clerk auth middleware (public route matcher)
├── next.config.mjs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn package manager
- A running PostgreSQL instance (Neon, local Postgres, or Vercel Postgres)
- Account credentials and API keys for the following services:

| Service | Required | Purpose |
|---------|----------|---------|
| **Clerk** | ✅ Required | Authentication |
| **Groq** | ✅ Required | AI inference (primary/fallback) |
| **Neon DB** | ✅ Required | PostgreSQL database |
| **NVIDIA NIM** | Optional | Primary LLM (falls back to Groq) |
| **ElevenLabs** | Optional | Voice synthesis for podcasts & interviews |
| **Tavily** | Optional | Web search for research agent |
| **GitHub** | Optional | Repository data integration |
| **Liveblocks** | Optional | Real-time collaboration |

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/devhimanshuu/Resumify.git
   cd Resumify
   ```

2. **Install project dependencies**
   ```bash
   npm install
   ```

3. **Environment Settings**
   Duplicate `.env.example` and insert your API credentials:
   ```env
   # Database
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   POSTGRES_URL=postgresql://user:pass@host/db?sslmode=require

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # AI API Credentials
   GROQ_API_KEY=gsk_...
   NVIDIA_KIMI_KEY=nvapi-...
   NVIDIA_IMAGE_KEY=nvapi-...

   # Optional Integrations
   ELEVENLABS_API_KEY=
   TAVILY_API_KEY=
   GITHUB_TOKEN=
   LIVEBLOCKS_SECRET_KEY=

   # Security & Analytics
   ANALYTICS_SALT=use_a_long_random_string_here
   CRON_SECRET=

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database Migration**
   ```bash
   npm run db:push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access at [http://localhost:3000](http://localhost:3000).

---

## 🔐 Route Protection

Routes are protected via Clerk middleware (`middleware.ts`):

**Public Routes** (no auth required):
- `/` — Landing page
- `/sign-in`, `/sign-up` — Authentication
- `/api/*` — API endpoints
- `/p/*` — Public resume sharing
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
- `/cookies` — Cookie Policy

---

## 🎨 Design System

### Glassmorphism Tiers

| Class | Blur | Light Background | Use Case |
|-------|------|-----------------|----------|
| `.glass` | 20px | `rgba(255,255,255,0.7)` | General glass elements |
| `.glass-flat` | 24px | `rgba(255,255,255,0.72)` | Static sections |
| `.glass-premium` | 28px | `rgba(255,255,255,0.55)` | Elevated floating elements |
| `.glass-flat-header` | 24px | `rgba(255,255,255,0.72)` | Navbar at page top |
| `.glass-premium-header` | 28px | `rgba(255,255,255,0.45)` | Floating navbar pill |
| `.glass-mobile-menu` | 40px | `rgba(255,255,255,0.82)` | Mobile hamburger menu |

All classes have `.dark` variants.

---

## 🤝 Contributing

1. Fork the Project
2. Create Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see `LICENSE` for details.

---

<div align="center">
  <h3>💻 Created by <a href="https://github.com/devhimanshuu">devhimanshuu</a></h3>
  <p><i>Building the future of AI-powered career tools.</i></p>
  <code>const dev = { name: "devhimanshu", passion: "coding", status: "always-building" };</code>
</div>