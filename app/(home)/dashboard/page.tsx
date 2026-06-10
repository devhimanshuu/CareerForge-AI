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

  // Update clock every minute so greeting stays fresh during long sessions
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

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1400px] mx-auto px-6 py-8 space-y-8"
      >
        {/* ── Welcome Header ── */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">{greeting}, {user?.firstName || "there"} {emoji}</p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Your Workspace
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Manage resumes, track applications, and leverage AI tools.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ResumeImport />
            <TrashListBox />
          </div>
        </motion.div>

        {/* ── Insights Banner ── */}
        {newInsights > 0 && (
          <motion.div variants={itemVariants}>
            <Link
              href="/dashboard/automation"
              className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 transition-all hover:bg-amber-500/10 hover:border-amber-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <Bot size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold">{newInsights} new agent insight{newInsights !== 1 ? "s" : ""} ready</p>
                  <p className="text-xs text-muted-foreground">Review optimizer and networking recommendations</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-amber-600 shrink-0" />
            </Link>
          </motion.div>
        )}

        {/* ── Stats Row ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={<FileText size={18} />}
            label="Resumes"
            value={isLoading ? "—" : resumeCount.toString()}
            accent="indigo"
          />
          <StatsCard
            icon={<TrendingUp size={18} />}
            label="Published"
            value={isLoading ? "—" : publicCount.toString()}
            accent="emerald"
          />
          <StatsCard
            icon={<Briefcase size={18} />}
            label="Applications"
            value={isAppsLoading ? "—" : apps.length.toString()}
            accent="amber"
          />
          <StatsCard
            icon={<Zap size={18} />}
            label="Success Rate"
            value={
              apps.length > 0
                ? `${Math.round((apps.filter((a) => ["interviewing", "offer"].includes(a.status)).length / apps.length) * 100)}%`
                : "0%"
            }
            accent="violet"
          />
        </motion.div>

        {/* ── AI Coach + Recent Applications ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Career Coach */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <CardHeader icon={<Sparkles size={13} className="text-indigo-500" />} title="AI Career Coach" />
            <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
              {resumes.length > 0 && (
                <Select value={selectedResumeId || undefined} onValueChange={(val) => setSelectedResumeId(val)}>
                  <SelectTrigger className="w-full h-9 text-xs rounded-xl">
                    <SelectValue placeholder="Select resume..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-[160px] overflow-y-auto">
                    {resumes.map((r: any) => (
                      <SelectItem key={r.documentId} value={r.documentId} className="text-xs rounded-lg">
                        {r.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="bg-muted/30 rounded-xl p-3 font-mono text-xs text-muted-foreground leading-relaxed min-h-[72px]">
                <span className="text-indigo-500 font-bold mr-1">&gt;</span>
                {isCoachLoading ? (
                  <span className="text-indigo-400 animate-pulse">Analyzing...</span>
                ) : (
                  coachData?.consoleMessage || "Write a resume to see AI insights."
                )}
              </div>

              <Button
                onClick={() => setIsModalOpen(true)}
                disabled={isCoachLoading || !coachData}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl gap-1.5"
                size="sm"
              >
                <Sparkles size={13} />
                Full AI Review
              </Button>
            </div>
          </motion.div>

          {/* Recent Applications */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <CardHeader icon={<Clock size={13} className="text-blue-500" />} title="Recent Applications" />
              <Link href="/dashboard/applications" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-wider transition-colors">
                View All →
              </Link>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card divide-y divide-border/40">
              {isAppsLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 rounded-xl bg-muted/30 animate-pulse" />
                  ))}
                </div>
              ) : apps.length === 0 ? (
                <div className="p-8 text-center">
                  <Briefcase size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No applications yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Start tracking jobs to see them here</p>
                </div>
              ) : (
                apps.slice(0, 5).map((app: any) => (
                  <div key={app.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Briefcase size={15} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{app.jobTitle}</p>
                      <p className="text-[10px] text-muted-foreground">{app.company} • {new Date(app.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0",
                      app.status === "applied" ? "bg-blue-500/10 text-blue-600" :
                      app.status === "interviewing" ? "bg-amber-500/10 text-amber-600" :
                      app.status === "offer" ? "bg-emerald-500/10 text-emerald-600" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Quick Actions ── */}
        <motion.div variants={itemVariants}>
          <CardHeader icon={<Zap size={13} className="text-amber-500" />} title="Quick Actions" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionCard href="/dashboard/analytics" icon={<BarChart3 size={18} />} title="Analytics" description="Portfolio traffic and engagement metrics" />
            <QuickActionCard href="/dashboard/applications" icon={<Briefcase size={18} />} title="Job Tracker" description="Manage your application pipeline" />
            <QuickActionCard href="/dashboard/automation" icon={<Bot size={18} />} title="Agent Hub" description="AI optimizers and networking tools" />
          </div>
        </motion.div>

        {/* ── Resume Grid ── */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-foreground">Documents</h2>
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">{resumeCount}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 w-48 text-xs rounded-xl bg-muted/30 border-border/50"
                />
              </div>
              <div className="flex rounded-lg bg-muted/40 p-0.5 border border-border/50">
                {(["all", "public", "private"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                      filterStatus === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AddResume />
            <ResumeList searchQuery={searchQuery} filterStatus={filterStatus} />
          </div>
        </motion.div>
      </motion.div>

      {/* AI Career Coach Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-indigo-500/20 p-6 custom-scrollbar">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={18} />
              AI Career Coach
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Personalized analysis of your resume and pipeline.
            </DialogDescription>
          </DialogHeader>

          {coachData ? (
            <div className="space-y-5 mt-4">
              {/* Score */}
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-muted/40 border border-border/50">
                <div className="relative size-20 shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="34" className="stroke-muted/30" strokeWidth="5" fill="transparent" />
                    <motion.circle
                      cx="40" cy="40" r="34"
                      className="stroke-indigo-500"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray="214"
                      initial={{ strokeDashoffset: 214 }}
                      animate={{ strokeDashoffset: 214 - (214 * coachData.marketScore) / 100 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-black">{coachData.marketScore}%</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold flex items-center gap-2">
                    Market Score
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-600">{coachData.marketStatus}</span>
                  </h4>
                  <p className="text-xs text-muted-foreground">{coachData.marketSalaryInsights}</p>
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> Strengths
                  </h5>
                  <ul className="space-y-1.5">
                    {coachData.strengths?.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                    <AlertTriangle size={12} /> Gaps
                  </h5>
                  <ul className="space-y-1.5">
                    {coachData.gaps?.map((g: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />{g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <ArrowRightCircle size={12} /> Action Items
                </h5>
                <ul className="space-y-1.5">
                  {coachData.recommendations?.map((r: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
              No data available yet.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ── Card Header ── */
function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
    </div>
  );
}

/* ── Stats Card ── */
const accentMap: Record<string, { bg: string; text: string; dot: string }> = {
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-500", dot: "bg-indigo-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", dot: "bg-emerald-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", dot: "bg-amber-500" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500", dot: "bg-violet-500" },
};

function StatsCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: "indigo" | "emerald" | "amber" | "violet" }) {
  const c = accentMap[accent] || accentMap.indigo;
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 hover:border-border transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", c.bg, c.text)}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-black tracking-tight">{value}</p>
    </div>
  );
}

/* ── Quick Action Card ── */
function QuickActionCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Link href={href}>
      <div className="group rounded-2xl border border-border/60 bg-card p-4 hover:border-indigo-500/30 transition-all duration-200 cursor-pointer h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors">
            {icon}
          </div>
          <ArrowRight size={14} className="text-muted-foreground/30 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
        </div>
        <h4 className="text-sm font-bold mb-0.5">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

export default Page;
