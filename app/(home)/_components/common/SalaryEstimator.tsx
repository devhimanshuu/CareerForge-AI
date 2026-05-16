"use client";

import React, { useState } from "react";
import { DollarSign, Loader2, TrendingUp, Info, Globe, MapPin, Calculator, BarChart4, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useResumeContext } from "@/context/resume-info-provider";
import { AIChatSession } from "@/lib/groq-model";
import { motion } from "framer-motion";

const SalaryEstimator = () => {
  const { resumeInfo } = useResumeContext();
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const calculateMarketValue = async () => {
    if (!resumeInfo) return;
    setLoading(true);

    try {
      const prompt = `
        You are a high-end technical recruiter and market analyst. Estimate the annual salary market value for the following candidate profile.
        
        DATA:
        Role: ${resumeInfo.personalInfo?.jobTitle}
        Experience: ${resumeInfo.experiences?.length || 0} roles
        Skills: ${resumeInfo.skills?.map(s => s.name).join(", ")}
        
        TASK:
        1. Estimate the 25th, 50th (Median), and 75th percentile annual salaries in USD for major tech hubs (SF/NYC/London/Remote).
        2. Identify "Premium Skills" in their profile that increase their value.
        3. Identify "Missing Skills" that could boost their salary by 20%+.
        
        Output ONLY a JSON object:
        {
          "median": "$145k",
          "range": "$120k - $185k",
          "percentiles": [
            {"label": "Entry", "value": "$110k"},
            {"label": "Median", "value": "$145k"},
            {"label": "Top 10%", "value": "$210k"}
          ],
          "premiumSkills": ["Next.js", "AI Integration"],
          "growthTips": ["Add System Design", "Cloud Architecture"]
        }
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const jsonStr = aiResponse.response.text().match(/\{[\s\S]*\}/)?.[0] || "";
      setEstimate(JSON.parse(jsonStr));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 transition-all font-bold"
        >
          <DollarSign size={16} />
          Market Value
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-w-xl">
        <div className="bg-emerald-600 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <BarChart4 size={120} />
            </div>
            <DialogHeader className="text-left space-y-2 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-white">Market Value Estimator</DialogTitle>
                        <DialogDescription className="text-emerald-100 font-medium">
                            AI-driven salary benchmarking based on your skills.
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>
        </div>

        <div className="p-8 bg-background min-h-[350px] flex flex-col items-center justify-center">
            {!estimate && !loading && (
                <div className="text-center space-y-6">
                    <div className="flex justify-center gap-4">
                        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 flex flex-col items-center gap-1">
                            <Globe size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Global Data</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 flex flex-col items-center gap-1">
                            <MapPin size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Hub Specific</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 flex flex-col items-center gap-1">
                            <Calculator size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Skill Multiplier</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[300px]">
                        Our AI analyzes thousands of data points from Levels.fyi, Glassdoor, and H1B filings to estimate your current worth.
                    </p>
                    <Button 
                        onClick={calculateMarketValue}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold gap-2"
                    >
                        Calculate My Worth
                        <ArrowUpRight size={18} />
                    </Button>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                    <p className="text-sm font-bold animate-pulse text-emerald-600">Analyzing market trends...</p>
                </div>
            )}

            {estimate && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full space-y-8"
                >
                    <div className="text-center space-y-1">
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Estimated Median Salary</h3>
                        <div className="text-5xl font-black text-emerald-600 tracking-tight">{estimate.median}</div>
                        <div className="text-xs font-bold text-muted-foreground">{estimate.range} range</div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {estimate.percentiles.map((p: any, i: number) => (
                            <div key={i} className="p-3 rounded-xl bg-muted/50 border text-center space-y-1">
                                <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{p.label}</div>
                                <div className="text-sm font-bold">{p.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                             <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-2 flex items-center gap-1.5">
                                <Info size={12} />
                                High Value Skills Found
                             </h4>
                             <div className="flex flex-wrap gap-2">
                                {estimate.premiumSkills.map((s: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">{s}</span>
                                ))}
                             </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                             <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-2 flex items-center gap-1.5">
                                <TrendingUp size={12} />
                                How to reach {estimate.percentiles[2].value}+
                             </h4>
                             <div className="flex flex-wrap gap-2">
                                {estimate.growthTips.map((s: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">{s}</span>
                                ))}
                             </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalaryEstimator;
