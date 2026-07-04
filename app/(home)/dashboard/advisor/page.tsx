"use client";

import React, { useEffect, useState } from "react";
import {
  Compass,
  TrendingUp,
  Target,
  Briefcase,
  Users,
  ArrowRight,
  Sparkles,
  Zap,
  ChevronRight,
  Activity,
  Award,
} from "lucide-react";
import { PremiumPage, PremiumPageHeader, PremiumPanel } from "@/components/ui/premium-page";
import { ApiKeyBanner } from "@/components/ui/api-key-banner";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";

export default function AdvisorDashboard() {
  const { user } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/advisor/daily");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load advisor data:", err);
        toast({ title: "Advisor Data Unavailable", description: "Could not load your personalized career intelligence right now.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
    <PremiumPage>
      <ApiKeyBanner className="mb-6" />
      <PremiumPageHeader
        eyebrow="Daily Feed"
        title="AI Career Advisor"
        description="Aggregating personalized intelligence from your background agents..."
        icon={<Compass size={13} />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 rounded-3xl bg-muted/30 animate-pulse border border-border/50" />
        ))}
      </div>
      </PremiumPage>
    );
  }

  if (!data) return null;

  const { atsMatch, topSkills, jobMatches, networkingIntro } = data;

  return (
    <PremiumPage>
      <ApiKeyBanner className="mb-6" />
      <PremiumPageHeader
        eyebrow="Daily Discover Feed"
        title="AI Career Advisor"
        description={`Good to see you, ${user?.firstName || "there"}. Here is your actionable career intelligence for today.`}
        icon={<Compass size={13} />}
        action={
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard/pipeline"><Zap size={14} /> Tune Pipeline</Link>
          </Button>
        }
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ATS Trend Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-background p-8 group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 transition-opacity group-hover:opacity-20">
            <Activity size={100} className="text-indigo-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-black text-lg tracking-tight">ATS Match Trend</h3>
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-[85%]">
                {atsMatch.message}
              </p>
            </div>
            
            <div className="mt-8 flex items-end gap-4">
              <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                {atsMatch.currentAverage}%
              </div>
              <div className="pb-1.5 flex items-center gap-1 text-sm font-bold text-emerald-500">
                {atsMatch.trend === "up" && <TrendingUp size={16} />}
                +{atsMatch.percentage}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Skills Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-background p-8 group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 transition-opacity group-hover:opacity-20">
            <Target size={100} className="text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Award size={20} />
                </div>
                <h3 className="font-black text-lg tracking-tight">Market Demand</h3>
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Based on optimizations for your target role, these skills are highly requested by current employers.
              </p>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-3">
              {topSkills.map((skill: string, i: number) => (
                <div key={i} className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center gap-2 transition-transform hover:-translate-y-1">
                  <Sparkles size={14} /> {skill}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* New Job Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-background p-8 group"
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Briefcase size={20} />
                  </div>
                  <h3 className="font-black text-lg tracking-tight">New Job Matches</h3>
                </div>
                {jobMatches.length > 0 && (
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                    {jobMatches.length}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-6">
                Your background agents found new opportunities matching your profile at companies hiring now.
              </p>
            </div>
            
            <div className="space-y-3">
              {jobMatches.length === 0 ? (
                <div className="text-sm text-muted-foreground italic border-l-2 border-emerald-500/30 pl-3">
                  No new matches today. Check your pipeline settings.
                </div>
              ) : (
                jobMatches.map((job: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/50 hover:border-emerald-500/30 transition-colors">
                    <div>
                      <p className="text-xs font-bold truncate max-w-[200px] sm:max-w-[250px]">{job.title}</p>
                      <p className="text-[10px] uppercase tracking-wider text-emerald-600 mt-0.5 font-bold">{job.company}</p>
                    </div>
                    {job.url ? (
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors">
                        <ArrowRight size={14} />
                      </a>
                    ) : (
                      <Link href="/dashboard/pipeline" className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors">
                        <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Network Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-background p-8 group"
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <Users size={20} />
                </div>
                <h3 className="font-black text-lg tracking-tight">Network Radar</h3>
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                We&apos;ve identified a strategic networking opportunity to accelerate your applications.
              </p>
            </div>
            
            {networkingIntro && (
              <div className="mt-6 p-5 rounded-2xl bg-background border border-violet-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-bl-full -mr-10 -mt-10" />
                <div className="relative z-10">
                  <p className="text-xs font-black uppercase tracking-widest text-violet-500 mb-2">Warm Intro Target</p>
                  <h4 className="text-lg font-bold">{networkingIntro.name}</h4>
                  <p className="text-sm font-medium text-muted-foreground mb-4">at {networkingIntro.company}</p>
                  
                  <div className="flex items-start gap-2 bg-violet-500/5 p-3 rounded-xl">
                    <Sparkles size={14} className="text-violet-500 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-violet-700 dark:text-violet-300 leading-relaxed">
                      {networkingIntro.reason}
                    </p>
                  </div>
                  
                  <Button asChild variant="outline" className="w-full mt-4 gap-2 text-violet-600 border-violet-500/20 hover:bg-violet-500/10">
                    <Link href="/dashboard/automation">
                      Launch Networking Agent <ChevronRight size={14} />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
      </div>
    </PremiumPage>
  );
}
