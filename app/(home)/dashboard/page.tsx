"use client";

import React, { useMemo } from "react";
import AddResume from "../_components/AddResume";
import ResumeList from "../_components/ResumeList";
import TrashListBox from "../_components/TrashListBox";
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  TrendingUp,
  Zap,
  Bot,
  ArrowRight,
  BarChart3,
  Briefcase,
  Target,
  Clock,
  Star,
  Search,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import useGetDocuments from "@/features/document/use-get-document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ResumeImport from "../_components/common/ResumeImport";
import { PremiumPage } from "@/components/ui/premium-page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, ArrowRightCircle } from "lucide-react";
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
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const Page = () => {
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
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
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
      if (!exists) {
        setSelectedResumeId(resumes[0].documentId);
      }
    } else {
      setSelectedResumeId(null);
    }
  }, [resumes, selectedResumeId]);

  React.useEffect(() => {
    const fetchCoachData = async () => {
      if (resumes.length > 0 && !selectedResumeId) {
        return;
      }
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
    
    if (!isLoading) {
      fetchCoachData();
    }
  }, [selectedResumeId, resumes.length, apps.length, isLoading]);

  const resumeCount = resumes.length;
  const publicCount = resumes.filter((r) => r?.status === "public").length;
  const activeStatuses = apps.filter((a) => ["interviewing", "offer"].includes(a.status));
  const leadingStatus = apps.length
    ? `${Math.round((activeStatuses.length / apps.length) * 100)}% interview/offer conversion`
    : "No application data yet";

  return (
    <PremiumPage>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 space-y-10"
      >
        {/* ── Hero Section ── */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 via-card/75 to-background/50 p-6 md:p-10 shadow-2xl backdrop-blur-xl group">
            {/* Tech grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            
            {/* Ambient gradients */}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl opacity-60 group-hover:opacity-90 transition-opacity duration-1000" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-500/5 via-indigo-500/5 to-transparent blur-3xl opacity-50" />

            {/* Corner decorations */}
            <div className="absolute top-6 left-6 w-3 h-3 border-l-2 border-t-2 border-indigo-500/30 group-hover:border-indigo-500/60 transition-colors" />
            <div className="absolute top-6 right-6 w-3 h-3 border-r-2 border-t-2 border-indigo-500/30 group-hover:border-indigo-500/60 transition-colors" />
            <div className="absolute bottom-6 left-6 w-3 h-3 border-l-2 border-b-2 border-indigo-500/30 group-hover:border-indigo-500/60 transition-colors" />
            <div className="absolute bottom-6 right-6 w-3 h-3 border-r-2 border-b-2 border-indigo-500/30 group-hover:border-indigo-500/60 transition-colors" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                      <LayoutDashboard size={22} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground font-outfit">
                      Workspace
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live & Syncing
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed font-medium">
                  Optimize, track, and tailor your professional portfolio. Seamlessly manage documents and track your pipeline in one unified, AI-enhanced environment.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center bg-muted/40 p-2 rounded-2xl border border-border/50 backdrop-blur-md">
                <ResumeImport />
                <div className="h-6 w-px bg-border/60" />
                <TrashListBox />
              </div>
            </div>
          </div>
        </motion.div>

        {newInsights > 0 && (
          <motion.div variants={itemVariants}>
            <Link
              href="/dashboard/automation"
              className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 transition-colors hover:bg-amber-500/15"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <p className="text-sm font-black">Agent Insights Ready</p>
                  <p className="text-xs text-muted-foreground">
                    {newInsights} new optimizer or networking recommendation{newInsights === 1 ? "" : "s"} waiting for review.
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-amber-600" />
            </Link>
          </motion.div>
        )}

        {/* ── Stats Row ── */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
        >
          <StatsCard
            icon={<FileText size={20} />}
            label="Total Resumes"
            value={isLoading ? "..." : resumeCount.toString()}
            accent="indigo"
            trend="Documents in database"
          />
          <StatsCard
            icon={<TrendingUp size={20} />}
            label="Published"
            value={isLoading ? "..." : publicCount.toString()}
            accent="emerald"
            trend="Public active portfolio"
          />
          <StatsCard
            icon={<Target size={20} />}
            label="Applications"
            value={isAppsLoading ? "..." : apps.length.toString()}
            accent="amber"
            trend="Active pipeline tracker"
          />
          <StatsCard
            icon={<Zap size={20} />}
            label="Success Rate"
            value={
              apps.length > 0
                ? `${Math.round((apps.filter((a) => ["interviewing", "offer"].includes(a.status)).length / apps.length) * 100)}%`
                : "0%"
            }
            accent="violet"
            trend="Interview & offer rate"
          />
        </motion.div>

        {/* ── Career Insights & Applications ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Career Coach */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                <Sparkles size={13} className="text-indigo-500 animate-pulse" />
                AI Career Coach
              </h2>
            </div>
            
            <div className="min-h-[285px] lg:h-[300px] rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/[0.03] to-purple-500/[0.01] p-6 relative overflow-hidden group shadow-md flex flex-col justify-between">
              {/* Scanline line overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
              {/* Glowing decorative sphere */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
              
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Bot size={75} />
              </div>

              <div>
                <h3 className="text-base font-bold mb-3 flex items-center justify-between gap-2 font-outfit">
                  <span className="flex items-center gap-2">
                    Market Insights
                    <span className="text-[9px] bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Live Agent
                    </span>
                  </span>
                </h3>

                {resumes.length > 0 && (
                  <div className="mb-3">
                    <Select
                      value={selectedResumeId || undefined}
                      onValueChange={(val) => setSelectedResumeId(val)}
                    >
                      <SelectTrigger className="w-full bg-background/60 border-indigo-500/20 text-xs text-foreground font-medium rounded-xl h-8 focus:ring-indigo-500/50">
                        <SelectValue placeholder="Select resume to analyze..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 border-indigo-500/20 rounded-xl max-h-[160px] overflow-y-auto">
                        {resumes.map((resume: any) => (
                          <SelectItem
                            key={resume.documentId}
                            value={resume.documentId}
                            className="text-xs focus:bg-indigo-500/10 focus:text-foreground cursor-pointer rounded-lg py-1.5"
                          >
                            {resume.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="bg-background/50 border border-indigo-500/10 rounded-2xl p-4 font-mono text-xs text-muted-foreground/90 leading-relaxed relative h-[85px] lg:h-[95px] overflow-y-auto custom-scrollbar mb-4">
                  <span className="text-indigo-400 font-semibold mr-1.5">&gt;_</span>
                  &quot;{isCoachLoading ? (
                    <span className="inline-flex items-center gap-2 text-indigo-400 font-bold animate-pulse">
                      Analyzing profile & market trends...
                    </span>
                  ) : (
                    coachData?.consoleMessage || "Write a resume and track applications to scan active insights."
                  )}&quot;
                </div>
              </div>

              <Button
                onClick={() => setIsModalOpen(true)}
                disabled={isCoachLoading || !coachData}
                variant="outline"
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold rounded-xl gap-2 border-0 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Full AI Review
                <ArrowRight size={14} />
              </Button>
            </div>
          </motion.div>

          {/* Recent Activity / Applications */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                <Clock size={13} className="text-indigo-500" />
                Recent Applications
              </h2>
              <Link
                href="/dashboard/applications"
                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 hover:underline uppercase tracking-widest transition-colors"
              >
                View All Board
              </Link>
            </div>
            
            <div className="min-h-[285px] lg:h-[300px] overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {apps.length === 0 && !isAppsLoading && (
                <div className="h-full rounded-3xl border border-dashed flex flex-col items-center justify-center text-center p-8 opacity-60 bg-muted/10 border-border/80">
                  <Briefcase size={28} className="mb-3 text-muted-foreground" />
                  <p className="text-sm font-bold">No Applications Tracked Yet</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
                    Start tracking your jobs on the Kanban board to view live interview analytics here.
                  </p>
                </div>
              )}
              {isAppsLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 w-full rounded-2xl bg-muted/10 animate-pulse border border-border/20" />
                  ))}
                </div>
              )}
              {apps.slice(0, 3).map((app: any, idx: number) => (
                <div
                  key={app.id}
                  className="relative pl-6 last:pb-0"
                >
                  {/* Timeline connector */}
                  {idx < Math.min(apps.length, 3) - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-22px] w-0.5 bg-border/40" />
                  )}
                  {/* Timeline bullet with glowing animation */}
                  <div className="absolute left-[5px] top-[22px] size-3.5 rounded-full border-2 border-background bg-card flex items-center justify-center shadow-sm">
                    <span className={cn(
                      "size-1.5 rounded-full animate-ping absolute",
                      app.status === "applied" ? "bg-blue-500" :
                      app.status === "interviewing" ? "bg-amber-500" :
                      app.status === "offer" ? "bg-emerald-500" : "bg-muted-foreground"
                    )} />
                    <span className={cn(
                      "size-1.5 rounded-full relative z-10",
                      app.status === "applied" ? "bg-blue-500" :
                      app.status === "interviewing" ? "bg-amber-500" :
                      app.status === "offer" ? "bg-emerald-500" : "bg-muted-foreground"
                    )} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-card/40 border border-border/40 hover:border-indigo-500/30 hover:bg-card/75 transition-all duration-300 group shadow-sm">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform shrink-0">
                        <Briefcase size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold truncate text-foreground">{app.jobTitle}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-medium">
                          {app.company} • {new Date(app.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0",
                        app.status === "applied"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : app.status === "interviewing"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : app.status === "offer"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {app.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Quick Actions ── */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
              <Sparkles size={13} className="text-indigo-500" />
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <QuickActionCard
              href="/dashboard/analytics"
              icon={<BarChart3 size={20} />}
              title="Analytics Hub"
              description="Monitor portfolio traffic, public links views, and recruiter engagement metrics."
              gradient="from-blue-500/10 to-indigo-500/10"
              iconColor="text-blue-500"
            />
            <QuickActionCard
              href="/dashboard/applications"
              icon={<Briefcase size={20} />}
              title="Job Tracker"
              description="Manage every application in a single pipeline and keep your resume branches aligned with the role."
              gradient="from-violet-500/10 to-purple-500/10"
              iconColor="text-violet-500"
            />
            <QuickActionCard
              href="/dashboard/automation"
              icon={<Bot size={20} />}
              title="Agent Hub"
              description="Run optimizers, networking agents, job hunter, and review AI insights in one place."
              gradient="from-amber-500/10 to-orange-500/10"
              iconColor="text-amber-500"
            />
          </div>
        </motion.div>

        {/* ── Resume Grid ── */}
        <motion.div variants={itemVariants} id="resumes" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground font-outfit">
                Documents
              </h2>
              <span className="text-[11px] font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                {resumeCount} Total
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 bg-muted/20 border-border/50 rounded-xl focus-visible:ring-indigo-500/50 focus-visible:ring-2 focus-visible:border-indigo-500 placeholder:text-muted-foreground/60 font-medium"
                />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex rounded-xl bg-muted/40 p-1 border border-border/50 backdrop-blur-md">
                {(["all", "public", "private"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab)}
                    className={cn(
                      "relative px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 z-10 shrink-0",
                      filterStatus === tab
                        ? "text-foreground font-black"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {filterStatus === tab && (
                      <motion.span
                        layoutId="activeTab"
                        className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/40 z-[-1]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
            <AddResume />
            <ResumeList searchQuery={searchQuery} filterStatus={filterStatus} />
          </div>
        </motion.div>
      </motion.div>

      {/* AI Career Coach Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-indigo-500/20 bg-background/95 backdrop-blur-2xl shadow-2xl p-6 font-outfit custom-scrollbar">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="text-indigo-500 animate-pulse" />
              AI Career Coach Diagnostic
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Personalized analysis of your resume and pipeline conversions.
            </DialogDescription>
          </DialogHeader>

          {coachData ? (
            <div className="space-y-6 mt-4">
              {/* Standout Score Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-muted/40 border border-border/50 backdrop-blur-md">
                <div className="relative flex items-center justify-center size-24 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-muted/30 dark:stroke-muted/10"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-indigo-500"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray="251"
                      initial={{ strokeDashoffset: 251 }}
                      animate={{ strokeDashoffset: 251 - (251 * coachData.marketScore) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-foreground">
                    {coachData.marketScore}%
                  </span>
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-lg font-bold flex items-center justify-center sm:justify-start gap-2">
                    Market Standout Score
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {coachData.marketStatus}
                    </span>
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Your resume alignment score based on current hiring demands and job tracker pipeline conversion rates.
                  </p>
                  <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mt-2">
                    Salary Expectation: {coachData.marketSalaryInsights}
                  </p>
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Profile Strengths */}
                <div className="p-4 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/10 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    Standout Strengths
                  </h5>
                  <ul className="space-y-2 text-xs font-medium text-muted-foreground">
                    {coachData.strengths?.map((str: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Identified Gaps */}
                <div className="p-4 rounded-2xl bg-amber-500/[0.02] border border-amber-500/10 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    Identified Gaps
                  </h5>
                  <ul className="space-y-2 text-xs font-medium text-muted-foreground">
                    {coachData.gaps?.map((gap: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="size-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Recommendations */}
              <div className="p-4 rounded-2xl bg-indigo-500/[0.02] border border-indigo-500/10 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <ArrowRightCircle size={14} />
                  Strategic Action Items
                </h5>
                <ul className="space-y-2 text-xs font-medium text-muted-foreground">
                  {coachData.recommendations?.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="size-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              No diagnostic data available. Write a resume and track applications to get started.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PremiumPage>
  );
};

/* ── Stats Card Component ── */
interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "indigo" | "emerald" | "amber" | "violet";
  trend: string;
}

const accentMap = {
  indigo: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-500",
    border: "border-indigo-500/20",
    hoverBorder: "hover:border-indigo-500/40",
    shadow: "hover:shadow-indigo-500/[0.04]",
    line: "from-indigo-500/20 via-indigo-500/40 to-transparent",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/40",
    shadow: "hover:shadow-emerald-500/[0.04]",
    line: "from-emerald-500/20 via-emerald-500/40 to-transparent",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    hoverBorder: "hover:border-amber-500/40",
    shadow: "hover:shadow-amber-500/[0.04]",
    line: "from-amber-500/20 via-amber-500/40 to-transparent",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-500",
    border: "border-violet-500/20",
    hoverBorder: "hover:border-violet-500/40",
    shadow: "hover:shadow-violet-500/[0.04]",
    line: "from-violet-500/20 via-violet-500/40 to-transparent",
  },
};

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  accent,
  trend,
}) => {
  const colors = accentMap[accent] || accentMap.indigo;
  const isViolet = accent === "violet";
  const numValue = parseFloat(value) || 0;

  return (
    <div className={`group relative rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/55 p-6 shadow-sm transition-all duration-300 ${colors.hoverBorder} ${colors.shadow} overflow-hidden font-outfit`}>
      {/* Top dynamic accent line */}
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${colors.line}`} />
      
      <div className="flex items-center justify-between mb-4">
        <div
          className={`flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${colors.bg} ${colors.text}`}
        >
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/85">
          {label}
        </span>
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
          <p className="text-[10px] text-muted-foreground/75 mt-1.5 font-medium flex items-center gap-1.5">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              accent === "indigo" && "bg-indigo-500",
              accent === "emerald" && "bg-emerald-500",
              accent === "amber" && "bg-amber-500",
              accent === "violet" && "bg-violet-500",
            )} />
            {trend}
          </p>
        </div>
        
        {isViolet && (
          <div className="relative flex items-center justify-center size-14 shrink-0 -mb-1">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                className="stroke-muted/30 dark:stroke-muted/10"
                strokeWidth="3.5"
                fill="transparent"
              />
              <motion.circle
                cx="28"
                cy="28"
                r="22"
                className="stroke-violet-500"
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray="138"
                initial={{ strokeDashoffset: 138 }}
                animate={{ strokeDashoffset: 138 - (138 * Math.min(numValue, 100)) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute text-[9px] font-black text-foreground">
              {value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Quick Action Card Component ── */
interface QuickActionCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  href,
  icon,
  title,
  description,
  gradient,
  iconColor,
}) => {
  return (
    <Link href={href}>
      <div className="group relative h-full cursor-pointer rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/50 p-5 shadow-sm transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/[0.02] overflow-hidden">
        {/* Hover glowing spot */}
        <div className={`absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-500`} />
        
        <div className="flex items-center justify-between mb-4">
          <div
            className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} ${iconColor} transition-transform duration-300 group-hover:scale-110`}
          >
            {icon}
          </div>
          <div className="w-7 h-7 rounded-lg bg-muted/30 group-hover:bg-indigo-500/10 flex items-center justify-center transition-colors">
            <ArrowRight
              size={12}
              className="text-muted-foreground/50 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all duration-300"
            />
          </div>
        </div>
        <h3 className="font-bold text-sm text-foreground mb-1.5 font-outfit">{title}</h3>
        <p className="text-xs text-muted-foreground leading-normal font-medium">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default Page;
