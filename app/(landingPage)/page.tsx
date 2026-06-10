"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import {
  Sparkles,
  Zap,
  Shield,
  Download,
  Share2,
  Palette,
  Bot,
  FileText,
  ArrowRight,
  Star,
  CheckCircle2,
  Trophy,
  Target,
  Briefcase,
  Linkedin,
  Github,
  Globe,
  Twitter,
  Play,
  Pause,
  Video,
  Mic,
  Volume2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Lock,
  Music,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FallingPattern } from "@/components/ui/falling-pattern";
import { CyberneticBentoGrid } from "@/components/ui/cybernetic-bento-grid";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TestimonialMarquee } from "@/components/ui/testimonial-marquee";

export default function Home() {
  const [activeTab, setActiveTab] = useState("ats");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="w-full overflow-hidden">
      {/* ===== Hero Section ===== */}
      <section className="relative flex min-h-[90vh] sm:min-h-[92vh] w-full items-center justify-center overflow-hidden bg-background">
        {/* Falling Pattern Background */}
        <div className="absolute inset-0 z-0">
          <FallingPattern
            className="opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
            color="hsl(var(--primary))"
          />
        </div>

        <div className="absolute inset-x-0 top-0 z-0 h-80 bg-gradient-to-b from-indigo-500/10 via-background/60 to-transparent" />
        
        {/* Background Blobs */}
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] z-0 animate-pulse pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] z-0 pointer-events-none" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 sm:px-5 pb-16 pt-24 sm:pt-20 sm:pb-20 text-center">
          {/* Badge */}
          <div className="animate-fade-up mb-8">
            <div className="inline-flex items-center gap-2 rounded-md border border-indigo-500/20 bg-background/80 px-4 py-2 text-sm font-medium shadow-sm glass">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                Introducing CareerForge AI Suite
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight animate-fade-up leading-[1.1] max-w-full mx-auto px-1 sm:px-2 break-words font-display"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-foreground">Supercharge Your </span>
            <br className="hidden sm:block md:hidden" />
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient py-2 inline-block min-w-[260px] sm:min-w-[320px] md:min-w-[500px]">
              <TypewriterText
                words={["Resumes", "Interviews", "Cover Letters", "Job Hunt"]}
                typingSpeed={100}
                deletingSpeed={60}
                pauseDelay={2500}
                className="whitespace-nowrap"
              />
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-up font-medium px-2 sm:px-0"
            style={{ animationDelay: "0.2s" }}
          >
            Stop guessing what recruiters want. CareerForge uses advanced AI to
            build ATS-optimized resumes, prepare you for interviews, and track
            your applications in one unified platform.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-12 animate-fade-up w-full sm:w-auto px-2 sm:px-0"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-14 px-8 text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 gap-2 rounded-xl shimmer-effect"
            >
              <Link href="/sign-up">
                <Sparkles size="18px" />
                Start Forging — It&apos;s Free
                <ArrowRight size="16px" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-14 px-8 text-base font-semibold border-indigo-500/20 hover:bg-indigo-500/10 text-foreground transition-all duration-300 gap-2 rounded-xl glass"
            >
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>

          {/* Stats Bar */}
          <div
            className="mt-12 sm:mt-16 grid w-full grid-cols-2 gap-3 sm:gap-4 rounded-xl sm:rounded-lg border bg-card/80 px-3 sm:px-4 py-5 sm:py-6 shadow-sm animate-fade-up sm:mt-20 sm:gap-8 sm:px-6 sm:py-8 md:grid-cols-4"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-foreground flex items-center">
                <AnimatedCounter target={10000} suffix="+" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium text-center">
                Resumes Created
              </p>
            </div>
            <div className="flex flex-col items-center justify-center border-l-0 sm:border-l sm:border-border/50">
              <div className="text-2xl sm:text-3xl font-black text-foreground flex items-center">
                <AnimatedCounter target={95} suffix="%" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium text-center">
                ATS Pass Rate
              </p>
            </div>
            <div className="flex flex-col items-center justify-center border-l-0 md:border-l border-border/50 pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-black text-foreground flex items-center">
                <AnimatedCounter target={500} suffix="+" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium text-center">
                Jobs Landed
              </p>
            </div>
            <div className="flex flex-col items-center justify-center border-l-0 sm:border-l sm:border-border/50 pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-1">
                <AnimatedCounter target={4} suffix=".9" />
                <Star className="fill-yellow-400 text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 ml-1" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium text-center">
                User Rating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section id="features" className="relative py-32 px-5 bg-gradient-to-b from-background via-indigo-500/[0.02] to-background">
        <div className="max-w-7xl mx-auto">
          <CyberneticBentoGrid />
        </div>
      </section>

      {/* ===== Agentic AI Section ===== */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-5 bg-gradient-to-b from-background via-cyan-500/[0.02] to-background overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border border-cyan-500/20 bg-cyan-500/5 mb-6">
              <Bot size={14} className="text-cyan-500" />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                Agentic AI Engine
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-4 sm:mb-6">
              Your Personal{" "}
              <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                AI Career Agents
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              A fleet of specialized AI agents working in concert — each one a domain expert that automates
              a piece of your job search pipeline, from scraping to interviewing.
            </p>
          </div>

          {/* Agent Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Agent 1: ATS Resume Optimizer */}
            <div className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/50 bg-card/30 glass transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 overflow-hidden">
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              {/* Icon */}
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/10">
                <FileText className="text-indigo-500" size={26} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">ATS Resume Optimizer</h3>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[9px] font-bold rounded-md uppercase tracking-wider">LangChain</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Analyzes job descriptions against your resume using NVIDIA Kimi K2.6 + Groq Llama 3.3 70B.
                  Generates tailored bullet points, identifies keyword gaps, and boosts ATS match scores with
                  enterprise-grade structured output.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">NVIDIA NIM</span>
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">Groq Inference</span>
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">Zod Schema</span>
                </div>
              </div>
            </div>

            {/* Agent 2: Auto-Apply Agent */}
            <div className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/50 bg-card/30 glass transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/10">
                <Zap className="text-emerald-500" size={26} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Auto-Apply Agent</h3>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold rounded-md uppercase tracking-wider">Automation</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  One-click application package generation. Produces tailored cover letters, STAR-method
                  interview answers, and rewrites every bullet point to match JD keywords — saving hours
                  of manual tailoring per application.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">Cover Letters</span>
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">STAR Answers</span>
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">Gap Analysis</span>
                </div>
              </div>
            </div>

            {/* Agent 3: Job Scraper Agent */}
            <div className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/50 bg-card/30 glass transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-500/10">
                <Globe className="text-amber-500" size={26} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Job Scraper Agent</h3>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold rounded-md uppercase tracking-wider">Puppeteer</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Headless Chromium engine that bypasses WAF protections across LinkedIn, Indeed, and
                  Glassdoor. Rotates user-agents and viewports to extract clean job details including
                  hidden salary ranges and posting dates.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">WAF Bypass</span>
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">UA Rotation</span>
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">Multi-Source</span>
                </div>
              </div>
            </div>

            {/* Agent 4: Networking Agent */}
            <div className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/50 bg-card/30 glass transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/10">
                <Share2 className="text-blue-500" size={26} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Networking Agent</h3>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-bold rounded-md uppercase tracking-wider">Outreach</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Generates contextual follow-ups, thank-you notes, recruiter connection requests, and
                  negotiation scripts tailored to your application stage. Supports LinkedIn DM and email
                  formats with timing recommendations.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">LinkedIn DM</span>
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">Email Templates</span>
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">Stage-Aware</span>
                </div>
              </div>
            </div>

            {/* Agent 5: Interview Coach Agent */}
            <div className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/50 bg-card/30 glass transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-500/10 hover:border-rose-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-rose-500/10">
                <Video className="text-rose-500" size={26} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Interview Coach Agent</h3>
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-bold rounded-md uppercase tracking-wider">WebRTC</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Live WebRTC interview simulator with HD camera feed, real-time speech detection via
                  AudioContext analyser, and ElevenLabs voice-synthesized recruiter questions. Records
                  sessions for playback and self-review.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">WebRTC</span>
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">Silence Detection</span>
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">ElevenLabs TTS</span>
                </div>
              </div>
            </div>

            {/* Agent 6: Research Agent */}
            <div className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/50 bg-card/30 glass transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/10">
                <Target className="text-purple-500" size={26} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Web Research Agent</h3>
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[9px] font-bold rounded-md uppercase tracking-wider">Tavily</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Powered by Tavily's advanced search API, this agent researches companies, industry
                  trends, and salary benchmarks in real-time. Enriches your application context with
                  up-to-date market intelligence before every interview.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">Real-time Search</span>
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">Salary Intel</span>
                  <span className="px-2.5 py-1 bg-background/60 border border-border/40 rounded-lg text-[10px] font-semibold text-muted-foreground">Company Insights</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12 sm:mt-16">
            <p className="text-sm text-muted-foreground mb-4 font-medium">
              All agents share context through a unified pipeline — your resume data flows seamlessly
              from optimization → application → networking → interview prep.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 text-sm"
            >
              <Bot size={16} />
              Deploy Your Agent Fleet
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Interactive Feature Showcase ===== */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-5 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium border border-border mb-4 glass">
              <Bot size="14px" className="text-indigo-500" />
              Live Interactive Demos
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Experience the{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                CareerForge Engine
              </span>
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0">
              Click through the tabs below to test drive the core mechanics of our next-gen AI career suite.
            </p>
          </div>

          {/* Interactive Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left selector tabs */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {[
                {
                  id: "ats",
                  title: "ATS Scraper & Gap Analyzer",
                  tagline: "WAF-bypass scraping & scoring",
                  description: "Paste a target job link. Our crawler pulls specifications, matches them with your resume, and provides a target checklist to maximize your match score.",
                  icon: <FileText className="text-indigo-500" size={20} />,
                },
                {
                  id: "podcast",
                  title: "AI Podcast Resume Maker",
                  tagline: "Dual-voice audio summaries",
                  description: "Convert dry text into an interactive, natural interview conversation between a professional host and yourself using sequential voice synthesis.",
                  icon: <Music className="text-purple-500" size={20} />,
                },
                {
                  id: "mock",
                  title: "AI Mock Interview Lab",
                  tagline: "Voice question synthesizers",
                  description: "Simulate pressure-filled recruiter screens. Features dynamic voice synthesis questions, camera feedback overlays, and active mute/unmute buttons.",
                  icon: <Video className="text-rose-500" size={20} />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left p-6 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                    activeTab === tab.id
                      ? "border-indigo-500/30 bg-indigo-500/5 shadow-lg shadow-indigo-500/5 glass"
                      : "border-border/45 hover:border-border/80 hover:bg-card/20 bg-transparent"
                  }`}
                >
                  <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 ${
                    activeTab === tab.id
                      ? "bg-indigo-500/10 border-indigo-500/30"
                      : "bg-card border-border"
                  }`}>
                    {tab.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                      {tab.title}
                      {activeTab === tab.id && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">{tab.tagline}</p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{tab.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Right visual content */}
            <div className="lg:col-span-8 min-h-[400px] sm:h-[520px] rounded-2xl sm:rounded-3xl border border-border/50 bg-card/20 glass p-4 sm:p-8 relative overflow-hidden flex flex-col justify-center">
              {/* Decorative backgrounds */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
              
              {/* Tab 1: ATS */}
              {activeTab === "ats" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 border-b border-border/50 pb-3 sm:pb-4">
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-foreground">ATS Target: Senior React Developer</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Scraped from: techcareers.com/jobs/928421</p>
                    </div>
                    <div className="px-3 py-1.5 bg-emerald-500/15 text-emerald-500 text-xs font-bold border border-emerald-500/25 rounded-lg flex items-center gap-1">
                      <CheckCircle2 size={12} /> Bypassed WAF
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-4 sm:p-6 border border-border/50 bg-background/50 rounded-2xl text-center relative overflow-hidden">
                      {/* Circular score display */}
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="hsl(var(--border))" strokeWidth="8" fill="transparent" />
                          <circle cx="50" cy="50" r="40" stroke="url(#atsScoreGradient)" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="25.12" strokeLinecap="round" className="animate-draw" />
                          <defs>
                            <linearGradient id="atsScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-3xl font-black text-foreground">90%</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Match</span>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground mt-4">Required score: 85%</p>
                    </div>

                    <div className="md:col-span-7 space-y-4">
                      <h5 className="font-bold text-xs text-indigo-500 uppercase tracking-widest">Keyword Recommendations</h5>
                      <div className="space-y-3">
                        {[
                          { word: "Next.js App Router", status: "missing", points: "+15 pts", type: "Key Framework" },
                          { word: "Tailwind CSS Layouts", status: "present", points: "+8 pts", type: "Styling" },
                          { word: "Framer Motion Springs", status: "missing", points: "+12 pts", type: "Interactions" },
                        ].map((item, idx) => (
                          <div key={idx} className="p-3 bg-background/40 border border-border/40 rounded-xl flex items-center justify-between gap-4">
                            <div>
                              <span className="text-sm font-bold text-foreground">{item.word}</span>
                              <span className="text-[10px] text-muted-foreground ml-2 px-1.5 py-0.5 rounded bg-muted font-medium">{item.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-indigo-400">{item.points}</span>
                              {item.status === "missing" ? (
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded border border-amber-500/20">Add</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded border border-emerald-500/20">Matched</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Podcast */}
              {activeTab === "podcast" && (
                <div className="space-y-4 sm:space-y-6 animate-fade-in flex flex-col justify-between h-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-b border-border/50 pb-3 sm:pb-4">
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-foreground">Podcast Overview: Parth_Resume.pdf</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Topic: Professional Background & Technical Milestones</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[10px] font-bold rounded-lg uppercase tracking-wider">Dual Voice Synthesized</span>
                    </div>
                  </div>

                  {/* Transcript Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 pr-1 sm:pr-2 py-1 sm:py-2 max-h-[200px] sm:max-h-[260px] scrollbar-thin">
                    {[
                      { role: "Host (Voice A)", text: "Hey everyone! Today we're diving into Parth's profile. He's a Full-Stack Dev with huge React experience, especially in building high-performance web systems.", active: true },
                      { role: "Candidate (Voice B)", text: "That's right! I focus on making apps responsive, visually outstanding, and fully ATS-friendly. The layout optimization is where it really shines.", active: false },
                      { role: "Host (Voice A)", text: "Awesome! And I noticed you built custom web apps with real-time speech components too. That's a massive differentiator.", active: false }
                    ].map((line, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border transition-all duration-300 ${
                        line.active 
                          ? "bg-purple-500/5 border-purple-500/25 shadow-inner" 
                          : "bg-background/40 border-border/30 opacity-70"
                      }`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-bold ${line.active ? "text-purple-500" : "text-muted-foreground"}`}>{line.role}</span>
                          {line.active && <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />}
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">{line.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Audio Controls */}
                  <div className="bg-background/80 border border-border/50 p-4 rounded-2xl flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <button className="w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-600 transition-colors flex items-center justify-center text-white">
                        <Play size={16} fill="white" />
                      </button>
                      <div>
                        <span className="text-xs font-bold text-foreground block">Resume Audio Overview</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">0:24 / 2:15 • HOST & CANDIDATE</span>
                      </div>
                    </div>
                    {/* Simulated Waveform */}
                    <div className="hidden sm:flex items-center gap-1 flex-1 max-w-[200px] justify-center">
                      {[15, 25, 45, 12, 35, 60, 25, 45, 15, 30, 48, 24, 15].map((val, i) => (
                        <div key={i} className="w-1 rounded-full bg-purple-500/20" style={{ height: `${val}px` }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"><Volume2 size={16} /></button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Mock Interview */}
              {activeTab === "mock" && (
                <div className="space-y-6 animate-fade-in flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <div>
                      <h4 className="font-bold text-lg text-foreground">Interview Prep Lab: Recruiter Session</h4>
                      <p className="text-xs text-muted-foreground font-medium">Role: Senior Frontend Engineer • Active Web-Cam Overlay</p>
                    </div>
                    <div className="px-2.5 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" /> Live Video
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
                    {/* Camera view placeholder */}
                    <div className="md:col-span-6 h-56 rounded-2xl border border-border bg-black/60 relative overflow-hidden flex flex-col items-center justify-center group shadow-xl">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)] pointer-events-none" />
                      
                      <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 animate-pulse">
                        <Video size={28} />
                      </div>
                      <span className="text-xs text-white/50 font-bold uppercase tracking-wider mt-3">Web-Cam Live Feed</span>
                      
                      {/* Video actions overlay */}
                      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-semibold text-white/80">
                        <span>USER CAMERA</span>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:text-white transition-colors"><Mic size={12} /></button>
                          <button className="p-1 hover:text-white transition-colors"><VolumeX size={12} /></button>
                        </div>
                      </div>
                    </div>

                    {/* Question text panel */}
                    <div className="md:col-span-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                          <Volume2 size={16} />
                        </div>
                        <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Recruiter Voice Reading:</span>
                      </div>
                      
                      <div className="p-4 bg-background/60 border border-rose-500/20 rounded-xl relative">
                        <div className="absolute -left-2 top-4 w-4 h-4 transform rotate-45 bg-background border-l border-b border-rose-500/20" />
                        <p className="text-sm font-semibold leading-relaxed text-foreground relative z-10">
                          &quot;Tell me about a time when you had to optimize performance for a page with high traffic and heavy image loads. What was your strategy?&quot;
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-lg py-2 flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20">
                          <Mic size={14} /> Start Answering
                        </Button>
                        <Button variant="outline" className="text-xs font-semibold border-rose-500/20 text-foreground hover:bg-rose-500/5 rounded-lg px-3 flex items-center justify-center gap-1.5">
                          <VolumeX size={14} /> Mute Recruiter
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== How It Works Section ===== */}
      <section id="how-it-works" className="relative py-32 px-5 bg-gradient-to-b from-background via-purple-500/[0.02] to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border border-purple-500/20 bg-purple-500/5 mb-6">
              <Target size={14} className="text-purple-500" />
              Simple Process
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              From resume to
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
                {" "}offer letter
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Four simple steps to transform your job search from frustrating to successful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Build Your Resume",
                description: "Import from LinkedIn or start fresh. Our AI generates optimized bullet points that match your target roles.",
                icon: <Bot className="text-indigo-500" size={32} />,
                color: "indigo",
              },
              {
                step: "02",
                title: "Analyze & Optimize",
                description: "Scrape job listings and get instant feedback on how well your resume matches with actionable suggestions.",
                icon: <Shield className="text-emerald-500" size={32} />,
                color: "emerald",
              },
              {
                step: "03",
                title: "Apply & Track",
                description: "Generate tailored applications and track everything in one place with automated status updates.",
                icon: <Briefcase className="text-amber-500" size={32} />,
                color: "amber",
              },
              {
                step: "04",
                title: "Ace Interviews",
                description: "Practice with AI-powered mock interviews and get real-time feedback on your answers.",
                icon: <Trophy className="text-rose-500" size={32} />,
                color: "rose",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                {/* Connector line */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-indigo-500/30 to-transparent" />
                )}
                
                <div className="relative p-8 rounded-3xl border bg-gradient-to-br from-background to-card/50 hover:from-card/80 hover:to-background transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-border/50">
                  <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-${item.color}-500/30`}>
                    {item.step}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-${item.color}-500/10 to-${item.color}-600/10 border border-${item.color}-500/20 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials Section ===== */}
      <section className="relative py-32 px-5 bg-gradient-to-b from-background via-emerald-500/[0.02] to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border border-emerald-500/20 bg-emerald-500/5 mb-6">
              <Star size={14} className="text-emerald-500 fill-emerald-500" />
              Trusted by professionals
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Join thousands who
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                {" "}landed their dream jobs
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              See how CareerForge AI has transformed job searches across industries.
            </p>
          </div>

          <TestimonialMarquee />
        </div>
      </section>

      {/* ===== Pricing Section ===== */}
      <section id="pricing" className="relative py-32 px-5 bg-gradient-to-b from-background via-rose-500/[0.02] to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border border-rose-500/20 bg-rose-500/5 mb-6">
              <Star size={14} className="text-rose-500 fill-rose-500" />
              Simple pricing
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Choose the plan that
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                {" "}fits your goals
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Start free and upgrade as you grow. No hidden fees, cancel anytime.
            </p>

            {/* Toggle Billing Period */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <span className={`text-sm font-semibold transition-colors ${billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
              <button 
                onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
                className="w-14 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/35 p-1 relative flex items-center transition-all duration-300"
              >
                <div className={`w-6 h-6 rounded-full bg-indigo-500 transition-all duration-300 absolute ${billingPeriod === "yearly" ? "right-1" : "left-1"}`} />
              </button>
              <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${billingPeriod === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
                Yearly
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[9px] font-bold rounded-md tracking-wider uppercase">Save 20%</span>
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                description: "Perfect for getting started with AI-powered career tools.",
                price: { monthly: 0, yearly: 0 },
                features: [
                  "1 AI-optimized resume",
                  "Basic ATS templates",
                  "1 AI podcast generation",
                  "1 mock interview session",
                  "Basic job tracking",
                ],
                cta: "Get Started Free",
                popular: false,
                href: "/sign-up",
                color: "indigo",
              },
              {
                name: "Pro",
                description: "For serious job seekers who want maximum impact.",
                price: { monthly: 19, yearly: 15 },
                features: [
                  "Unlimited AI resumes",
                  "Full ATS job scraper",
                  "Unlimited podcast generations",
                  "Unlimited mock interviews",
                  "Real-time market analytics",
                  "Priority AI processing",
                ],
                cta: "Upgrade to Pro",
                popular: true,
                href: "/sign-up",
                color: "rose",
              },
              {
                name: "Executive",
                description: "Premium features for senior professionals and executives.",
                price: { monthly: 49, yearly: 39 },
                features: [
                  "Everything in Pro",
                  "Custom industry datasets",
                  "1-on-1 strategy reviews",
                  "Priority support",
                  "Advanced networking tools",
                  "API access",
                ],
                cta: "Get Executive",
                popular: false,
                href: "/sign-up",
                color: "purple",
              },
            ].map((plan, idx) => (
              <div 
                key={idx}
                className={`relative flex flex-col justify-between p-8 rounded-3xl border transition-all duration-300 group hover:-translate-y-1 bg-gradient-to-br from-background to-card/30 ${
                  plan.popular 
                    ? "border-rose-500/40 shadow-xl shadow-rose-500/10 ring-1 ring-rose-500/20 scale-[1.02] z-10" 
                    : "border-border/50 hover:border-border/80"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full border border-rose-400/30 shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-2xl text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{plan.description}</p>
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-border/50">
                    <span className="text-5xl font-black text-foreground">${billingPeriod === "monthly" ? plan.price.monthly : plan.price.yearly}</span>
                    <span className="text-lg font-semibold text-muted-foreground">/mo</span>
                    {billingPeriod === "yearly" && plan.price.yearly > 0 && (
                      <span className="text-xs text-muted-foreground ml-2 font-mono font-bold">Billed annually</span>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm text-foreground/90 font-medium">
                        <CheckCircle2 size={18} className={`text-${plan.color}-500 shrink-0 mt-0.5`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10">
                  <Button 
                    asChild 
                    className={`w-full h-14 rounded-xl text-sm font-bold shadow-md transition-all duration-300 ${
                      plan.popular 
                        ? "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-rose-500/25" 
                        : "bg-background border border-indigo-500/20 hover:bg-indigo-500/10 text-foreground"
                    }`}
                  >
                    <Link href={plan.href}>
                      {plan.cta}
                      <ArrowRight size={16} className="ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Polished FAQ Accordion Section ===== */}
      <section id="faq" className="relative py-28 px-5 bg-background border-t border-border/40">
        <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border border-border mb-4 glass">
              <HelpCircle size="14px" className="text-indigo-500" />
              Got Questions?
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Everything you need to know about our parsing algorithms, data safety, and voice synthesis modules.
            </p>
          </div>

          {/* Accordion list */}
          <div className="space-y-4">
            {[
              {
                q: "How does the ATS URL Scraper bypass security blocks?",
                a: "Our job listing scraper is engineered using custom browser headers, automated user-agent rotation, and network delay strategies that emulate authentic browser requests. This allows the system to bypass basic Web Application Firewalls (WAF) to extract clean job details from LinkedIn, Indeed, and corporate boards safely."
              },
              {
                q: "Is my private resume data shared or public?",
                a: "No. Security is built into the core. All resumes created on CareerForge are linked to your personal Clerk authentication context. If your resume status is set to 'private', it is completely hidden from public access. When generating a PDF, our Puppeteer print engine securely requests the document with a temporary cryptographically hashed `pdfSecret` derived from the application secret key to ensure access is only granted to the printing engine."
              },
              {
                q: "How does the AI Podcast Resume voice generation work?",
                a: "The podcast engine analyzes your work history, experience bullets, and career summary to write a structured conversation script containing HOST (Voice A) and CANDIDATE (Voice B) dialogue lines. It then sequentially invokes local speech synthesis engines, applying tailored voice pitch and rates to simulate a live conversational style audio player."
              },
              {
                q: "Can I cancel my Pro plan at any time?",
                a: "Yes. There are no locking contracts or cancellation fees. You can cancel your subscription inside your billing settings at any time with a single click. You will retain access to all Pro features until the end of your current billing cycle."
              },
              {
                q: "Does the builder support custom resume formats and spacing?",
                a: "Absolutely. Our builder features a high-fidelity drag-and-drop section ordering editor, a custom layout spacing builder (paddings, margins, grid gaps), and visual theme colors (primary accents, text tones) so you can create a layout tailored to your style."
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="border border-border/50 rounded-2xl overflow-hidden bg-card/30 glass transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-card/50 transition-colors"
                >
                  <span className="font-bold text-base md:text-lg text-foreground pr-4">{item.q}</span>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 border border-indigo-500/20 shrink-0 transition-transform duration-300">
                    {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openFaq === idx ? "max-h-60 opacity-100 border-t border-border/50" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="p-6 text-sm md:text-base leading-relaxed text-muted-foreground font-semibold bg-background/20">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="relative py-32 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-12 md:p-24 rounded-[3rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
            <FallingPattern
              className="absolute inset-0 opacity-20"
              color="rgba(255,255,255,0.5)"
              backgroundColor="transparent"
            />

            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
                Ready to transform
                <br />
                your career?
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                Join thousands of professionals who have already accelerated their careers with AI-powered tools. Start building your future today.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-10 text-base font-bold bg-white text-indigo-600 hover:bg-white/90 shadow-xl shadow-black/20 transition-all duration-300 gap-2 rounded-xl w-full sm:w-auto"
                >
                  <Link href="/sign-up">
                    Start For Free
                    <ArrowRight size={16} />
                  </Link>
                </Button>
                <p className="text-white/70 text-sm mt-4 sm:mt-0 sm:ml-4 flex items-center gap-2">
                  <CheckCircle2 size={16} /> No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border/50 bg-card/30 pt-20 pb-10 px-5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6 group">
              <Image
                src="/CareerForge_ai_final.png"
                alt="CareerForge AI Logo"
                width={40}
                height={40}
                className="group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]"
              />
              <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-indigo-500 to-indigo-400 bg-clip-text text-transparent">
                CareerForge AI
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-6">
              The ultimate AI-powered career platform. Build stunning resumes, ace your interviews, and land your dream job faster than ever.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/himanshu-guptaa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://www.github.com/devhimanshuu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"
              >
                <Github size={18} />
              </a>
              <a
                href="https://himanshuguptaa.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"
              >
                <Globe size={18} />
              </a>
              <a
                href="https://x.com/devhimanshuu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#features"
                  className="hover:text-indigo-500 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-indigo-500 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="hover:text-indigo-500 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="hover:text-indigo-500 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#"
                  className="hover:text-indigo-500 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-indigo-500 transition-colors"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-indigo-500 transition-colors"
                >
                  Interview Prep
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-indigo-500 transition-colors"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#"
                  className="hover:text-indigo-500 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-indigo-500 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-indigo-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-indigo-500 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CareerForge AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-indigo-500 transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-indigo-500 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
