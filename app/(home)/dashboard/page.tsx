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
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import useGetDocuments from "@/features/document/use-get-document";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const resumes = useMemo(() => {
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  }, [data]);

  const resumeCount = resumes.length;
  const publicCount = resumes.filter((r) => r?.status === "public").length;

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-background relative overflow-x-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-violet-500/[0.02] rounded-full blur-[80px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full mx-auto max-w-7xl 3xl:max-w-9xl 4xl:max-w-10xl py-8 px-5 relative z-10"
      >
        {/* ── Hero Section ── */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card/40 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-violet-500/[0.05]" />

            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <LayoutDashboard size={20} className="text-white" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                      Dashboard
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live Workspace
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm md:text-base max-w-lg leading-relaxed">
                  Manage your professional portfolio and leverage AI to optimize
                  your resumes for every application.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <TrashListBox />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          <StatsCard
            icon={<FileText size={18} />}
            label="Total Resumes"
            value={isLoading ? "..." : resumeCount.toString()}
            accent="indigo"
            trend="Documents created"
          />
          <StatsCard
            icon={<TrendingUp size={18} />}
            label="Published"
            value={isLoading ? "..." : publicCount.toString()}
            accent="emerald"
            trend="Active portfolio"
          />
          <StatsCard
            icon={<Target size={18} />}
            label="Applications"
            value={isAppsLoading ? "..." : apps.length.toString()}
            accent="amber"
            trend="Active pipeline"
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
            trend="Interview rate"
          />
        </motion.div>

        {/* ── Career Insights & Applications ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          {/* AI Career Coach */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-500" />
                Career Coach
              </h2>
            </div>
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bot size={80} />
              </div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                Market Insight
                <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                  New
                </span>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                &quot;Based on your recent applications, you have a high success
                rate in <b>Fullstack Roles</b>. Consider adding <b>Next.js</b>{" "}
                and <b>Drizzle ORM</b> to your main resume to increase your ATS
                score by 15%.&quot;
              </p>
              <Button
                variant="outline"
                className="w-full bg-background/50 border-indigo-500/30 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl font-bold gap-2"
              >
                Get Full AI Review
                <ArrowRight size={14} />
              </Button>
            </div>
          </motion.div>

          {/* Recent Activity / Applications */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                <Clock size={14} className="text-indigo-500" />
                Recent Applications
              </h2>
              <Link
                href="/dashboard/applications"
                className="text-[11px] font-bold text-indigo-500 hover:underline uppercase tracking-widest"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {apps.length === 0 && !isAppsLoading && (
                <div className="p-10 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center opacity-50">
                  <Briefcase size={24} className="mb-3" />
                  <p className="text-sm font-bold">No applications yet</p>
                  <p className="text-xs">Start tracking your journey today</p>
                </div>
              )}
              {apps.slice(0, 3).map((app: any) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-card/30 border border-border/40 hover:border-indigo-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{app.jobTitle}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        {app.company} •{" "}
                        {new Date(app.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      app.status === "applied"
                        ? "bg-blue-500/10 text-blue-500"
                        : app.status === "interviewing"
                          ? "bg-amber-500/10 text-amber-500"
                          : app.status === "offer"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-muted text-muted-foreground",
                    )}
                  >
                    {app.status}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Quick Actions ── */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-500" />
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionCard
              href="/dashboard/analytics"
              icon={<BarChart3 size={18} />}
              title="Analytics"
              description="View portfolio performance"
              gradient="from-blue-500/20 to-indigo-500/20"
              iconColor="text-blue-500"
            />
            <QuickActionCard
              href="/dashboard/jobs"
              icon={<Briefcase size={18} />}
              title="Job Board"
              description="Find matching opportunities"
              gradient="from-violet-500/20 to-purple-500/20"
              iconColor="text-violet-500"
            />
            <QuickActionCard
              href="#resumes"
              icon={<Star size={18} />}
              title="Optimize"
              description="AI ATS enhancement tools"
              gradient="from-amber-500/20 to-orange-500/20"
              iconColor="text-amber-500"
            />
          </div>
        </motion.div>

        {/* ── Resume Grid ── */}
        <motion.div variants={itemVariants} id="resumes">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">
                Your Resumes
              </h2>
              <span className="text-[11px] font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                {resumeCount}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
            <AddResume />
            <ResumeList />
          </div>
        </motion.div>
      </motion.div>
    </div>
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
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-500",
    border: "border-violet-500/20",
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
  return (
    <div className="group relative rounded-2xl border border-border/40 bg-card/30 p-5 hover:bg-card/50 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}
        >
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          {label}
        </span>
      </div>
      <div className="flex flex-col">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-1 font-medium">
          {trend}
        </p>
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
      <div className="group relative rounded-2xl border border-border/40 bg-card/20 p-4 hover:bg-card/40 transition-all duration-300 cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center ${iconColor}`}
          >
            {icon}
          </div>
          <ArrowRight
            size={14}
            className="text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300"
          />
        </div>
        <h3 className="font-bold text-sm text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-snug">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default Page;
