"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Activity,
  Eye,
  MousePointerClick,
  Clock,
  Loader,
  GitBranch,
  Trophy,
  ArrowRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { PremiumPage } from "@/components/ui/premium-page";

const AnalyticsDashboard = () => {
  const [data, setData] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    avgTime: "0m 0s",
    clickThroughs: 0,
    viewsOverTime: Array(14).fill(0),
    branchMetrics: [] as any[],
    trafficSources: [] as { label: string; percentage: number }[],
    geoBreakdown: [] as { country: string; percentage: number; count: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setData(json.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const maxView = Math.max(...data.viewsOverTime, 1);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center px-5 py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-indigo-500 w-10 h-10" />
          <p className="text-muted-foreground animate-pulse font-medium">
            Analyzing your career growth...
          </p>
        </div>
      </div>
    );
  }

  // Find the winning branch (highest response/view ratio or just responses)
  const winningBranch = [...data.branchMetrics].sort(
    (a, b) => b.responses - a.responses,
  )[0];

  return (
    <PremiumPage>
      <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            <TrendingUp size={12} />
            Performance Insights
          </div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            Career Command Center
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Real-time tracking for your personal brand. See which resume
            versions are winning interviews and where your profile is being
            viewed.
          </p>
        </div>

        {winningBranch && winningBranch.responses > 0 && (
          <div className="flex items-center gap-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex size-12 items-center justify-center rounded-md bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Winning Version
              </p>
              <p className="font-bold text-sm truncate max-w-[200px]">
                {winningBranch.title}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Eye size={20} />}
          label="Total Impressions"
          value={data.totalViews}
          trend="+12%"
          color="blue"
        />
        <StatCard
          icon={<Activity size={20} />}
          label="Unique Reach"
          value={data.uniqueVisitors}
          trend="+5.4%"
          color="purple"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Engagement Time"
          value={data.avgTime}
          color="orange"
        />
        <StatCard
          icon={<MousePointerClick size={20} />}
          label="Response Actions"
          value={data.clickThroughs}
          color="emerald"
        />
      </div>

      {/* A/B Testing Section: Branch Comparison */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <GitBranch size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Resume A/B Testing</h2>
            <p className="text-sm text-muted-foreground">
              Compare performance across different branched versions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="p-6 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                  Version Performance
                </h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" /> VIEWS
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />{" "}
                    RESPONSES
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {data.branchMetrics.map((branch, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <FileText size={14} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[200px] md:max-w-md group-hover:text-indigo-500 transition-colors">
                          {branch.title}
                        </p>
                        {branch.branchName && (
                          <span className="text-[10px] font-bold text-indigo-500/60 uppercase">
                            {branch.branchName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-bold">{branch.views}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Views
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-500">
                          {branch.responses}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Res.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(branch.views / Math.max(...data.branchMetrics.map((b) => b.views), 1)) * 100}%`,
                      }}
                      className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full z-10"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(branch.responses / Math.max(...data.branchMetrics.map((b) => b.responses), 1)) * 100}%`,
                      }}
                      className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full z-20 h-1 mt-0.5"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-lg bg-indigo-600 p-6 text-white shadow-sm">
              <div className="relative z-10 space-y-4">
                <h3 className="text-lg font-bold">Optimization Tips</h3>
                <ul className="space-y-3 text-sm text-indigo-100">
                  {data.branchMetrics.length > 0 ? (
                    <>
                      <li className="flex gap-2">
                        <ArrowRight size={16} className="shrink-0" />
                        {data.branchMetrics[0].title} is currently your highest-viewed version.
                      </li>
                      <li className="flex gap-2">
                        <ArrowRight size={16} className="shrink-0" />
                        Branch resumes for each target role and compare downloads plus recruiter leads.
                      </li>
                    </>
                  ) : (
                    <li className="flex gap-2">
                      <ArrowRight size={16} className="shrink-0" />
                      Publish a portfolio link to start collecting performance signals.
                    </li>
                  )}
                </ul>
                <Button
                  variant="secondary"
                  className="w-full font-bold text-indigo-600 mt-2"
                  asChild
                >
                  <Link href="/dashboard">Create New Branch</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                Visitor Geography
              </h3>
              <div className="space-y-4">
                {data.geoBreakdown.length > 0 ? (
                  data.geoBreakdown.map((geo) => (
                    <SourceItem key={geo.country} label={geo.country} percentage={geo.percentage} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Geographic data appears after public portfolio views (Vercel geo headers).
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                Traffic Sources
              </h3>
              <div className="space-y-4">
                {data.trafficSources.length > 0 ? (
                  data.trafficSources.map((source) => (
                    <SourceItem key={source.label} label={source.label} percentage={source.percentage} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Traffic sources will appear after public portfolio views.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Views Over Time */}
      <section className="rounded-lg border bg-card p-8 shadow-sm">
        <h3 className="font-bold text-lg mb-8 flex items-center gap-2">
          <BarChart className="w-5 h-5 text-indigo-500" />
          Aggregate Audience Growth
        </h3>
        <div className="h-48 w-full flex items-end justify-between px-4 gap-2">
          {data.viewsOverTime.map((val, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(val / maxView) * 100}%` }}
              className="w-full bg-indigo-500/20 hover:bg-indigo-500 rounded-t-lg relative group transition-all"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                {val}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
          <span>14 Days Ago</span>
          <span>Today</span>
        </div>
      </section>
      </div>
    </PremiumPage>
  );
};

const StatCard = ({ icon, label, value, trend, color }: any) => (
  <div className="group rounded-lg border bg-card p-6 shadow-sm transition-colors hover:border-indigo-500/30">
    <div className="flex items-center justify-between mb-4">
      <div
        className={cn(
          "p-2.5 rounded-md",
          color === "blue" && "bg-blue-500/10 text-blue-600",
          color === "purple" && "bg-purple-500/10 text-purple-600",
          color === "orange" && "bg-orange-500/10 text-orange-600",
          color === "emerald" && "bg-emerald-500/10 text-emerald-600",
        )}
      >
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <p className="text-3xl font-black tracking-tight">{value}</p>
    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 group-hover:text-foreground transition-colors">
      {label}
    </p>
  </div>
);

const SourceItem = ({ label, percentage }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold">
      <span>{label}</span>
      <span className="text-indigo-500">{percentage}%</span>
    </div>
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-indigo-500 rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

export default AnalyticsDashboard;
