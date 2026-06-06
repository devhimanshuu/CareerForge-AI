"use client";

import React, { useState, useEffect } from "react";
import { Stethoscope, Activity, AlertCircle, CheckCircle2, X, Sparkles, Zap, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useResumeContext } from "@/context/resume-info-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import useUpdateDocument from "@/features/document/use-update-document";

interface Issue {
  type: "critical" | "warning" | "optimization";
  message: string;
  detail: string;
  autoFix?: string;
}

const ResumeDoctor = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  
  const [audit, setAudit] = useState<{
    score: number;
    issues: Issue[];
    insight: string;
  }>({ score: 100, issues: [], insight: "" });

  // Run real AI audit whenever the panel is opened or resume data updates
  useEffect(() => {
    if (!resumeInfo || !isOpen) return;

    const runAIAudit = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/resume-doctor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeData: resumeInfo }),
        });

        if (res.ok) {
          const data = await res.json();
          setAudit({
            score: data.score || 0,
            issues: data.issues || [],
            insight: data.aiInsight || "",
          });
        }
      } catch (e) {
        console.error("AI Audit failed:", e);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(runAIAudit, 800);
    return () => clearTimeout(timer);
  }, [resumeInfo, isOpen]);

  const handleAutoFixAll = async () => {
    if (!resumeInfo) return;
    setFixing(true);
    try {
      const res = await fetch("/api/ai/resume-doctor-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: resumeInfo }),
      });

      if (!res.ok) throw new Error("Auto-fix failed");
      const fixedResume = await res.json();

      // Update local state in context provider
      onUpdate(fixedResume as any);

      // Save to database
      await mutateAsync({
        summary: fixedResume.summary,
        experience: fixedResume.experiences as any,
        education: fixedResume.educations as any,
        skills: fixedResume.skills as any,
      });

      toast({
        title: "All Issues Resolved!",
        description: "Your summary, experience bullet points, and skills have been optimized.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Auto-fix Failed",
        description: "Failed to automatically optimize the resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFixing(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 z-[40] w-14 h-14 rounded-full bg-indigo-600 text-white shadow-2xl flex items-center justify-center group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Stethoscope size={24} className="relative z-10 group-hover:rotate-12 transition-transform" />
        
        {/* Badge */}
        {!loading && audit.issues.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-slate-950">
            {audit.issues.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full max-w-sm h-screen bg-slate-950 border-l border-white/10 z-[100] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-b border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Stethoscope size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white italic tracking-tight">Resume Doctor</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Live Health Audit</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-white/70">Overall Health</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-black uppercase",
                    audit.score > 80 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  )}>
                    {audit.score > 80 ? "Healthy" : "Needs Care"}
                  </span>
                </div>
                <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${audit.score}%` }}
                    className={cn(
                      "h-full transition-all duration-1000",
                      audit.score > 80 ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[8px] font-black text-white mix-blend-difference">{audit.score}/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Issues List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                  <p className="text-xs text-indigo-400 font-bold animate-pulse">Running AI Diagnostics...</p>
                </div>
              ) : audit.issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-bold">Perfect Health!</p>
                    <p className="text-xs text-slate-500">Your resume is optimized for maximum impact.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1 flex items-center gap-2">
                    <Activity size={12} />
                    Diagnostics Report
                  </p>
                  {audit.issues.map((issue, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                        issue.type === "critical" ? "bg-red-500/5 border-red-500/20" : 
                        issue.type === "warning" ? "bg-amber-500/5 border-amber-500/20" : 
                        "bg-blue-500/5 border-blue-500/20"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          issue.type === "critical" ? "bg-red-500 text-white" : 
                          issue.type === "warning" ? "bg-amber-500 text-white" : 
                          "bg-blue-500 text-white"
                        )}>
                          {issue.type === "critical" ? <AlertCircle size={16} /> : <Zap size={16} />}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-white leading-tight uppercase tracking-wide">{issue.message}</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{issue.detail}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5 space-y-4">
              {audit.insight && !loading && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                  <Sparkles size={16} className="text-indigo-400 shrink-0" />
                  <p className="text-[9px] text-indigo-300 italic font-medium leading-relaxed">
                    &quot;{audit.insight}&quot;
                  </p>
                </div>
              )}
              {audit.issues.length > 0 && (
                <Button 
                  onClick={handleAutoFixAll}
                  disabled={fixing || loading}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-white"
                >
                  {fixing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles size={12} />}
                  Auto-Fix All Issues
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ResumeDoctor;
