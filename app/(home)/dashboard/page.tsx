"use client";

import React, { useMemo } from "react";
import AddResume from "../_components/AddResume";
import ResumeList from "../_components/ResumeList";
import TrashListBox from "../_components/TrashListBox";
import {
  Sparkles,
  FileText,
  TrendingUp,
  Zap,
  Bot,
  ArrowRight,
  BarChart3,
  Briefcase,
  Clock,
  Search,
  Globe,
  DollarSign,
  Linkedin,
  SplitSquareHorizontal,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRightCircle,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import useGetDocuments from "@/features/document/use-get-document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ResumeImport from "../_components/common/ResumeImport";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const Page = () => {
  const { user } = useUser();
  const { data, isLoading } = useGetDocuments();
  const [apps, setApps] = React.useState<any[]>([]);
  const [isAppsLoading, setIsAppsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<"all" | "public" | "private">("all");

  const [coachData, setCoachData] = React.useState<any>(null);
  const [isCoachLoading, setIsCoachLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedResumeId, setSelectedResumeId] = React.useState<string | null>(null);
  const [newInsights, setNewInsights] = React.useState(0);

  const resumes = useMemo(() => {
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  React.useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch("/api/application/all");
        const json = await res.json();
        if (json.success) setApps(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsAppsLoading(false);
      }
    };
    fetchApps();
  }, []);

  React.useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch("/api/automation/insights");
        if (res.ok) {
          const json = await res.json();
          const count = (json.insights || []).filter((item: { status: string }) => item.status === "new").length;
          setNewInsights(count);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInsights();
  }, []);

  React.useEffect(() => {
    if (resumes.length > 0) {
      const exists = resumes.some((r) => r.documentId === selectedResumeId);
      if (!exists) setSelectedResumeId(resumes[0].documentId);
    } else {
      setSelectedResumeId(null);
    }
  }, [resumes, selectedResumeId]);

  React.useEffect(() => {
    const fetchCoachData = async () => {
      if (resumes.length > 0 && !selectedResumeId) return;
      setIsCoachLoading(true);
      try {
        const queryParam = selectedResumeId ? `?documentId=${selectedResumeId}` : "";
        const res = await fetch(`/api/ai/career-coach${queryParam}`);
        if (res.ok) {
          const json = await res.json();
          setCoachData(json);
        } else {
          setCoachData(null);
        }
      } catch (err) {
        console.error("Failed to fetch coach data:", err);
        setCoachData(null);
      } finally {
        setIsCoachLoading(false);
      }
    };
    if (!isLoading) fetchCoachData();
  }, [selectedResumeId, resumes.length, apps.length, isLoading]);

  const resumeCount = resumes.length;
  const publicCount = resumes.filter((r) => r?.status === "public").length;

  const [currentTime, setCurrentTime] = React.useState(() => new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const { greeting, emoji } = React.useMemo(() => {
    const h = currentTime.getHours();
    if (h < 5) return { greeting: "Good night", emoji: "🌙" };
    if (h < 12) return { greeting: "Good morning", emoji: "☀️" };
    if (h < 17) return { greeting: "Good afternoon", emoji: "🌤️" };
    if (h < 21) return { greeting: "Good evening", emoji: "🌆" };
    return { greeting: "Good night", emoji: "🌙" };
  }, [currentTime]);

  const successRate = apps.length > 0
    ? Math.round((apps.filter((a) => ["interviewing", "offer"].includes(a.status)).length / apps.length) * 100)
    : 0;

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1400px] mx-auto px-6 py-8 space-y-8"
      >
        {/* ── Welcome Header & Global Actions ── */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent blur-2xl -z-10 rounded-full" />
            <p className="text-sm text-muted-foreground font-medium mb-1">{greeting}, {user?.firstName || "there"} {emoji}</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
              Command Center
            </h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium max-w-xl">
              Your AI-powered career OS. Optimize resumes, simulate negotiations, and launch stunning portfolios from one unified hub.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ResumeImport />
            <TrashListBox />
          </div>
        </motion.div>

        {/* ── Bento Grid Layer 1: Core AI & Metrics ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* AI Coach Panel (Span 7) */}
          <motion.div variants={itemVariants} className="md:col-span-12 lg:col-span-7 flex flex-col">
            <div className="flex-1 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transition-transform group-hover:scale-110" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Sparkles size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">AI Career Coach</h3>
                    <p className="text-xs text-muted-foreground">Real-time market alignment</p>
                  </div>
                </div>
                
                {resumes.length > 0 && (
                  <Select value={selectedResumeId || undefined} onValueChange={(val) => setSelectedResumeId(val)}>
                    <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl bg-background/50 backdrop-blur-md border-border/50">
                      <SelectValue placeholder="Select resume..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {resumes.map((r: any) => (
                        <SelectItem key={r.documentId} value={r.documentId} className="text-xs rounded-lg">
                          {r.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="bg-background/40 border border-border/40 rounded-2xl p-4 font-mono text-xs text-muted-foreground leading-relaxed min-h-[80px] mb-6 relative z-10 flex items-start shadow-inner">
                <span className="text-indigo-500 font-bold mr-2 mt-0.5">&gt;</span>
                {isCoachLoading ? (
                  <span className="text-indigo-400 animate-pulse">Analyzing market data and indexing your profile...</span>
                ) : (
                  <span className="text-foreground/80">{coachData?.consoleMessage || "Create your first resume to activate AI insights."}</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                <MiniStat value={resumeCount.toString()} label="Resumes" icon={<FileText size={14}/>} />
                <MiniStat value={publicCount.toString()} label="Published" icon={<TrendingUp size={14}/>} />
                <MiniStat value={apps.length.toString()} label="Applications" icon={<Briefcase size={14}/>} />
                <MiniStat value={`${successRate}%`} label="Success Rate" icon={<Zap size={14}/>} />
              </div>

              <Button
                onClick={() => setIsModalOpen(true)}
                disabled={isCoachLoading || !coachData}
                className="w-full mt-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl gap-2 shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 relative z-10"
              >
                <Bot size={16} />
                Launch Full Diagnostics
              </Button>
            </div>
          </motion.div>

          {/* The Forge: Quick Tools Grid (Span 5) */}
          <motion.div variants={itemVariants} className="md:col-span-12 lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1 px-1">
              <Zap size={16} className="text-amber-500" />
              <h3 className="text-sm font-bold text-foreground">The Forge</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1">
              <ToolCard 
                href="/dashboard/linkedin-optimizer" 
                icon={<Linkedin size={20} />} 
                title="LinkedIn SEO" 
                color="text-blue-500" 
                bg="bg-blue-500/10" 
                border="group-hover:border-blue-500/50"
              />
              <ToolCard 
                href="/dashboard/salary-simulator" 
                icon={<DollarSign size={20} />} 
                title="Negotiation" 
                color="text-emerald-500" 
                bg="bg-emerald-500/10" 
                border="group-hover:border-emerald-500/50"
              />
              <ToolCard 
                href="/dashboard/portfolio-settings" 
                icon={<Globe size={20} />} 
                title="Portfolios" 
                color="text-purple-500" 
                bg="bg-purple-500/10" 
                border="group-hover:border-purple-500/50"
              />
              <ToolCard 
                href="/dashboard/ab-testing" 
                icon={<SplitSquareHorizontal size={20} />} 
                title="A/B Tests" 
                color="text-amber-500" 
                bg="bg-amber-500/10" 
                border="group-hover:border-amber-500/50"
              />
            </div>

            {newInsights > 0 && (
              <Link
                href="/dashboard/automation"
                className="mt-2 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 transition-all hover:bg-amber-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
                    <Bot size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400">{newInsights} Insights Ready</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-amber-600" />
              </Link>
            )}
          </motion.div>

        </div>

        {/* ── Bento Grid Layer 2: Pipelines & Documents ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Documents (Span 8) */}
          <motion.div variants={itemVariants} className="xl:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-1">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-muted-foreground" />
                <h2 className="text-base font-bold text-foreground">Your Documents</h2>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">{resumeCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 w-48 text-xs rounded-xl bg-background/50 border-border/60 focus-visible:ring-1 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="flex rounded-lg bg-background/50 p-0.5 border border-border/60">
                  {(["all", "public", "private"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilterStatus(tab)}
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                        filterStatus === tab ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AddResume />
              <ResumeList searchQuery={searchQuery} filterStatus={filterStatus} />
            </div>
          </motion.div>

          {/* Active Pipeline (Span 4) */}
          <motion.div variants={itemVariants} className="xl:col-span-4 flex flex-col h-full">
            <div className="flex items-center justify-between p-1 mb-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <h3 className="text-base font-bold text-foreground">Active Pipeline</h3>
              </div>
              <Link href="/dashboard/applications" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-wider transition-colors">
                View All
              </Link>
            </div>

            <div className="flex-1 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md p-2 flex flex-col">
              {isAppsLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 rounded-2xl bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : apps.length === 0 ? (
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Briefcase size={20} className="text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-bold text-foreground">No active applications</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Start tracking jobs on the Kanban board to see them here.</p>
                  <Button asChild variant="outline" size="sm" className="mt-4 rounded-xl text-xs h-8">
                    <Link href="/dashboard/applications">Open Tracker</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5 p-1 flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
                  {apps.slice(0, 6).map((app: any) => (
                    <Link href={`/dashboard/applications`} key={app.id}>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 group">
                        <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          <Briefcase size={16} className="text-foreground/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate group-hover:text-indigo-500 transition-colors">{app.jobTitle}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{app.company}</p>
                        </div>
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border",
                          app.status === "applied" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                          app.status === "interviewing" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                          app.status === "offer" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          "bg-muted/50 text-muted-foreground border-transparent"
                        )}>
                          {app.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* AI Career Coach Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-indigo-500/20 p-8 custom-scrollbar bg-background/95 backdrop-blur-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={22} />
              AI Career Diagnostic
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Deep alignment analysis of your resume against real-time market data.
            </DialogDescription>
          </DialogHeader>

          {coachData ? (
            <div className="space-y-6 mt-6">
              {/* Score */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-3xl bg-muted/30 border border-border/50">
                <div className="relative size-24 shrink-0 mx-auto sm:mx-0">
                  <svg className="w-full h-full -rotate-90 drop-shadow-md">
                    <circle cx="48" cy="48" r="42" className="stroke-muted/30" strokeWidth="8" fill="transparent" />
                    <motion.circle
                      cx="48" cy="48" r="42"
                      className="stroke-indigo-500"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray="264"
                      initial={{ strokeDashoffset: 264 }}
                      animate={{ strokeDashoffset: 264 - (264 * coachData.marketScore) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut", type: "spring" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-black">{coachData.marketScore}%</span>
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-lg font-bold flex items-center justify-center sm:justify-start gap-2">
                    Market Competitiveness
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {coachData.marketStatus}
                    </span>
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{coachData.marketSalaryInsights}</p>
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Core Strengths
                  </h5>
                  <ul className="space-y-2">
                    {coachData.strengths?.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-foreground/80 flex gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                    <AlertTriangle size={14} /> Critical Gaps
                  </h5>
                  <ul className="space-y-2">
                    {coachData.gaps?.map((g: string, i: number) => (
                      <li key={i} className="text-sm text-foreground/80 flex gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />{g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <ArrowRightCircle size={14} /> Immediate Action Items
                </h5>
                <ul className="space-y-2.5">
                  {coachData.recommendations?.map((r: string, i: number) => (
                    <li key={i} className="text-sm text-foreground/90 flex gap-3 bg-background/50 p-3 rounded-xl border border-border/50">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</span>
                      <span className="pt-0.5">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground animate-pulse">
              Generating your personalized career diagnostic...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ── Tool Card ── */
function ToolCard({ href, icon, title, color, bg, border }: { href: string; icon: React.ReactNode; title: string; color: string; bg: string, border: string }) {
  return (
    <Link href={href} className="group">
      <div className={cn("h-full rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:-translate-y-1", border)}>
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", bg, color)}>
          {icon}
        </div>
        <h4 className="text-xs font-bold text-foreground text-center">{title}</h4>
      </div>
    </Link>
  );
}

/* ── Mini Stat ── */
function MiniStat({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="bg-background/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-1 hover:bg-muted/50 transition-colors">
      <div className="text-muted-foreground">{icon}</div>
      <p className="text-lg font-black text-foreground leading-none mt-1">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

export default Page;
