"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Brain,
  Network,
  BarChart3,
  Search,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FallingPattern } from "@/components/ui/falling-pattern";
import { CyberneticBentoGrid } from "@/components/ui/cybernetic-bento-grid";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TestimonialMarquee } from "@/components/ui/testimonial-marquee";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Live Agent Activity Pulse ── */
function LiveAgentPulse() {
  const [activeAgent, setActiveAgent] = useState(0);
  const agents = useMemo(() => [
    { name: "ATS Optimizer", status: "Analyzing 3 job descriptions", color: "text-indigo-500" },
    { name: "Job Scraper", status: "Scanning 12 new postings", color: "text-amber-500" },
    { name: "Network Agent", status: "Drafting outreach for Google", color: "text-blue-500" },
    { name: "Interview Coach", status: "Generating mock questions", color: "text-rose-500" },
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % agents.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [agents.length]);

  return (
    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-border/50 bg-card/60 backdrop-blur-xl shadow-lg">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeAgent}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <span className={cn("text-xs font-bold", agents[activeAgent].color)}>
            {agents[activeAgent].name}
          </span>
          <span className="text-xs text-muted-foreground">—</span>
          <span className="text-xs text-muted-foreground font-medium">
            {agents[activeAgent].status}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Pipeline Visualization — SVG-Based Traveling Dot ── */
const PIPELINE_COLORS: Record<string, { bg: string; glow: string }> = {
  indigo: { bg: "#6366f1", glow: "rgba(99,102,241,0.7)" },
  emerald: { bg: "#10b981", glow: "rgba(16,185,129,0.7)" },
  amber: { bg: "#f59e0b", glow: "rgba(245,158,11,0.7)" },
  blue: { bg: "#3b82f6", glow: "rgba(59,130,246,0.7)" },
  rose: { bg: "#f43f5e", glow: "rgba(244,63,94,0.7)" },
  violet: { bg: "#8b5cf6", glow: "rgba(139,92,246,0.7)" },
};

type DotColorKey = keyof typeof PIPELINE_COLORS;

function PipelineVisualization({
  agents,
  colorMap,
}: {
  agents: Array<{ id: string; icon: React.ReactNode; title: string; color: string }>;
  colorMap: Record<string, { bg: string; text: string; border: string; ring: string; glowColor: string; hoverBg: string; iconBg: string; iconBorder: string; edgeGlow: string }>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [nodePositions, setNodePositions] = useState<Array<{ cx: number; cy: number }>>([]);
  const [progress, setProgress] = useState(0); // 0 → 1 continuously
  const [isInView, setIsInView] = useState(false);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef(0);

  /* observe visibility */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    const el = containerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);

  /* measure icon node positions (center of each icon box) */
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      setNodePositions(
        nodeRefs.current.map((ref) => {
          if (!ref) return { cx: 0, cy: 0 };
          const r = ref.getBoundingClientRect();
          return {
            cx: r.left + r.width / 2 - cRect.left,
            cy: r.top + r.height / 2 - cRect.top,
          };
        })
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* smooth continuous animation loop */
  useEffect(() => {
    if (!isInView || nodePositions.length < 2) return;

    const speed = 0.12; // progress units per second (~8.3s for full pipeline)
    const pauseAtEnd = 0.6; // seconds to pause before resetting
    let pauseTimer = 0;
    let paused = false;

    const tick = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (paused) {
        pauseTimer += dt;
        if (pauseTimer >= pauseAtEnd) {
          paused = false;
          pauseTimer = 0;
          progressRef.current = 0;
        }
      } else {
        progressRef.current += speed * dt;
        if (progressRef.current >= 1) {
          progressRef.current = 1;
          paused = true;
          pauseTimer = 0;
        }
      }

      setProgress(progressRef.current);
      animRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = 0;
    animRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animRef.current);
      lastTimeRef.current = 0;
    };
  }, [isInView, nodePositions.length]);

  const n = nodePositions.length;
  if (n < 2) return null;

  /* compute the total pipeline path length (sum of distances between consecutive nodes) */
  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < n - 1; i++) {
    const dx = nodePositions[i + 1].cx - nodePositions[i].cx;
    const dy = nodePositions[i + 1].cy - nodePositions[i].cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(len);
    totalLength += len;
  }

  /* find the dot position along the path using progress (0→1) */
  const targetDist = progress * totalLength;
  let dotX = 0;
  let dotY = 0;
  let currentColor: DotColorKey = agents[0].color as DotColorKey;
  let activeSegIdx = 0;
  let segProgress = 0; // 0→1 within current segment

  let accDist = 0;
  for (let i = 0; i < n - 1; i++) {
    if (targetDist <= accDist + segmentLengths[i] || i === n - 2) {
      const segLen = segmentLengths[i];
      const t = segLen > 0 ? Math.min((targetDist - accDist) / segLen, 1) : 0;
      dotX = nodePositions[i].cx + (nodePositions[i + 1].cx - nodePositions[i].cx) * t;
      dotY = nodePositions[i].cy + (nodePositions[i + 1].cy - nodePositions[i].cy) * t;
      activeSegIdx = i;
      segProgress = t;
      /* color picks up the destination node's color once >50% through */
      currentColor = (t > 0.5 ? agents[i + 1] : agents[i]).color as DotColorKey;
      break;
    }
    accDist += segmentLengths[i];
  }

  const ci = PIPELINE_COLORS[currentColor];

  /* which node is "active" (glowing) */
  const glowIdx = segProgress > 0.5 ? activeSegIdx + 1 : activeSegIdx;

  /* fade out the dot at the very end */
  const dotOpacity = progress >= 0.98 ? Math.max(0, 1 - (progress - 0.98) * 50) : 1;

  return (
    <div ref={containerRef} className="relative flex items-center justify-center overflow-x-auto py-4 px-2">
      {/* Icons + Connector Lines */}
      <div className="relative flex items-center gap-0 min-w-fit mx-auto">
        {agents.map((agent, idx) => {
          const c = colorMap[agent.color];
          const isGlowing = idx === Math.min(glowIdx, n - 1);
          return (
            <div key={agent.id} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  ref={(el) => { nodeRefs.current[idx] = el; }}
                  animate={{
                    scale: isGlowing ? 1.12 : 1,
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-shadow duration-400",
                    c.bg, "text-white",
                    "shadow-lg"
                  )}
                  style={{
                    boxShadow: isGlowing
                      ? `0 0 24px 6px ${ci.glow}`
                      : undefined,
                    borderColor: isGlowing ? ci.bg : "transparent",
                  }}
                >
                  {agent.icon}
                </motion.div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300",
                  isGlowing ? "text-foreground" : "text-muted-foreground"
                )}>
                  {agent.title.split(" ")[0]}
                </span>
              </div>

              {/* Connector line — filled progressively */}
              {idx < n - 1 && (
                <div className="w-16 sm:w-20 h-[3px] rounded-full bg-border/40 mx-1 sm:mx-2 relative overflow-hidden">
                  {/* Base track */}
                  <div className="absolute inset-0 rounded-full" />
                  {/* Colored fill — clips to current segment progress */}
                  <div
                    className="absolute inset-0 rounded-full origin-left"
                    style={{
                      background: `linear-gradient(to right, ${PIPELINE_COLORS[agents[idx].color].bg}, ${PIPELINE_COLORS[agents[idx + 1].color].bg})`,
                      transform: `scaleX(${idx < activeSegIdx ? 1 : idx === activeSegIdx ? segProgress : 0})`,
                      opacity: idx <= activeSegIdx ? 1 : 0,
                      transition: "none",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* ── SVG Overlay for the Traveling Dot ── */}
        {nodePositions.length >= 2 && (
          <svg
            className="absolute inset-0 pointer-events-none z-30"
            width="100%"
            height="100%"
            style={{ overflow: "visible" }}
          >
            <defs>
              <filter id="pipeline-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Outer glow ring */}
            <circle
              cx={dotX}
              cy={dotY}
              r={14}
              fill={ci.glow}
              opacity={dotOpacity * 0.4}
              style={{ transition: "fill 0.3s" }}
            />
            {/* Main dot */}
            <circle
              cx={dotX}
              cy={dotY}
              r={6}
              fill={ci.bg}
              opacity={dotOpacity}
              filter="url(#pipeline-glow)"
              style={{ transition: "fill 0.3s" }}
            />
            {/* Inner bright core */}
            <circle
              cx={dotX}
              cy={dotY}
              r={2.5}
              fill="white"
              opacity={dotOpacity * 0.9}
            />
          </svg>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("ats");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const agents = [
    {
      id: "auto-tailor",
      icon: <Brain size={24} />,
      title: "Auto-Tailor Agent",
      subtitle: "Resume Versioning",
      description: "Automatically clones and adjusts your base resume for every saved job. Re-weights bullet points and aligns terminology without hallucinating experience.",
      color: "indigo",
      gradient: "from-indigo-500 to-purple-600",
      glowColor: "shadow-indigo-500/25",
      tags: ["Dynamic Variants", "Keyword Alignment", "Zod Schema"],
      status: "Active",
      metric: "90%+",
      metricLabel: "Avg Match",
    },
    {
      id: "auto-apply",
      icon: <Zap size={24} />,
      title: "Auto-Apply Agent",
      subtitle: "One-Click Packages",
      description: "Produces tailored cover letters, STAR-method interview answers, and rewrites every bullet point to match JD keywords — saving hours per application.",
      color: "emerald",
      gradient: "from-emerald-500 to-teal-600",
      glowColor: "shadow-emerald-500/25",
      tags: ["Cover Letters", "STAR Answers", "Gap Analysis"],
      status: "Active",
      metric: "3x",
      metricLabel: "Faster Apps",
    },
    {
      id: "scraper",
      icon: <Search size={24} />,
      title: "Job Scraper Agent",
      subtitle: "Puppeteer Engine",
      description: "Headless Chromium engine that bypasses WAF protections across LinkedIn, Indeed, and Glassdoor. Extracts clean job details including hidden salary ranges.",
      color: "amber",
      gradient: "from-amber-500 to-orange-600",
      glowColor: "shadow-amber-500/25",
      tags: ["WAF Bypass", "UA Rotation", "Multi-Source"],
      status: "Active",
      metric: "50+",
      metricLabel: "Daily Jobs",
    },
    {
      id: "networking",
      icon: <Network size={24} />,
      title: "Networking Agent",
      subtitle: "Outreach Engine",
      description: "Generates contextual follow-ups, recruiter connection requests, and negotiation scripts tailored to your application stage with timing recommendations.",
      color: "blue",
      gradient: "from-blue-500 to-cyan-600",
      glowColor: "shadow-blue-500/25",
      tags: ["LinkedIn DM", "Email Templates", "Stage-Aware"],
      status: "Active",
      metric: "85%",
      metricLabel: "Response Rate",
    },
    {
      id: "referral",
      icon: <Globe size={24} />,
      title: "Referral Finder Agent",
      subtitle: "Graph Search",
      description: "Maps your LinkedIn and alumni network to identify 1st and 2nd-degree connections at target companies, then drafts highly personalized referral requests.",
      color: "rose",
      gradient: "from-rose-500 to-pink-600",
      glowColor: "shadow-rose-500/25",
      tags: ["Alumni Mapping", "Graph Search", "Warm Intros"],
      status: "Active",
      metric: "24/7",
      metricLabel: "Available",
    },
    {
      id: "research",
      icon: <BarChart3 size={24} />,
      title: "Research Agent",
      subtitle: "Tavily-Powered",
      description: "Powered by Tavily's advanced search API, this agent researches companies, industry trends, and salary benchmarks in real-time for interview prep.",
      color: "violet",
      gradient: "from-violet-500 to-purple-600",
      glowColor: "shadow-violet-500/25",
      tags: ["Real-time Search", "Salary Intel", "Company Insights"],
      status: "Active",
      metric: "100+",
      metricLabel: "Data Points",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; ring: string; glowColor: string; hoverBg: string; iconBg: string; iconBorder: string; edgeGlow: string }> = {
    indigo: { bg: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500/30", ring: "ring-indigo-500/20", glowColor: "shadow-indigo-500/25", hoverBg: "bg-gradient-to-br from-indigo-500/[0.04] to-indigo-600/[0.02]", iconBg: "bg-indigo-500/10", iconBorder: "border-indigo-500/20", edgeGlow: "via-indigo-500/50" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/30", ring: "ring-emerald-500/20", glowColor: "shadow-emerald-500/25", hoverBg: "bg-gradient-to-br from-emerald-500/[0.04] to-emerald-600/[0.02]", iconBg: "bg-emerald-500/10", iconBorder: "border-emerald-500/20", edgeGlow: "via-emerald-500/50" },
    amber: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/30", ring: "ring-amber-500/20", glowColor: "shadow-amber-500/25", hoverBg: "bg-gradient-to-br from-amber-500/[0.04] to-amber-600/[0.02]", iconBg: "bg-amber-500/10", iconBorder: "border-amber-500/20", edgeGlow: "via-amber-500/50" },
    blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/30", ring: "ring-blue-500/20", glowColor: "shadow-blue-500/25", hoverBg: "bg-gradient-to-br from-blue-500/[0.04] to-blue-600/[0.02]", iconBg: "bg-blue-500/10", iconBorder: "border-blue-500/20", edgeGlow: "via-blue-500/50" },
    rose: { bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500/30", ring: "ring-rose-500/20", glowColor: "shadow-rose-500/25", hoverBg: "bg-gradient-to-br from-rose-500/[0.04] to-rose-600/[0.02]", iconBg: "bg-rose-500/10", iconBorder: "border-rose-500/20", edgeGlow: "via-rose-500/50" },
    violet: { bg: "bg-violet-500", text: "text-violet-500", border: "border-violet-500/30", ring: "ring-violet-500/20", glowColor: "shadow-violet-500/25", hoverBg: "bg-gradient-to-br from-violet-500/[0.04] to-violet-600/[0.02]", iconBg: "bg-violet-500/10", iconBorder: "border-violet-500/20", edgeGlow: "via-violet-500/50" },
  };

  return (
    <div className="w-full overflow-hidden">
      {/* ===== Hero Section ===== */}
      <section className="relative flex min-h-[90vh] sm:min-h-[92vh] w-full items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <FallingPattern
            className="opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
            color="hsl(var(--primary))"
          />
        </div>
        <div className="absolute inset-x-0 top-0 z-0 h-80 bg-gradient-to-b from-indigo-500/10 via-background/60 to-transparent" />
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] z-0 animate-pulse pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] z-0 pointer-events-none" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 sm:px-5 pb-16 pt-24 sm:pt-20 sm:pb-20 text-center mt-8">
          <div className="animate-fade-up mb-8">
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium shadow-sm glass border border-indigo-500/20">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                AI-Powered Career Platform — Now in Beta
              </span>
            </div>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight animate-fade-up leading-[1.05] max-w-full mx-auto px-1 sm:px-2 break-words font-display"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-foreground">Your AI-Native </span>
            <br className="hidden sm:block md:hidden" />
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient py-2 inline-block min-w-[260px] sm:min-w-[320px] md:min-w-[500px]">
              <TypewriterText
                words={["Career Co-Pilot", "Resume Builder", "Interview Coach", "Job Tracker", "Networking Guide", "Cover Letter Generator", "Salary Predictor"]}
                typingSpeed={100}
                deletingSpeed={60}
                pauseDelay={2500}
                className="whitespace-nowrap"
              />
            </span>
          </h1>

          <p
            className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-up font-medium px-2 sm:px-0"
            style={{ animationDelay: "0.2s" }}
          >
            CareerForge AI brings together six specialized agents that optimize your resume,
            scrape jobs, coach you through interviews, and manage networking —
            so you land the right role without the grind.
          </p>

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
                Start Building — Free
                <ArrowRight size="16px" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-14 px-8 text-base font-semibold border-indigo-500/20 hover:bg-indigo-500/10 text-foreground transition-all duration-300 gap-2 rounded-xl glass"
            >
              <Link href="#how-it-works">
                Watch Demo
              </Link>
            </Button>
          </div>

          <div
            className="mt-12 sm:mt-16 grid w-full grid-cols-2 gap-3 sm:gap-4 rounded-xl sm:rounded-lg border bg-card/80 px-3 sm:px-4 py-5 sm:py-6 shadow-sm animate-fade-up sm:mt-20 sm:gap-8 sm:px-6 sm:py-8 md:grid-cols-4"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-foreground flex items-center">
                <AnimatedCounter target={10000} suffix="+" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium text-center">Resumes Created</p>
            </div>
            <div className="flex flex-col items-center justify-center border-l-0 sm:border-l sm:border-border/50">
              <div className="text-2xl sm:text-3xl font-black text-foreground flex items-center">
                <AnimatedCounter target={95} suffix="%" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium text-center">ATS Pass Rate</p>
            </div>
            <div className="flex flex-col items-center justify-center border-l-0 md:border-l border-border/50 pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-black text-foreground flex items-center">
                <AnimatedCounter target={500} suffix="+" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium text-center">Jobs Landed</p>
            </div>
            <div className="flex flex-col items-center justify-center border-l-0 sm:border-l sm:border-border/50 pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-1">
                <AnimatedCounter target={4} suffix=".9" />
                <Star className="fill-yellow-400 text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 ml-1" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium text-center">User Rating</p>
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

      {/* ===== Agentic AI Section — Premium Redesign ===== */}
      <section className="relative py-20 sm:py-28 md:py-36 px-4 sm:px-5 overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-indigo-950/[0.03] to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/[0.04] rounded-full blur-[200px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/[0.03] rounded-full blur-[180px] pointer-events-none" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* Floating Orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: [80, 120, 60, 100, 70, 90][i],
              height: [80, 120, 60, 100, 70, 90][i],
              left: ["10%", "70%", "30%", "80%", "15%", "60%"][i],
              top: ["20%", "60%", "80%", "30%", "50%", "10%"][i],
              background: [
                "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
              ][i],
            }}
            animate={{
              y: [0, -30, 0, 20, 0],
              x: [0, 15, -10, 5, 0],
              scale: [1, 1.1, 0.95, 1.05, 1],
            }}
            transition={{
              duration: [18, 22, 16, 20, 24, 19][i],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <div className="max-w-7xl mx-auto relative z-10">
          {/* ── Section Header ── */}
          <div className="text-center mb-16 sm:mb-20 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <LiveAgentPulse />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium border border-indigo-500/20 bg-indigo-500/5">
                <Workflow size={14} className="text-indigo-500" />
                <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                  Autonomous Agent Fleet
                </span>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 sm:mb-8 leading-[1.1]"
            >
              <span className="text-foreground">Your Personal </span>
              <span className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                AI Career Agents
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2"
            >
              Six specialized AI agents working in concert — each one a domain expert that automates
              a piece of your job search pipeline, from scraping to interviewing.
            </motion.p>
          </div>

          {/* ── Agent Pipeline Visualization ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12 sm:mb-16"
          >
            <PipelineVisualization agents={agents} colorMap={colorMap} />
          </motion.div>

          {/* ── Agent Cards Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {agents.map((agent, idx) => {
              const colors = colorMap[agent.color];
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="group relative"
                >
                  {/* Card */}
                  <div className={cn(
                    "relative h-full p-6 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all duration-500",
                    "bg-card/40 backdrop-blur-sm",
                    "hover:-translate-y-1.5 hover:shadow-2xl",
                    `hover:${colors.glowColor}`,
                    `hover:${colors.border}`,
                    "border-border/40",
                    "overflow-hidden"
                  )}>
                    {/* Hover Gradient Overlay */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                      colors.hoverBg
                    )} />

                    {/* Top Edge Glow on Hover */}
                    <div className={cn(
                      "absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      "bg-gradient-to-r from-transparent to-transparent",
                      colors.edgeGlow
                    )} />

                    {/* Animated corner accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl sm:rounded-tr-3xl pointer-events-none">
                      <motion.div
                        className={cn("absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-[0.07]", colors.bg)}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.07, 0.12, 0.07] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.5 }}
                      />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Header: Icon + Status */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="relative">
                          {/* Orbiting ring */}
                          <motion.div
                            className="absolute -inset-2 rounded-2xl border border-dashed opacity-0 group-hover:opacity-100"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            style={{ borderColor: `hsl(var(--${agent.color}-500, 217 91% 60%) / 0.2)` }}
                          />
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300",
                            colors.iconBg, colors.text, colors.iconBorder,
                            "group-hover:scale-110 group-hover:shadow-lg", colors.glowColor
                          )}>
                            <motion.div
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                              {agent.icon}
                            </motion.div>
                          </div>
                          {/* Floating dot */}
                          <motion.div
                            className={cn("absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background", colors.bg)}
                            animate={{ y: [0, -4, 0], scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("h-2 w-2 rounded-full animate-pulse", colors.bg)} />
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            {agent.status}
                          </span>
                        </div>
                      </div>

                      {/* Title + Subtitle */}
                      <div className="mb-3">
                        <h3 className="text-lg sm:text-xl font-black text-foreground mb-1 tracking-tight">
                          {agent.title}
                        </h3>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-[0.15em]",
                          colors.text
                        )}>
                          {agent.subtitle}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                        {agent.description}
                      </p>

                      {/* Metric Badge */}
                      <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-background/50 border border-border/30">
                        <div className={cn("text-2xl font-black", colors.text)}>
                          {agent.metric}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {agent.metricLabel}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {agent.tags.map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-semibold",
                              "bg-background/60 border border-border/40 text-muted-foreground",
                              "transition-colors duration-200 group-hover:border-border/60"
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Pipeline Summary ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 sm:mt-20"
          >
            <div className="relative p-8 sm:p-10 rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.02] via-purple-500/[0.02] to-cyan-500/[0.02] pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                {/* Left: Info */}
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3">
                    Unified Pipeline Intelligence
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                    All agents share context through a unified pipeline — your resume data flows seamlessly
                    from optimization → scraping → application → networking → interview prep.
                    Each agent learns from the others to compound your advantage.
                  </p>
                </div>

                {/* Right: CTA */}
                <div className="shrink-0">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-sm font-bold bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 hover:from-indigo-600 hover:via-blue-600 hover:to-cyan-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 gap-2 rounded-xl"
                  >
                    <Link href="/sign-up">
                      <Bot size={16} />
                      Deploy Your Agent Fleet
                      <ArrowRight size={14} />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Bottom Stats */}
              <div className="relative z-10 mt-8 pt-6 border-t border-border/30 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { value: "6", label: "Active Agents", icon: <Bot size={14} className="text-indigo-500" /> },
                  { value: "24/7", label: "Always Running", icon: <Zap size={14} className="text-amber-500" /> },
                  { value: "<2s", label: "Avg Response", icon: <Sparkles size={14} className="text-emerald-500" /> },
                  { value: "100%", label: "Context Shared", icon: <Network size={14} className="text-blue-500" /> },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background/50 border border-border/30">
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-lg font-black text-foreground">{stat.value}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                  className={`text-left p-6 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${activeTab === tab.id
                    ? "border-indigo-500/30 bg-indigo-500/5 shadow-lg shadow-indigo-500/5 glass"
                    : "border-border/45 hover:border-border/80 hover:bg-card/20 bg-transparent"
                    }`}
                >
                  <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 ${activeTab === tab.id
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

            <div className="lg:col-span-8 min-h-[400px] sm:h-[520px] rounded-2xl sm:rounded-3xl border border-border/50 bg-card/20 glass p-4 sm:p-8 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

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

                  <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 pr-1 sm:pr-2 py-1 sm:py-2 max-h-[200px] sm:max-h-[260px] scrollbar-thin">
                    {[
                      { role: "Host (Voice A)", text: "Hey everyone! Today we're diving into Parth's profile. He's a Full-Stack Dev with huge React experience, especially in building high-performance web systems.", active: true },
                      { role: "Candidate (Voice B)", text: "That's right! I focus on making apps responsive, visually outstanding, and fully ATS-friendly. The layout optimization is where it really shines.", active: false },
                      { role: "Host (Voice A)", text: "Awesome! And I noticed you built custom web apps with real-time speech components too. That's a massive differentiator.", active: false }
                    ].map((line, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border transition-all duration-300 ${line.active
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
                    <div className="md:col-span-6 h-56 rounded-2xl border border-border bg-black/60 relative overflow-hidden flex flex-col items-center justify-center group shadow-xl">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)] pointer-events-none" />
                      <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 animate-pulse">
                        <Video size={28} />
                      </div>
                      <span className="text-xs text-white/50 font-bold uppercase tracking-wider mt-3">Web-Cam Live Feed</span>
                      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-semibold text-white/80">
                        <span>USER CAMERA</span>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:text-white transition-colors"><Mic size={12} /></button>
                          <button className="p-1 hover:text-white transition-colors"><VolumeX size={12} /></button>
                        </div>
                      </div>
                    </div>

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
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-indigo-500/30 to-transparent" />
                )}
                <div className="relative p-8 rounded-3xl border bg-gradient-to-br from-background to-card/50 hover:from-card/80 hover:to-background transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-border/50">
                  <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-${item.color}-500/30`}>
                    {item.step}
                  </div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${item.color}-500/10 to-${item.color}-600/10 border border-${item.color}-500/20 flex items-center justify-center mb-6`}>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                description: "Perfect for getting started with AI-powered career tools.",
                price: { monthly: 0, yearly: 0 },
                features: ["1 AI-optimized resume", "Basic ATS templates", "1 AI podcast generation", "1 mock interview session", "Basic job tracking"],
                cta: "Get Started Free",
                popular: false,
                href: "/sign-up",
                color: "indigo",
              },
              {
                name: "Pro",
                description: "For serious job seekers who want maximum impact.",
                price: { monthly: 19, yearly: 15 },
                features: ["Unlimited AI resumes", "Full ATS job scraper", "Unlimited podcast generations", "Unlimited mock interviews", "Real-time market analytics", "Priority AI processing"],
                cta: "Upgrade to Pro",
                popular: true,
                href: "/sign-up",
                color: "rose",
              },
              {
                name: "Executive",
                description: "Premium features for senior professionals and executives.",
                price: { monthly: 49, yearly: 39 },
                features: ["Everything in Pro", "Custom industry datasets", "1-on-1 strategy reviews", "Priority support", "Advanced networking tools", "API access"],
                cta: "Get Executive",
                popular: false,
                href: "/sign-up",
                color: "purple",
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col justify-between p-8 rounded-3xl border transition-all duration-300 group hover:-translate-y-1 bg-gradient-to-br from-background to-card/30 ${plan.popular
                  ? "border-rose-500/40 shadow-xl shadow-rose-500/10 ring-1 ring-rose-500/20 scale-[1.02] z-10"
                  : "border-border/50 hover:border-border/80"
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full border border-rose-400/30 shadow-md">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-2xl text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-border/50">
                    <span className="text-5xl font-black text-foreground">${billingPeriod === "monthly" ? plan.price.monthly : plan.price.yearly}</span>
                    <span className="text-lg font-semibold text-muted-foreground">/mo</span>
                    {billingPeriod === "yearly" && plan.price.yearly > 0 && (
                      <span className="text-xs text-muted-foreground ml-2 font-mono font-bold">Billed annually</span>
                    )}
                  </div>
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
                    className={`w-full h-14 rounded-xl text-sm font-bold shadow-md transition-all duration-300 ${plan.popular
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

      {/* ===== FAQ Section ===== */}
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
          <div className="space-y-4">
            {[
              { q: "How does the ATS URL Scraper bypass security blocks?", a: "Our job listing scraper is engineered using custom browser headers, automated user-agent rotation, and network delay strategies that emulate authentic browser requests. This allows the system to bypass basic Web Application Firewalls (WAF) to extract clean job details from LinkedIn, Indeed, and corporate boards safely." },
              { q: "Is my private resume data shared or public?", a: "No. Security is built into the core. All resumes created on CareerForge are linked to your personal Clerk authentication context. If your resume status is set to 'private', it is completely hidden from public access. When generating a PDF, our Puppeteer print engine securely requests the document with a temporary cryptographically hashed `pdfSecret` derived from the application secret key to ensure access is only granted to the printing engine." },
              { q: "How does the AI Podcast Resume voice generation work?", a: "The podcast engine analyzes your work history, experience bullets, and career summary to write a structured conversation script containing HOST (Voice A) and CANDIDATE (Voice B) dialogue lines. It then sequentially invokes local speech synthesis engines, applying tailored voice pitch and rates to simulate a live conversational style audio player." },
              { q: "Can I cancel my Pro plan at any time?", a: "Yes. There are no locking contracts or cancellation fees. You can cancel your subscription inside your billing settings at any time with a single click. You will retain access to all Pro features until the end of your current billing cycle." },
              { q: "Does the builder support custom resume formats and spacing?", a: "Absolutely. Our builder features a high-fidelity drag-and-drop section ordering editor, a custom layout spacing builder (paddings, margins, grid gaps), and visual theme colors (primary accents, text tones) so you can create a layout tailored to your style." }
            ].map((item, idx) => (
              <div key={idx} className="border border-border/50 rounded-2xl overflow-hidden bg-card/30 glass transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-card/50 transition-colors"
                >
                  <span className="font-bold text-base md:text-lg text-foreground pr-4">{item.q}</span>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 border border-indigo-500/20 shrink-0 transition-transform duration-300">
                    {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === idx ? "max-h-60 opacity-100 border-t border-border/50" : "max-h-0 opacity-0"}`}>
                  <p className="p-6 text-sm md:text-base leading-relaxed text-muted-foreground font-semibold bg-background/20">{item.a}</p>
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
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
            <FallingPattern className="absolute inset-0 opacity-20" color="rgba(255,255,255,0.5)" backgroundColor="transparent" />
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
                Ready to transform<br />your career?
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                Join thousands of professionals who have already accelerated their careers with AI-powered tools. Start building your future today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-14 px-10 text-base font-bold bg-white text-indigo-600 hover:bg-white/90 shadow-xl shadow-black/20 transition-all duration-300 gap-2 rounded-xl w-full sm:w-auto">
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
            <div className="flex items-center gap-3 mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-lg group-hover:bg-indigo-500/30 transition-all duration-500" />
                <Image src="/CareerForge_ai_final.png" alt="CareerForge AI Logo" width={40} height={40} className="relative group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-indigo-500 to-indigo-400 bg-clip-text text-transparent">CareerForge AI</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-6">
              CareerForge AI brings together six specialized agents that optimize your resume, scrape jobs, coach you through interviews, and manage networking — so you land the right role without the grind.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.linkedin.com/in/himanshu-guptaa" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"><Linkedin size={18} /></a>
              <a href="https://www.github.com/devhimanshuu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"><Github size={18} /></a>
              <a href="https://himanshuguptaa.vercel.app" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"><Globe size={18} /></a>
              <a href="https://x.com/devhimanshuu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"><Twitter size={18} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-indigo-500 transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-indigo-500 transition-colors">Pricing</Link></li>
              <li><Link href="#how-it-works" className="hover:text-indigo-500 transition-colors">How It Works</Link></li>
              <li><Link href="#faq" className="hover:text-indigo-500 transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-indigo-500 transition-colors">Templates</Link></li>
              <li><Link href="#how-it-works" className="hover:text-indigo-500 transition-colors">Interview Prep</Link></li>
              <li><Link href="#faq" className="hover:text-indigo-500 transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-indigo-500 transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-indigo-500 transition-colors">About</Link></li>
              <li><Link href="#pricing" className="hover:text-indigo-500 transition-colors">Pricing</Link></li>
              <li><Link href="/privacy" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} CareerForge AI. All rights reserved.</p>
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
