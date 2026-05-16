"use client";
import React, { useState } from "react";
import { useResumeContext } from "@/context/resume-info-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import SummaryForm from "./forms/SummaryForm";
import ExperienceForm from "./forms/ExperienceForm";
import EducationForm from "./forms/EducationForm";
import SkillsForm from "./forms/SkillsForm";
import { LinkedInImport } from "./LinkedInImport";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const steps = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Summary" },
  { id: 3, label: "Experience" },
  { id: 4, label: "Education" },
  { id: 5, label: "Skills" },
];

const ResumeForm = () => {
  const { resumeInfo } = useResumeContext();
  const [activeFormIndex, setActiveFormIndex] = useState(1);

  const handleNext = () => {
    const newIndex = activeFormIndex + 1;
    setActiveFormIndex(newIndex);
  };

  return (
    <div className="w-full flex flex-col h-full bg-background relative">
      {/* ── High-Fidelity Step Navigation ── */}
      <div className="sticky top-0 z-30 px-6 py-6 border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                  <h2 className="text-xl font-black tracking-tight text-foreground uppercase italic italic-none">Resume Builder</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                    Step {activeFormIndex} of {steps.length}: {steps[activeFormIndex-1].label}
                  </p>
              </div>
              <div className="flex items-center gap-2">
                 {activeFormIndex > 1 && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl w-9 h-9 border-border/50 hover:bg-muted"
                        onClick={() => setActiveFormIndex(activeFormIndex - 1)}
                    >
                        <ArrowLeft size={16} />
                    </Button>
                 )}
                 <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-9 font-bold gap-2 border-indigo-500/20 hover:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 px-4"
                    disabled={activeFormIndex === 5 || resumeInfo?.status === "archived"}
                    onClick={handleNext}
                 >
                    Next Step
                    <ArrowRight size={16} />
                 </Button>
              </div>
          </div>

          {/* Timeline Style Progress */}
          <div className="flex items-center w-full px-2">
            {steps.map((step, i) => (
              <React.Fragment key={step.id}>
                <div className="relative flex flex-col items-center">
                  <button
                    onClick={() => setActiveFormIndex(step.id)}
                    disabled={resumeInfo?.status === "archived"}
                    className={cn(
                        "relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 z-10",
                        activeFormIndex === step.id 
                            ? "bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] scale-110" 
                            : activeFormIndex > step.id
                            ? "bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.2)]"
                            : "bg-muted text-muted-foreground border border-border/50 hover:border-indigo-500/50 hover:bg-muted/80"
                    )}
                  >
                    {activeFormIndex > step.id ? (
                      <CheckCircle2 size={20} strokeWidth={2.5} />
                    ) : (
                      <span className="text-sm font-black tracking-tighter italic">0{step.id}</span>
                    )}
                    
                    {/* Tooltip Label */}
                    <span className={cn(
                        "absolute -bottom-8 whitespace-nowrap text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                        activeFormIndex === step.id ? "text-indigo-500 opacity-100" : "text-muted-foreground opacity-40"
                    )}>
                        {step.label}
                    </span>
                  </button>
                </div>
                
                {i < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-border/30 rounded-full" />
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: activeFormIndex > step.id ? "100%" : "0%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Portfolio Import Zone ── */}
      <div className="px-6 pt-12 pb-4">
        <div className="p-4 rounded-[24px] bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 border border-indigo-500/10 flex items-center justify-between shadow-sm group hover:border-indigo-500/20 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 group-hover:rotate-6 transition-transform">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest">Rapid Import</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">Auto-populate from LinkedIn or PDF</p>
                </div>
            </div>
            <LinkedInImport />
        </div>
      </div>

      {/* ── Core Form Content Area ── */}
      <div className="flex-1 px-6 py-6 custom-scrollbar overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {activeFormIndex === 1 && (
            <PersonalInfoForm handleNext={handleNext} />
          )}
          {activeFormIndex === 2 && <SummaryForm handleNext={handleNext} />}
          {activeFormIndex === 3 && <ExperienceForm handleNext={handleNext} />}
          {activeFormIndex === 4 && <EducationForm handleNext={handleNext} />}
          {activeFormIndex === 5 && <SkillsForm />}
        </div>
      </div>

      {/* ── Sticky Mobile Footer Navigation ── */}
      <div className="lg:hidden sticky bottom-0 z-30 px-6 py-4 bg-background/80 backdrop-blur-xl border-t border-border/40">
           <Button 
                onClick={handleNext}
                className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-600/20"
                disabled={activeFormIndex === 5}
           >
               Continue to Next Step
               <ArrowRight className="ml-2" size={18} />
           </Button>
      </div>
    </div>
  );
};


export default ResumeForm;
