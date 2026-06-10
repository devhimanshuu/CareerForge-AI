"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  X,
  Layout,
  Palette,
  Ruler,
  Settings2,
  FileText,
  Target,
  Languages,
  DownloadCloud,
  ShareIcon,
  Sparkles,
  TrendingUp,
  Zap,
  Bot,
  Compass,
  Flame,
  Headphones,
  Terminal as TerminalIcon,
  Smartphone,
  DollarSign,
  Clock,
  Eye,
  ShieldCheck,
  BookOpen,
  MessageSquare,
  Crown,
  Search,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import TemplateSelector from "./TemplateSelector";
import ThemeColor from "./ThemeColor";
import AutoPageFit from "./AutoPageFit";
import CustomLayoutBuilder from "./CustomLayoutBuilder";
import CoverLetterGenerator from "./CoverLetterGenerator";
import AtsMatcher from "./AtsMatcher";
import LanguageTranslator from "./LanguageTranslator";
import { LinkedInImport } from "../LinkedInImport";
import GithubSync from "./GithubSync";
import LeetCodeSync from "./LeetCodeSync";
import Download from "./Download";
import Share from "./Share";
import MoreOption from "./MoreOption";
import AutoTailorEngine from "./AutoTailorEngine";
import InterviewPrepAssistant from "./InterviewPrepAssistant";
import SkillGapAnalyzer from "./SkillGapAnalyzer";
import AttentionHeatmap from "./AttentionHeatmap";
import LiarDetector from "./LiarDetector";
import InterviewCheatSheet from "./InterviewCheatSheet";
import ResumeImport from "./ResumeImport";
import SalaryEstimator from "./SalaryEstimator";
import CareerFortuneTeller from "./CareerFortuneTeller";
import PodcastResume from "./PodcastResume";
import RecruiterRoast from "./RecruiterRoast";
import TimeTraveler from "./TimeTraveler";
import DigitalWalletCard from "./DigitalWalletCard";
import TerminalEditor from "./TerminalEditor";
import { useResumeContext } from "@/context/resume-info-provider";
import { useSidebar } from "@/context/sidebar-context";

interface FeaturePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeatureDef {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  category: string;
  trigger: React.ReactNode;
}

const CATEGORIES = [
  { id: "all", label: "All", icon: <Crown size={11} /> },
  { id: "ai", label: "AI Studio", icon: <Sparkles size={11} /> },
  { id: "market", label: "Market", icon: <TrendingUp size={11} /> },
  { id: "design", label: "Design", icon: <Palette size={11} /> },
  { id: "content", label: "Content", icon: <FileText size={11} /> },
  { id: "import", label: "Import", icon: <DownloadCloud size={11} /> },
  { id: "export", label: "Export", icon: <ShareIcon size={11} /> },
] as const;

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  ai: { label: "AI Studio", icon: <Sparkles size={12} />, color: "text-indigo-500" },
  market: { label: "Market & Trends", icon: <TrendingUp size={12} />, color: "text-teal-500" },
  design: { label: "Design", icon: <Palette size={12} />, color: "text-amber-500" },
  content: { label: "Content", icon: <FileText size={12} />, color: "text-blue-500" },
  import: { label: "Import", icon: <DownloadCloud size={12} />, color: "text-emerald-500" },
  export: { label: "Export & Share", icon: <ShareIcon size={12} />, color: "text-violet-500" },
};

/* ── FeatureItem ── */
function FeatureItem({
  feature,
  index,
  onCollapseSidebar,
}: {
  feature: FeatureDef;
  index: number;
  onCollapseSidebar: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3, ease: "easeOut" }}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-all duration-200 group border border-transparent hover:border-border/40 hover:shadow-sm"
      onClick={() => {
        // Collapse sidebar after a tick so the trigger's dialog/popover can mount first
        requestAnimationFrame(() => onCollapseSidebar());
      }}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm",
          feature.bgColor,
          feature.color
        )}
      >
        {feature.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold truncate leading-tight">{feature.title}</p>
        <p className="text-[10px] text-muted-foreground truncate leading-relaxed">
          {feature.description}
        </p>
      </div>
      <div className="shrink-0 flex items-center">
        {feature.trigger}
      </div>
    </motion.div>
  );
}

/* ── Main Panel ── */
const FeaturePanel = ({ isOpen, onClose }: FeaturePanelProps) => {
  const { resumeInfo } = useResumeContext();
  const { collapsed, setCollapsed } = useSidebar();
  const [showTerminal, setShowTerminal] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const searchRef = useRef<HTMLInputElement>(null);

  /* Keyboard: Escape to close, / to focus search */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setActiveCategory("all");
      setTimeout(() => searchRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const features: FeatureDef[] = useMemo(
    () => [
      { id: "auto-tailor", icon: <Zap size={16} />, title: "Auto-Tailor", description: "Optimize for specific job posts", color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-500/10", category: "ai", trigger: <AutoTailorEngine /> },
      { id: "interview-prep", icon: <Bot size={16} />, title: "Interview Prep", description: "AI-generated mock interview", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-500/10", category: "ai", trigger: <InterviewPrepAssistant /> },
      { id: "skill-gap", icon: <Target size={16} />, title: "Skill Gap", description: "Analyze missing requirements", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10", category: "ai", trigger: <SkillGapAnalyzer /> },
      { id: "mind-reader", icon: <Eye size={16} />, title: "Mind-Reader", description: "Recruiter attention heatmap", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-500/10", category: "ai", trigger: <AttentionHeatmap /> },
      { id: "liar-detector", icon: <ShieldCheck size={16} />, title: "Liar Detector", description: "AI-driven veracity audit", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-500/10", category: "ai", trigger: <LiarDetector /> },
      { id: "cheat-sheet", icon: <BookOpen size={16} />, title: "Cheat Sheet", description: "Company-specific prep dossier", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-500/10", category: "ai", trigger: <InterviewCheatSheet /> },
      { id: "salary", icon: <DollarSign size={16} />, title: "Salary Estimate", description: "Real-world market rates", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-500/10", category: "market", trigger: <SalaryEstimator /> },
      { id: "career-paths", icon: <Compass size={16} />, title: "Career Paths", description: "Predictive role trajectories", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-500/10", category: "market", trigger: <CareerFortuneTeller /> },
      { id: "podcast", icon: <Headphones size={16} />, title: "Podcast Resume", description: "2-min AI interview podcast", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10", category: "market", trigger: <PodcastResume /> },
      { id: "roast", icon: <Flame size={16} />, title: "Resume Roast", description: "Brutally honest AI critique", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-500/10", category: "market", trigger: <RecruiterRoast /> },
      { id: "time-traveler", icon: <Clock size={16} />, title: "Time-Traveler", description: "See your resume in 2030", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-500/10", category: "market", trigger: <TimeTraveler /> },
      { id: "digital-card", icon: <Smartphone size={16} />, title: "Digital Card", description: "Add resume to Mobile Wallet", color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-500/10", category: "market", trigger: <DigitalWalletCard /> },
      { id: "templates", icon: <Layout size={16} />, title: "Templates", description: "Switch resume layout style", color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-500/10", category: "design", trigger: <TemplateSelector /> },
      { id: "theme-color", icon: <Palette size={16} />, title: "Theme Color", description: "Customize accent color", color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-50 dark:bg-pink-500/10", category: "design", trigger: <ThemeColor /> },
      { id: "auto-fit", icon: <Ruler size={16} />, title: "AI Perfect Fit", description: "Auto-optimize for one page", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10", category: "design", trigger: <AutoPageFit /> },
      { id: "custom-layout", icon: <Settings2 size={16} />, title: "Custom Layout", description: "Design your own architecture", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10", category: "design", trigger: <CustomLayoutBuilder /> },
      { id: "hacker-mode", icon: <TerminalIcon size={16} />, title: "Hacker Mode", description: "Build resume via Terminal", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-500/10", category: "design", trigger: (
        <button onClick={() => setShowTerminal(true)} className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all duration-200">
          Open <ArrowRight size={10} />
        </button>
      ) },
      { id: "cover-letter", icon: <FileText size={16} />, title: "Cover Letter", description: "AI-generated cover letters", color: "text-primary", bgColor: "bg-primary/5", category: "content", trigger: <CoverLetterGenerator /> },
      { id: "ats-match", icon: <Target size={16} />, title: "ATS Match", description: "Score against job descriptions", color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-500/10", category: "content", trigger: <AtsMatcher /> },
      { id: "translate", icon: <Languages size={16} />, title: "Translate", description: "Localize to 6 languages", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-500/10", category: "content", trigger: <LanguageTranslator /> },
      { id: "linkedin", icon: <MessageSquare size={16} />, title: "LinkedIn", description: "Import from LinkedIn profile", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-500/10", category: "import", trigger: <LinkedInImport /> },
      { id: "github", icon: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>), title: "GitHub", description: "Sync repositories as experience", color: "text-slate-700 dark:text-slate-300", bgColor: "bg-slate-100 dark:bg-slate-500/10", category: "import", trigger: <GithubSync /> },
      { id: "leetcode", icon: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-500"><path d="M16.102 17.03l1.475-5.402h-1.28l-.815 3.195-.655-3.195H14l1.475 5.402h.627zm3.025-5.402l.52 1.728h1.56l-2.64-7.348h-1.68l-2.62 7.348h1.52l.52-1.728h2.82zm-1.835-2.068l-.625-2.068h-.06l-.625 2.068h1.31zM9.39 11.81l.52 1.728h1.56L8.85 6.19h-1.68L4.55 13.538h1.52l.52-1.728H9.39zm-1.835-2.068l-.625-2.068h-.06l-.625 2.068h1.31z" /></svg>), title: "LeetCode", description: "Import solve stats & skills", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10", category: "import", trigger: <LeetCodeSync /> },
      { id: "import-resume", icon: <FileText size={16} />, title: "Import Resume", description: "Upload existing resume file", color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-500/10", category: "import", trigger: <ResumeImport /> },
      { id: "download-pdf", icon: <DownloadCloud size={16} />, title: "Download PDF", description: "Export as high-quality PDF", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-500/10", category: "export", trigger: <Download title={resumeInfo?.title || "Untitled Resume"} status={resumeInfo?.status} isLoading={false} /> },
      { id: "share", icon: <ShareIcon size={16} />, title: "Share Portfolio", description: "Publish & share your resume", color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-500/10", category: "export", trigger: <Share /> },
      { id: "more", icon: <Settings2 size={16} />, title: "More Options", description: "Branch, trash & more", color: "text-muted-foreground", bgColor: "bg-muted", category: "export", trigger: <MoreOption /> },
    ],
    [resumeInfo]
  );

  const filtered = useMemo(() => {
    let list = features;
    if (activeCategory !== "all") {
      list = list.filter((f) => f.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) => f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [features, activeCategory, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, FeatureDef[]>();
    for (const f of filtered) {
      if (!map.has(f.category)) map.set(f.category, []);
      map.get(f.category)!.push(f);
    }
    return map;
  }, [filtered]);

  return (
    <>
      <AnimatePresence>
        {showTerminal && <TerminalEditor onClose={() => setShowTerminal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90] bg-black/20"
              onClick={onClose}
            />

            <motion.div
              initial={{ x: "-100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed top-0 left-0 bottom-0 z-[95] w-full max-w-sm bg-background border-r border-border shadow-2xl flex flex-col"
            >
              {/* ── Header ── */}
              <div className="px-5 pt-5 pb-0 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                      className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25"
                    >
                      <Crown size={17} className="text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-sm font-black tracking-tight">All Tools</h2>
                      <p className="text-[10px] text-muted-foreground font-bold">
                        {filtered.length} tool{filtered.length !== 1 ? "s" : ""} available
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-muted transition-colors"
                  >
                    <X size={16} />
                  </motion.button>
                </div>

                {/* ── Search Bar ── */}
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tools… ( / )"
                    className="w-full h-9 pl-9 pr-9 rounded-xl bg-muted/50 border border-border/50 text-xs font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-muted/80 transition-colors">
                      <X size={12} className="text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* ── Category Tabs ── */}
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-3 -mx-1 px-1">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-200 shrink-0",
                          isActive
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border/50"
                        )}
                      >
                        {cat.icon}
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-border/50 mx-5 shrink-0" />

              {/* ── Content ── */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
                {filtered.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                      <Search size={22} className="text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">No tools found</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Try a different search or category</p>
                  </motion.div>
                ) : (
                  <div className="space-y-5">
                    {Array.from(grouped.entries()).map(([catId, catFeatures], groupIdx) => {
                      const meta = CATEGORY_META[catId];
                      if (!meta) return null;
                      return (
                        <motion.div
                          key={catId}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: groupIdx * 0.05, duration: 0.3 }}
                          className="space-y-1.5"
                        >
                          <div className="flex items-center gap-2 px-1 mb-1">
                            <span className={cn("shrink-0", meta.color)}>{meta.icon}</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">{meta.label}</p>
                            <div className="flex-1 h-px bg-border/30" />
                            <span className="text-[9px] font-bold text-muted-foreground/40 tabular-nums">{catFeatures.length}</span>
                          </div>
                          <div className="space-y-0.5">
                            {catFeatures.map((feature, idx) => (
                              <FeatureItem key={feature.id} feature={feature} index={groupIdx * 5 + idx} onCollapseSidebar={() => { if (!collapsed) setCollapsed(true); }} />
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              <div className="px-5 py-3 border-t border-border/50 shrink-0">
                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
                  <Sparkles size={10} className="text-indigo-500" />
                  CareerForge AI — 25+ tools
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeaturePanel;
