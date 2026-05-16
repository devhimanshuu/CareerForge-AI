"use client";

import React, { useState } from "react";
import { Clock, Loader2, Sparkles, History, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeContext } from "@/context/resume-info-provider";
import { toast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";

const TimeTraveler = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [year, setYear] = useState(2025);

  const handleTimeTravel = async (targetYear: number) => {
    if (!resumeInfo) return;
    
    // Save original data on first jump
    if (!originalData) {
      setOriginalData(resumeInfo);
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/time-traveler", {
        method: "POST",
        body: JSON.stringify({ 
          resumeData: originalData || resumeInfo, 
          targetYear 
        }),
      });
      const data = await res.json();
      
      if (data) {
        onUpdate(data);
        setYear(targetYear);
        setActive(true);
        toast({
          title: `Welcome to ${targetYear}!`,
          description: "Your future resume has been manifested.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Temporal Drift Failed",
        description: "Could not predict the future. The timeline is unstable.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetTimeline = () => {
    if (originalData) {
      onUpdate(originalData);
      setOriginalData(null);
      setYear(2025);
      setActive(false);
    }
  };

  return (
    <div className="relative group">
      <Button
        onClick={() => (active ? resetTimeline() : handleTimeTravel(2030))}
        disabled={loading}
        variant="ghost"
        size="icon"
        className={`w-8 h-8 rounded-lg transition-all ${
          active ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-slate-400 hover:text-white"
        }`}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : active ? (
          <History size={16} />
        ) : (
          <Clock size={16} />
        )}
      </Button>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-12 right-0 w-64 p-4 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl z-50 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Clock size={80} />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                        <TrendingUp size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Time-Traveler Active</span>
                </div>

                <div className="space-y-1">
                    <h4 className="text-xl font-black text-white italic">{year} Edition</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Predictions based on current trajectory and industry growth patterns.
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        <span>Current</span>
                        <span>Future</span>
                    </div>
                    <Slider 
                        defaultValue={[year]} 
                        max={2035} 
                        min={2025} 
                        step={1}
                        onValueCommit={(val) => handleTimeTravel(val[0])}
                    />
                </div>

                <Button 
                    onClick={resetTimeline}
                    variant="ghost" 
                    className="w-full h-8 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5"
                >
                    Restore Original Timeline
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeTraveler;
