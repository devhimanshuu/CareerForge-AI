"use client";

import React, { useEffect, useState } from "react";
import {
  GitBranch,
  TrendingUp,
  Target,
  FileText,
  MousePointerClick,
  Eye,
  ArrowRight,
  Flame,
  Award,
  AlertTriangle,
  ChevronRight,
  SplitSquareHorizontal,
} from "lucide-react";
import { PremiumPage, PremiumPageHeader, PremiumPanel } from "@/components/ui/premium-page";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function ABTestingDashboard() {
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [docA, setDocA] = useState<string>("");
  const [docB, setDocB] = useState<string>("");
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  // Initial load
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("/api/ab-testing");
        if (res.ok) {
          const json = await res.json();
          setAllDocs(json.allDocs || []);
          if (json.allDocs.length >= 2) {
            setDocA(json.allDocs[0].documentId);
            setDocB(json.allDocs[1].documentId);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  // Fetch comparison when selections change
  useEffect(() => {
    if (!docA || !docB) return;
    const fetchComparison = async () => {
      setFetching(true);
      try {
        const res = await fetch(`/api/ab-testing?docA=${docA}&docB=${docB}`);
        if (res.ok) {
          const json = await res.json();
          setComparison(json.comparison);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchComparison();
  }, [docA, docB]);

  if (loading) {
    return (
      <PremiumPage>
        <PremiumPageHeader
          eyebrow="Resume Analytics"
          title="A/B Testing"
          description="Compare different versions of your resume to see which performs best."
          icon={<SplitSquareHorizontal size={13} />}
        />
        <div className="h-64 rounded-3xl bg-muted/30 animate-pulse border border-border/50 mt-8" />
      </PremiumPage>
    );
  }

  const hasEnoughDocs = allDocs.length >= 2;

  // Predictive Heatmap Component
  const PredictiveHeatmap = ({ score }: { score: number }) => {
    // A stylized visual block representing a resume layout with a gradient overlay
    // Score determines the intensity/spread of the red "hot" zones
    const intensity = score > 85 ? "from-red-500/80 via-orange-500/40 to-blue-500/10" :
                      score > 70 ? "from-orange-500/60 via-yellow-500/30 to-blue-500/10" :
                      "from-yellow-500/40 via-blue-500/20 to-blue-500/5";

    return (
      <div className="relative w-full aspect-[1/1.4] bg-card border border-border/50 rounded-lg overflow-hidden p-4 flex flex-col gap-3">
        <div className={`absolute inset-0 bg-gradient-to-br ${intensity} mix-blend-multiply dark:mix-blend-screen opacity-50 filter blur-2xl`} />
        {/* Mock Header */}
        <div className="w-1/2 h-4 bg-muted-foreground/20 rounded-full relative z-10" />
        <div className="w-3/4 h-2 bg-muted-foreground/10 rounded-full relative z-10" />
        {/* Mock Summary (Hot zone) */}
        <div className="space-y-1.5 mt-2 relative z-10">
          <div className="w-full h-2 bg-muted-foreground/20 rounded-full" />
          <div className="w-full h-2 bg-muted-foreground/20 rounded-full" />
          <div className="w-4/5 h-2 bg-muted-foreground/20 rounded-full" />
        </div>
        {/* Mock Experience (Hot left edge - F pattern) */}
        <div className="space-y-3 mt-4 relative z-10">
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full mt-0.5" />
            <div className="w-full h-2 bg-muted-foreground/10 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full mt-0.5" />
            <div className="w-11/12 h-2 bg-muted-foreground/10 rounded-full" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Resume Analytics"
        title="A/B Testing Dashboard"
        description="Pit your resume variations head-to-head to discover which one drives more interview callbacks and higher ATS scores."
        icon={<SplitSquareHorizontal size={13} />}
      />

      {!hasEnoughDocs ? (
        <PremiumPanel className="mt-8 p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
            <GitBranch size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Not enough resumes to compare</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            You need at least two resume versions (branches) to run an A/B test. Head over to the dashboard to duplicate and tailor your resume for a different role.
          </p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl">
            <a href="/dashboard">Go to Dashboard</a>
          </Button>
        </PremiumPanel>
      ) : (
        <div className="mt-8 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Version A</label>
              <Select value={docA} onValueChange={setDocA}>
                <SelectTrigger className="bg-background rounded-xl border-indigo-500/30 focus:ring-indigo-500/20">
                  <SelectValue placeholder="Select Version A" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {allDocs.map((doc) => (
                    <SelectItem key={doc.documentId} value={doc.documentId} disabled={doc.documentId === docB}>
                      {doc.title} {doc.branchName ? `(${doc.branchName})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border shadow-sm text-muted-foreground text-xs font-black">
              VS
            </div>
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Version B</label>
              <Select value={docB} onValueChange={setDocB}>
                <SelectTrigger className="bg-background rounded-xl border-emerald-500/30 focus:ring-emerald-500/20">
                  <SelectValue placeholder="Select Version B" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {allDocs.map((doc) => (
                    <SelectItem key={doc.documentId} value={doc.documentId} disabled={doc.documentId === docA}>
                      {doc.title} {doc.branchName ? `(${doc.branchName})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {fetching || !comparison ? (
            <div className="h-96 rounded-3xl bg-muted/30 animate-pulse border border-border/50" />
          ) : (
            <div className="space-y-6">
              
              {/* Outcome Highlights */}
              <PremiumPanel className="p-6 md:p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <TrophyIcon className="w-64 h-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                      <Flame size={12} /> The Verdict
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-2">
                      {comparison.docA.callbackRate > comparison.docB.callbackRate ? (
                        <>Version A <span className="text-indigo-500">dominates</span> with {comparison.docA.callbackRate - comparison.docB.callbackRate}% more interview callbacks.</>
                      ) : comparison.docB.callbackRate > comparison.docA.callbackRate ? (
                        <>Version B <span className="text-emerald-500">dominates</span> with {comparison.docB.callbackRate - comparison.docA.callbackRate}% more interview callbacks.</>
                      ) : (
                        <>It's a <span className="text-amber-500">dead heat</span>. Both versions convert equally well.</>
                      )}
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground">
                      Version A scores {comparison.docA.atsScore}% on average for targeted roles, while Version B scores {comparison.docB.atsScore}%.
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex gap-4 w-full md:w-auto">
                    <div className="flex-1 md:w-32 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1">Version A</p>
                      <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{comparison.docA.callbackRate}%</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Conversion</p>
                    </div>
                    <div className="flex-1 md:w-32 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-1">Version B</p>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{comparison.docB.callbackRate}%</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Conversion</p>
                    </div>
                  </div>
                </div>
              </PremiumPanel>

              {/* Head to Head Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Version A Column */}
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-card border border-border/50 hover:border-indigo-500/30 transition-colors">
                      <Target className="w-5 h-5 text-indigo-500 mb-3" />
                      <p className="text-2xl font-black">{comparison.docA.atsScore}%</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">ATS Average</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border/50 hover:border-indigo-500/30 transition-colors">
                      <MousePointerClick className="w-5 h-5 text-indigo-500 mb-3" />
                      <p className="text-2xl font-black">{comparison.docA.callbacks} / {comparison.docA.totalApps}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Callbacks / Apps</p>
                    </div>
                  </div>

                  {/* Heatmap */}
                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="w-4 h-4 text-indigo-500" />
                      <h3 className="font-bold text-sm">Recruiter Attention Heatmap</h3>
                    </div>
                    <PredictiveHeatmap score={comparison.docA.atsScore} />
                  </div>

                  {/* Keywords */}
                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <h3 className="font-bold text-sm">Keyword Density</h3>
                    </div>
                    <div className="space-y-3">
                      {comparison.docA.keywords.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Add content to generate keywords.</p>
                      ) : (
                        comparison.docA.keywords.map((kw: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-24 text-xs font-bold truncate text-muted-foreground">{kw.text}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((kw.value / comparison.docA.keywords[0].value) * 100, 100)}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-indigo-500 w-4">{kw.value}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Version B Column */}
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-card border border-border/50 hover:border-emerald-500/30 transition-colors">
                      <Target className="w-5 h-5 text-emerald-500 mb-3" />
                      <p className="text-2xl font-black">{comparison.docB.atsScore}%</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">ATS Average</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border/50 hover:border-emerald-500/30 transition-colors">
                      <MousePointerClick className="w-5 h-5 text-emerald-500 mb-3" />
                      <p className="text-2xl font-black">{comparison.docB.callbacks} / {comparison.docB.totalApps}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Callbacks / Apps</p>
                    </div>
                  </div>

                  {/* Heatmap */}
                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="w-4 h-4 text-emerald-500" />
                      <h3 className="font-bold text-sm">Recruiter Attention Heatmap</h3>
                    </div>
                    <PredictiveHeatmap score={comparison.docB.atsScore} />
                  </div>

                  {/* Keywords */}
                  <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <h3 className="font-bold text-sm">Keyword Density</h3>
                    </div>
                    <div className="space-y-3">
                      {comparison.docB.keywords.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Add content to generate keywords.</p>
                      ) : (
                        comparison.docB.keywords.map((kw: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-24 text-xs font-bold truncate text-muted-foreground">{kw.text}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((kw.value / comparison.docB.keywords[0].value) * 100, 100)}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500 w-4">{kw.value}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}
    </PremiumPage>
  );
}

const TrophyIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
