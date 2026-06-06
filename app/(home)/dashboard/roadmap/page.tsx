"use client";

import React, { useState, useEffect } from "react";
import { Flag, Sparkles, Target, Star, ChevronRight, Briefcase, GraduationCap, Map, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumPage, PremiumPageHeader, PremiumPanel } from "@/components/ui/premium-page";
import useGetDocuments from "@/features/document/use-get-document";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const CareerRoadmap = () => {
  const { data: resumeData, isLoading: isResumesLoading } = useGetDocuments();
  const resumes = resumeData?.data || [];

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [accelerators, setAccelerators] = useState<string[]>([]);
  const [selectedResumeInfo, setSelectedResumeInfo] = useState<any>(null);

  // Fetch full details when resume selection changes
  useEffect(() => {
    if (!selectedResumeId) {
      setRoadmap([]);
      setAccelerators([]);
      return;
    }

    const fetchDetailAndGenerate = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/document/${selectedResumeId}`);
        const json = await res.json();
        if (json.success) {
          setSelectedResumeInfo(json.data);
          
          // Trigger dynamic generation
          const genRes = await fetch("/api/ai/career-roadmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resumeData: json.data }),
          });

          if (!genRes.ok) throw new Error("Failed to generate career roadmap");
          const genJson = await genRes.json();
          
          setRoadmap(genJson.roadmap || []);
          setAccelerators(genJson.skillAccelerators || []);
        }
      } catch (e) {
        console.error(e);
        toast({
          title: "Roadmap Failed",
          description: "Could not generate your personalized roadmap. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetailAndGenerate();
  }, [selectedResumeId]);

  const handleRefine = async () => {
    if (!selectedResumeInfo) {
      toast({
        title: "Select Resume",
        description: "Please select a resume context first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const genRes = await fetch("/api/ai/career-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: selectedResumeInfo }),
      });

      if (!genRes.ok) throw new Error("Failed to generate career roadmap");
      const genJson = await genRes.json();
      
      setRoadmap(genJson.roadmap || []);
      setAccelerators(genJson.skillAccelerators || []);
      toast({
        title: "Roadmap Refined!",
        description: "Your trajectory has been updated with fresh industry insights.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Refining Failed",
        description: "Failed to refine trajectory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconForStatus = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("current")) return <Briefcase size={20} />;
    if (s.includes("next")) return <Target size={20} />;
    if (s.includes("projected") || s.includes("future")) return <Star size={20} />;
    return <Flag size={20} />;
  };

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Trajectory Planner"
        title="Career Roadmap"
        description="A dynamic, AI-generated professional path tailored to your specific resume, charting achievements and certifications required for your next steps."
        icon={<Map size={13} />}
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
            
            {selectedResumeId && (
              <Button
                onClick={handleRefine}
                disabled={loading}
                size="sm"
                className="h-10 gap-2 rounded-md bg-foreground text-background hover:bg-foreground/90 font-bold px-4 text-xs"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles size={14} />}
                Refine Trajectory
              </Button>
            )}
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
            <p className="text-indigo-600 font-bold animate-pulse uppercase tracking-widest text-[10px]">Mapping professional trajectory...</p>
          </motion.div>
        ) : !selectedResumeId ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto"
          >
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 animate-pulse">
              <Map size={40} />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">No Resume Context Selected</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Choose one of your resumes from the dropdown to calculate a tailored 3-year career path, milestones, and certification recommendations.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* Roadmap Nodes Flow */}
            <div className="relative">
              <div className="absolute left-4 top-4 h-[calc(100%-2rem)] w-px bg-border md:left-1/2" />
              <div className="space-y-6 md:space-y-8">
                {roadmap.map((node, i) => (
                  <div
                    key={i}
                    className={`relative grid gap-4 md:grid-cols-2 ${
                      i % 2 === 0 ? "" : "md:[&>*:first-child]:col-start-2"
                    }`}
                  >
                    <div className="ml-10 md:ml-0">
                      <PremiumPanel
                        className={
                          node.active
                            ? "border-indigo-500/40 bg-indigo-500 text-white shadow-lg shadow-indigo-500/15"
                            : "p-0"
                        }
                      >
                        <div className="p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <span
                              className={`text-[10px] font-black uppercase tracking-[0.18em] ${
                                node.active ? "text-white/70" : "text-indigo-500"
                              }`}
                            >
                              {node.status} · {node.year}
                            </span>
                            <div
                              className={`flex size-10 items-center justify-center rounded-md ${
                                node.active
                                  ? "bg-white/15"
                                  : "bg-indigo-500/10 text-indigo-500"
                              }`}
                            >
                              {getIconForStatus(node.status)}
                            </div>
                          </div>
                          <h3 className="text-2xl font-black tracking-tight">{node.role}</h3>
                          <p
                            className={`mt-1 text-sm ${
                              node.active ? "text-white/75" : "text-muted-foreground"
                            }`}
                          >
                            {node.company}
                          </p>

                          <div className="mt-6 space-y-3">
                            {node.milestones.map((m: string) => (
                              <div key={m} className="flex items-start gap-3">
                                <span
                                  className={`mt-1.5 size-1.5 rounded-full ${
                                    node.active ? "bg-white" : "bg-indigo-500"
                                  }`}
                                />
                                <span
                                  className={`text-sm font-medium ${
                                    node.active ? "text-white/85" : "text-foreground"
                                  }`}
                                >
                                  {m}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PremiumPanel>
                    </div>

                    <div className="absolute left-4 top-8 z-10 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border-4 border-background bg-indigo-500 md:left-1/2">
                      <div
                        className={`size-2 rounded-full bg-white ${
                          node.active ? "animate-ping" : ""
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Accelerators */}
            {accelerators.length > 0 && (
              <PremiumPanel className="overflow-hidden bg-foreground text-background">
                <div className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-background/60">
                      <GraduationCap size={14} />
                      Skill Accelerator
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">Turn roadmap gaps into resume evidence.</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-background/70">
                      AI recommendation to accelerate your transition to target levels. Focus on these strategic skillsets:
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {accelerators.map((acc: string, idx: number) => (
                      <Button
                        key={idx}
                        className="rounded-md bg-background text-foreground hover:bg-background/90 font-bold"
                      >
                        {acc}
                      </Button>
                    ))}
                  </div>
                </div>
              </PremiumPanel>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PremiumPage>
  );
};

export default CareerRoadmap;
