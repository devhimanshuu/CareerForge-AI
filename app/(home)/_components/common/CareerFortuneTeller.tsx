"use client";

import React, { useState } from "react";
import { Compass, Loader2, Target, GitBranch, ArrowRight, Star, GraduationCap, Building2, Briefcase } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

const CareerFortuneTeller = () => {
  const { resumeInfo } = useResumeContext();
  const [loading, setLoading] = useState(false);
  const [paths, setPaths] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [activePath, setActivePath] = useState(0);

  const predictFuture = async () => {
    if (!resumeInfo) return;
    setLoading(true);

    try {
      const prompt = `
        You are a futuristic career strategist. Analyze this candidate's resume and predict two distinct future career paths: one as an Individual Contributor (Technical/Creative Excellence) and one in Management/Leadership.
        
        DATA:
        Current Role: ${resumeInfo.personalInfo?.jobTitle}
        Skills: ${resumeInfo.skills?.map(s => s.name).join(", ")}
        
        TASK:
        For each path (IC and Management), provide:
        1. Next 3 job titles in progression.
        2. Expected 5-year salary potential.
        3. Top 3 "Critical Skills" needed to unlock this path.
        4. A "Strategic Move" (e.g., "Get an MBA" or "Lead an Open Source Project").
        
        Output ONLY a JSON object:
        {
          "paths": [
            {
              "type": "Individual Contributor",
              "titles": ["Senior Engineer", "Staff Engineer", "Principal Architect"],
              "potential": "$250k+",
              "skills": ["System Design", "Cloud Architecture", "Go/Rust"],
              "move": "Contribute to a major cloud-native open source project."
            },
            {
              "type": "Engineering Management",
              "titles": ["Engineering Manager", "Director of Eng", "VP of Engineering"],
              "potential": "$300k+",
              "skills": ["Team Leadership", "Product Strategy", "Budgeting"],
              "move": "Mentor 3 junior engineers and take over sprint planning."
            }
          ]
        }
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const jsonStr = aiResponse.response.text().match(/\{[\s\S]*\}/)?.[0] || "";
      setPaths(JSON.parse(jsonStr));
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
            className="gap-2 border-purple-500/30 text-purple-600 hover:bg-purple-50 transition-all font-bold"
        >
          <Compass size={16} />
          Fortune Teller
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-w-2xl">
        <div className="bg-purple-600 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <GitBranch size={120} />
            </div>
            <DialogHeader className="text-left space-y-2 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Target size={24} />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-white uppercase italic">The Career Fortune Teller</DialogTitle>
                        <DialogDescription className="text-purple-100 font-medium">
                            AI-powered trajectory modeling for your next 5 years.
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>
        </div>

        <div className="p-8 bg-slate-950 min-h-[450px] flex flex-col">
            {!paths && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-10">
                    <div className="flex gap-4">
                        <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400"
                        >
                            <Building2 size={24} />
                        </motion.div>
                        <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                            className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400"
                        >
                            <Target size={32} />
                        </motion.div>
                        <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                            className="w-12 h-12 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400"
                        >
                            <Briefcase size={24} />
                        </motion.div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-bold text-white">Where are you heading?</h3>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-[350px]">
                            Our predictive engine maps your current skills against industry standard career ladders to show you exactly how to level up.
                        </p>
                    </div>
                    <Button 
                        onClick={predictFuture}
                        className="w-full max-w-xs h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold gap-2 shadow-2xl shadow-purple-600/30"
                    >
                        See My Future
                        <ArrowRight size={18} />
                    </Button>
                </div>
            )}

            {loading && (
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Compass className="text-purple-500 animate-pulse" size={32} />
                        </div>
                    </div>
                    <p className="text-purple-500 font-black uppercase tracking-[0.2em] text-xs animate-pulse">Modeling Career Trajectories...</p>
                </div>
            )}

            {paths && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 space-y-8"
                >
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                        {paths.paths.map((p: any, i: number) => (
                            <button
                                key={i}
                                onClick={() => setActivePath(i)}
                                className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activePath === i 
                                    ? "bg-purple-600 text-white shadow-lg" 
                                    : "text-slate-400 hover:text-white"
                                }`}
                            >
                                {p.type}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-8 relative">
                        <div className="absolute left-[27px] top-6 bottom-6 w-px bg-gradient-to-b from-purple-500/50 via-purple-500/20 to-transparent" />
                        
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activePath}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {paths.paths[activePath].titles.map((title: string, i: number) => (
                                    <div key={i} className="flex items-center gap-6 relative group">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 z-10 transition-all ${
                                            i === 0 ? "bg-purple-600 border-purple-400" : "bg-slate-900 border-white/10 group-hover:border-purple-500/50"
                                        }`}>
                                            {i === 0 ? <Star className="text-white" size={20} /> : <span className="text-xs font-bold text-slate-500">{i + 1}</span>}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-bold transition-all ${i === 0 ? "text-purple-400 text-lg" : "text-white text-base"}`}>
                                                {title}
                                            </h4>
                                            {i === 2 && <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Potential: {paths.paths[activePath].potential}</span>}
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-8 space-y-4">
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                                        <h5 className="text-[10px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-2">
                                            <GraduationCap size={14} />
                                            Required to Unlock
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {paths.paths[activePath].skills.map((s: string, i: number) => (
                                                <span key={i} className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-[10px] font-bold border border-purple-500/20">{s}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                                        <h5 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                                            <ArrowRight size={14} />
                                            Strategic Next Move
                                        </h5>
                                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                            {paths.paths[activePath].move}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CareerFortuneTeller;
