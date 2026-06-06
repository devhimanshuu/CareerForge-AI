"use client";

import React, { useState, useEffect } from "react";
import { Globe, TrendingUp, DollarSign, Briefcase, MapPin, ArrowUpRight, BarChart4, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumPage, PremiumPageHeader, PremiumPanel, PremiumStatCard } from "@/components/ui/premium-page";
import useGetDocuments from "@/features/document/use-get-document";
import { toast } from "@/hooks/use-toast";

const MarketData = () => {
  const { data: resumeData, isLoading: isResumesLoading } = useGetDocuments();
  const resumes = resumeData?.data || [];

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedResumeInfo, setSelectedResumeInfo] = useState<any>(null);
  const [region, setRegion] = useState("USA");
  const [loading, setLoading] = useState(false);
  const [marketInfo, setMarketInfo] = useState<any>(null);

  // Fetch resume details when selected
  useEffect(() => {
    if (!selectedResumeId) {
      setMarketInfo(null);
      return;
    }

    const fetchDetailAndLoad = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/document/${selectedResumeId}`);
        const json = await res.json();
        if (json.success) {
          setSelectedResumeInfo(json.data);
          
          // Trigger market query
          await loadMarketData(json.data, region);
        }
      } catch (e) {
        console.error(e);
        toast({
          title: "Query Failed",
          description: "Could not fetch details for selected resume.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetailAndLoad();
  }, [selectedResumeId]);

  // Load when region changes
  const handleRegionChange = async (newRegion: string) => {
    setRegion(newRegion);
    if (selectedResumeInfo) {
      setLoading(true);
      try {
        await loadMarketData(selectedResumeInfo, newRegion);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const loadMarketData = async (resume: any, currentRegion: string) => {
    try {
      const jobTitle = resume.personalInfo?.jobTitle || "Software Engineer";
      const skills = resume.skills?.map((s: any) => s.name).join(", ") || "";

      const res = await fetch("/api/ai/market-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          skills,
          region: currentRegion,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch market metrics");
      const data = await res.json();
      setMarketInfo(data);
    } catch (e) {
      console.error(e);
      toast({
        title: "Market Search Failed",
        description: "Failed to generate market data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getToneForStatIndex = (idx: number) => {
    const tones = ["emerald" as const, "indigo" as const, "amber" as const, "rose" as const];
    return tones[idx % tones.length];
  };

  const getIconForStatLabel = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("salary") || l.includes("median") || l.includes("usd")) return <DollarSign size={18} />;
    if (l.includes("opening") || l.includes("job") || l.includes("roles")) return <Briefcase size={18} />;
    if (l.includes("velocity") || l.includes("growth") || l.includes("speed")) return <TrendingUp size={18} />;
    return <MapPin size={18} />;
  };

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Market Intelligence"
        title="Career Market Data"
        description="A real-time strategy layer showing salary percentiles, skill demands, and tailored opportunity signals based on your profile."
        icon={<Globe size={13} />}
        action={
          <div className="flex items-center gap-3">
            <select
              className="h-10 px-3 bg-background border border-border/70 rounded-md text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
            >
              <option value="">-- Choose Resume context --</option>
              {resumes.map((resume: any) => (
                <option key={resume.id} value={resume.id}>
                  {resume.title}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 rounded-lg border bg-card p-1 shadow-sm h-10">
              {["Global", "USA", "EU"].map((reg) => (
                <Button
                  key={reg}
                  variant={region === reg ? "default" : "ghost"}
                  size="sm"
                  className="h-8 rounded-md px-4 text-xs font-bold"
                  onClick={() => handleRegionChange(reg)}
                >
                  {reg}
                </Button>
              ))}
            </div>
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-24 flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-indigo-600 font-bold animate-pulse uppercase tracking-widest text-[10px]">Analyzing market demand indices...</p>
          </motion.div>
        ) : !marketInfo ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto"
          >
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 animate-pulse">
              <Globe size={40} />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">No Profile Context Selected</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Select a resume context to fetch live job opportunities, demand indices, and benchmarks specifically for your profile.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Stats list */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {marketInfo.stats?.map((stat: any, idx: number) => (
                <PremiumStatCard
                  key={idx}
                  label={stat.label}
                  value={stat.value}
                  detail={stat.detail}
                  icon={getIconForStatLabel(stat.label)}
                  tone={getToneForStatIndex(idx)}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Trending Skills */}
              <PremiumPanel className="p-6 lg:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black tracking-tight">Trending Skills</h2>
                    <p className="text-sm text-muted-foreground">Demand index tailored to your target roles.</p>
                  </div>
                  <div className="rounded-md bg-indigo-500/10 p-2 text-indigo-500">
                    <BarChart4 size={20} />
                  </div>
                </div>
                <div className="space-y-5">
                  {marketInfo.skills?.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold">{item.skill}</p>
                          <p className="text-xs text-muted-foreground">{item.context}</p>
                        </div>
                        <span className="text-xs font-black text-indigo-500">{item.demand}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.demand}%` }}
                          className="h-full rounded-full bg-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumPanel>

              {/* Live Opportunities */}
              <PremiumPanel className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-black tracking-tight">Live Opportunities</h2>
                  <p className="text-sm text-muted-foreground">High-signal matches worth applying to.</p>
                </div>
                <div className="space-y-3">
                  {marketInfo.roles?.map((role: any, idx: number) => (
                    <div
                      key={idx}
                      className="group rounded-lg border border-border/70 bg-background p-4 transition-colors hover:border-indigo-500/40"
                    >
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="rounded-md bg-muted p-2">
                          <Briefcase size={15} />
                        </div>
                        <ArrowUpRight size={15} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <h4 className="text-sm font-bold">{role.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {role.company} · {role.location}
                      </p>
                      <p className="mt-3 text-xs font-black text-emerald-500">{role.range}</p>
                    </div>
                  ))}
                </div>
              </PremiumPanel>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PremiumPage>
  );
};

export default MarketData;
