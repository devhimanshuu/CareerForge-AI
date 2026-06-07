# 📄 CareerForge AI: The Ultimate AI-Powered Career Suite

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk)
![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=for-the-badge&logo=groq)

CareerForge AI is a cutting-edge, comprehensive, AI-driven career management suite designed for modern professionals. It helps job seekers construct ATS-optimized resumes, track applications, prepare for interviews, and get strategic market suggestions. Powered by highly optimized AI LLM agents, CareerForge AI bridges the gap between candidates and recruiters.

---

## 🌟 Comprehensive Feature Tour

### 1. 🤖 AI Career Coach & Market Insights Agent
A live, interactive command-center agent built directly into the main workspace.
*   **Resume Selector Dropdown**: Analyzes any active resume selected by the user, immediately refreshing insights.
*   **Live Market Standout Score**: A visual circular gauge (0-100%) indicating how well the selected resume aligns with current hiring demands and tracked pipelines.
*   **Detailed Gaps & Strengths Diagnostic**: Extracts 3 standout strengths and flags 3 critical gaps (experience/skills mismatch) in a premium responsive modal.
*   **Strategic Action Items**: Provides 3 highly actionable next steps for the user's career search.
*   **Salary & Region Insights**: Evaluates expected average salary ranges (e.g. `$110k - $145k`) and hiring velocity for target roles.

---

### 2. ✨ Magic AI Suite
A collection of futuristic career-optimization tools located inside the editor workspace:
*   **🧠 Mind-Reader**: Simulates recruiter eye-tracking patterns. It analyzes resume typography and structure to output a heatmap of candidate highlights that will attract senior recruiters.
*   **🛡️ Liar Detector**: Audits candidate credentials for temporal gaps, inconsistencies, and exaggerated achievements, helping users build a highly credible, verifiable history.
*   **⏳ Time-Traveler**: Projects the user's professional trajectory forward to 2030, showing how current roles will evolve and suggesting future skills to master.
*   **🎙️ Podcast Resume**: Leverages Text-to-Speech and AI dialog synthesis to transform the resume into a high-impact, 2-minute audio podcast style interview.
*   **🔥 Resume Roast**: Provides brutally honest, humorous, and constructive critiques to purge corporate jargon and list clear, metric-based achievements.
*   **💻 Hacker Mode**: A terminal-style CLI editor designed for power users who prefer keyboard shortcuts, commands, and markdown-like control to edit their resume.

---

### 3. 🧠 Advanced AI Generation & Autocomplete
*   **NVIDIA & Groq Integrations**: Generates professional summaries, educational highlights, and experience bullet points using high-velocity LLM APIs.
*   **Tailored Tone & Keywords**: Injects relevant key phrases specific to the selected industry or job role.
*   **ATS Optimization**: Scores your bullet points against top Applicant Tracking Systems (ATS) algorithms.

---

### 4. 💼 Kanban Job Tracker
A fully integrated, drag-and-drop Kanban board for job applications.
*   **Pipeline Management**: Categorize applications into stages: *Applied, Shortlisted, Interviewing, Offer, Rejected*.
*   **Interactive Analytics**: Tracks your interview-to-offer conversion rate and renders dynamic success metrics on the main dashboard.
*   **Resume Mapping**: Associates specific resume versions with each job tracker entry to keep document customization organized.

---

### 5. ✉️ AI Cover Letter Generator
*   **Contextual Crafting**: Reads the personal information, experience, and skills from the active resume to compile highly tailored letters.
*   **Job Specific Alignment**: Simply paste the target job description, and the AI will draft a compelling cover letter highlighting the exact experiences that match the role.

---

### 6. 🎯 Skill Gap Analyzer
*   **Missing Skills Audits**: Scans the user's active resume against modern profiles for their target role.
*   **Course Recommendations**: Identifies specific missing skills and suggests concrete courses, certifications, or projects to bridge the gaps.

---

### 7. 🎙️ AI Interview Coach
*   **Behavioral & Technical Questions**: Generates mock questions tailored specifically to the candidate's experience and target job.
*   **Performance Metrics & Feedback**: Analyzes candidate responses, rating answer completeness, relevance, and communication tone.

---

### 8. 🎨 Custom Layout Builder & Customizer
*   **Premium Visual Styles**: Control background cards, borders, glassmorphism layers, and responsive typography using font families like Inter, Outfit, and Roboto.
*   **Drag-and-Drop Reordering**: Rearrange sections (Education, Experience, Projects, Skills) on the fly.
*   **Live Preview Canvas**: Renders real-time document updates. What you see is exactly what gets built.
*   **Secure Public Links**: Generate shareable URLs for recruiters to view a responsive, web-based version of your portfolio.

---

## 🏗️ Architecture & Tech Stack

CareerForge AI is architected with a modern, modular React stack designed for sub-millisecond response rates:

*   **Frontend Framework**: Next.js 14 (App Router) using React 18 and React Server Components.
*   **Styling & UI Components**: Tailwind CSS for responsive formatting, Framer Motion for smooth micro-animations, and custom Tailwind/Shadcn-themed primitives.
*   **State & Query Management**: TanStack React Query (v5) for cached async API requests and local React Context for resume editing sync.
*   **Backend Layer**: Next.js API Routes routing through **Hono** framework with full RPC type safety.
*   **Database & ORM**: PostgreSQL database (Neon DB serverless backend) queried using **Drizzle ORM**.
*   **Authentication & Security**: clerk-auth for middleware protection, session cookies, and login redirection.
*   **PDF Generation**: High fidelity client-side canvas extraction powered by jsPDF and html2canvas.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18.0.0 or higher)
*   npm or yarn package manager
*   A running PostgreSQL instance (Neon, local Postgres, or Vercel Postgres)
*   Account credentials and API keys for Clerk, Groq, and NVIDIA.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/devhimanshuu/Resumify.git
    cd Resumify
    ```

2.  **Install project dependencies**
    ```bash
    npm install
    ```

3.  **Environment Settings**
    Duplicate `.env.example` to create a `.env` file and insert your API credentials:
    ```env
    # Database Configuration
    DATABASE_URL=postgresql://user:password@hostname/dbname?sslmode=require
    POSTGRES_URL=postgresql://user:password@hostname/dbname?sslmode=require

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

    # Security & App URL
    ANALYTICS_SALT=use_a_long_random_string_here
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

4.  **Database Migration & Schema Sync**
    Generate and push schemas directly using Drizzle:
    ```bash
    npm run db:push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the workspace locally at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Directory Breakdown

```text
├── app/                        # Next.js 14 App Router workspace
│   ├── (auth)/                 # SignIn/SignUp authentication layouts
│   ├── (home)/                 # Main Application Workspace
│   │   ├── dashboard/          # Analytics hub, Document selector, Applications Timeline
│   │   ├── _components/        # Dashboard cards, Dialog triggers, sidebar components
│   │   └── layout.tsx          # Navbars and Mobile Customizer wrappers
│   ├── (landingPage)/          # Marketing/pricing layout page
│   ├── (public)/               # Recruiter public links and preview canvases
│   └── api/                    # Hono RPC server backend (document CRUD, AI endpoints)
├── components/                 # Shared React Components
│   ├── preview/                # Interactive Resume Templates & Theme renderers
│   └── ui/                     # Accessible Shadcn base primitives (Dialog, Select, Input)
├── context/                    # React context for real-time document editing
├── db/                         # Database queries and schema definitions
│   └── schema/                 # Drizzle schemas (Users, Documents, Applications, Experiences)
├── features/                   # Heavyweight CRUD hooks and logic layers
│   ├── document/               # TanStack query hooks for resume CRUD operations
│   └── ai/                     # Groq LLM integration classes
├── hooks/                      # Global Custom React hooks
├── lib/                        # Helper functions, config clients, and CSS utils
├── public/                     # Static files, vector assets, and favicon files
└── types/                      # Shared TypeScript Interfaces
```

---

## 🤝 Contributing

Contributions are always welcome. Please follow these guidelines:
1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

This software is distributed under the MIT License. Refer to `LICENSE` for details.

---

<div align="center">
  <h3>💻 Created by <a href="https://github.com/devhimanshuu">devhimanshuu</a></h3>
  <p><i>Building the future of AI-powered career tools.</i></p>
  <code>const dev = { name: "devhimanshu", passion: "coding", status: "always-building" };</code>
</div>
 
