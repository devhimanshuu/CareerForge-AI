"use client";

import React, { useState } from "react";
import { Flame, Loader2, UserCircle2, Skull, Zap, Ghost, Bot, ArrowRight, MessageSquareWarning } from "lucide-react";
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

const PERSONAS = [
  {
    id: "hr",
    name: "Apathetic HR Manager",
    icon: <Ghost className="text-blue-500" />,
    description: "I have 5 seconds per resume. Impress me or you're trash.",
    prompt: "Roast this resume from the perspective of a jaded, overworked HR manager who has seen 1000 resumes today and hates everyone. Be brutal, cynical, and focus on 'buzzword bingo' and formatting errors."
  },
  {
    id: "tech",
    name: "Hardcore Tech Lead",
    icon: <Skull className="text-red-500" />,
    description: "I smell fake experience from a mile away. Prove your code.",
    prompt: "Roast this resume from the perspective of a hardcore senior technical lead who only cares about impact, scaling, and architectural depth. Call out generic bullet points and lack of technical evidence."
  },
  {
    id: "startup",
    name: "Cocaine-Fueled CEO",
    icon: <Zap className="text-amber-500" />,
    description: "MOVE FAST! BREAK THINGS! ARE YOU A 10X DEVELOPER?",
    prompt: "Roast this resume from the perspective of a hyper-active startup CEO who only wants 'rockstars' and 'ninjas'. Mock anything that sounds too 'corporate' or slow."
  }
];

const RecruiterRoast = () => {
  const { resumeInfo } = useResumeContext();
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState("");
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [open, setOpen] = useState(false);

  const handleRoast = async () => {
    if (!resumeInfo) return;
    setLoading(true);
    setRoast("");

    try {
      const prompt = `
        ${selectedPersona.prompt}
        
        RESUME DATA:
        ${JSON.stringify(resumeInfo)}
        
        FORMAT:
        Output a brutal, funny, but ultimately helpful roast. Use emojis. End with one "Pro Tip" that would actually save their life.
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      setRoast(aiResponse.response.text());
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
            className="gap-2 border-red-500/30 text-red-500 hover:bg-red-50 transition-all font-black uppercase tracking-tighter"
        >
          <Flame size={16} fill="currentColor" />
          Recruiter Roast
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-w-2xl">
        <div className="bg-red-600 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Skull size={120} />
            </div>
            <DialogHeader className="text-left space-y-2 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Flame size={24} />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-white uppercase">The Recruiter Roast</DialogTitle>
                        <DialogDescription className="text-red-100 font-medium">
                            Choose your critic and prepare for the truth.
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>
        </div>

        <div className="p-8 bg-slate-950 min-h-[400px] flex flex-col">
            {!roast && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PERSONAS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPersona(p)}
                            className={`p-6 rounded-2xl border transition-all text-left flex flex-col gap-3 ${
                                selectedPersona.id === p.id 
                                ? "bg-red-500/10 border-red-500 ring-1 ring-red-500" 
                                : "bg-white/5 border-white/10 hover:border-white/20"
                            }`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                {p.icon}
                            </div>
                            <h3 className="text-white font-bold text-sm leading-tight">{p.name}</h3>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{p.description}</p>
                        </button>
                    ))}
                </div>
            )}

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center py-20 gap-6"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Flame className="text-red-500 animate-pulse" size={32} />
                            </div>
                        </div>
                        <p className="text-red-500 font-black uppercase tracking-[0.2em] text-xs animate-pulse">Heating up the grill...</p>
                    </motion.div>
                ) : roast ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 space-y-6"
                    >
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-slate-200 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                            {roast}
                        </div>
                        <div className="flex gap-4">
                             <Button 
                                onClick={() => setRoast("")}
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold"
                            >
                                Roast Me Again
                            </Button>
                            <Button 
                                onClick={() => setOpen(false)}
                                className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xl shadow-red-600/20"
                            >
                                I Learned My Lesson
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="mt-auto pt-8">
                        <Button 
                            onClick={handleRoast}
                            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg uppercase tracking-wider shadow-2xl shadow-red-600/40 group"
                        >
                            ROAST MY RESUME
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <p className="text-[10px] text-slate-500 text-center mt-4 font-bold uppercase tracking-widest">⚠️ WARNING: BRUTAL FEEDBACK AHEAD</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecruiterRoast;
