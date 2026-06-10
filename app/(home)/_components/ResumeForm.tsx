"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useResumeContext } from "@/context/resume-info-provider";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Keyboard,
} from "lucide-react";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import SummaryForm from "./forms/SummaryForm";
import ExperienceForm from "./forms/ExperienceForm";
import EducationForm from "./forms/EducationForm";
import SkillsForm from "./forms/SkillsForm";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 1, label: "Personal Info", estimatedTime: "2 min" },
  { id: 2, label: "Summary", estimatedTime: "3 min" },
  { id: 3, label: "Experience", estimatedTime: "5 min" },
  { id: 4, label: "Education", estimatedTime: "2 min" },
  { id: 5, label: "Skills", estimatedTime: "2 min" },
];

const ResumeForm = () => {
  const { resumeInfo } = useResumeContext();
  const [activeFormIndex, setActiveFormIndex] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Mark steps as completed based on resumeInfo
  useEffect(() => {
    const completed: number[] = [];
    if (resumeInfo?.personalInfo?.firstName) completed.push(1);
    if (resumeInfo?.summary) completed.push(2);
    if (resumeInfo?.experiences?.length) completed.push(3);
    if (resumeInfo?.educations?.length) completed.push(4);
    if (resumeInfo?.skills?.length) completed.push(5);
    setCompletedSteps(new Set(completed));
  }, [resumeInfo]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Arrow keys for navigation
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "ArrowLeft" && activeFormIndex > 1) {
          e.preventDefault();
          setActiveFormIndex((prev) => prev - 1);
        } else if (e.key === "ArrowRight" && activeFormIndex < 5) {
          e.preventDefault();
          setActiveFormIndex((prev) => prev + 1);
        }
      }
      // Alt+1-5 for direct step navigation
      if (e.altKey && ["1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        setActiveFormIndex(parseInt(e.key));
      }
      // ? for shortcuts help (only when not in input)
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          setShowShortcuts((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFormIndex]);

  const handleNext = useCallback(() => {
    setActiveFormIndex((prev) => Math.min(prev + 1, 5));
  }, []);

  const handlePrev = useCallback(() => {
    setActiveFormIndex((prev) => Math.max(prev - 1, 1));
  }, []);

  const completionPercentage = useMemo(() => {
    const completedCount = Array.from(completedSteps).length;
    return Math.round((completedCount / steps.length) * 100);
  }, [completedSteps]);

  const currentStep = steps[activeFormIndex - 1];

  return (
    <div className="w-full flex flex-col h-full bg-background relative">
      {/* ── Keyboard Shortcuts Overlay ── */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border border-border/50 rounded-b-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Keyboard size={14} className="text-indigo-500" />
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { keys: "Ctrl + ←", desc: "Previous step" },
                { keys: "Ctrl + →", desc: "Next step" },
                { keys: "Alt + 1-5", desc: "Jump to step" },
                { keys: "?", desc: "Toggle shortcuts" },
              ].map((shortcut) => (
                <div key={shortcut.keys} className="flex items-center gap-3">
                  <kbd className="px-2 py-1 rounded-lg bg-muted border border-border/50 font-mono text-[10px] font-bold">
                    {shortcut.keys}
                  </kbd>
                  <span className="text-muted-foreground">{shortcut.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step Navigation ── */}
      <div className="sticky top-0 z-30 px-5 py-4 border-b border-border/30 bg-background/95 backdrop-blur-xl">
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Compact Step Indicator */}
              <div className="flex items-center gap-0.5">
                {steps.map((step, i) => (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => setActiveFormIndex(step.id)}
                      disabled={resumeInfo?.status === "archived"}
                      className={cn(
                        "step-dot",
                        activeFormIndex === step.id && "active",
                        completedSteps.has(step.id) && activeFormIndex !== step.id && "completed",
                        !completedSteps.has(step.id) && activeFormIndex !== step.id && "pending"
                      )}
                    >
                      {completedSteps.has(step.id) && activeFormIndex !== step.id ? (
                        <CheckCircle2 size={14} strokeWidth={3} />
                      ) : (
                        <span className="italic tracking-tighter">0{step.id}</span>
                      )}
                    </button>
                    {i < steps.length - 1 && (
                      <div className="w-6 h-[2px] relative overflow-hidden mx-0.5">
                        <div className="absolute inset-0 bg-border/30 rounded-full" />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: completedSteps.has(step.id) || activeFormIndex > step.id ? "100%" : "0%",
                          }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Current Step Label */}
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                  {currentStep.label}
                </span>
                <span className="text-[9px] text-muted-foreground/50 font-bold">
                  ~{currentStep.estimatedTime}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Shortcuts */}
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/30 border border-border/30 text-[9px] font-bold text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all"
              >
                <Keyboard size={10} />
                ?
              </button>

              <div className="toolbar-divider hidden sm:block" />

              {/* Navigation Buttons */}
              {activeFormIndex > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  onClick={handlePrev}
                >
                  <ArrowLeft size={15} />
                </Button>
              )}
              <Button
                size="sm"
                className="h-8 font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 shadow-md shadow-indigo-600/20 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                disabled={activeFormIndex === 5 || resumeInfo?.status === "archived"}
                onClick={handleNext}
              >
                Next
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* Compact Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-muted/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-[9px] font-black text-muted-foreground/60 tabular-nums">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Core Form Content Area ── */}
      <div className="flex-1 px-6 py-6 custom-scrollbar overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFormIndex}
              initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeFormIndex === 1 && <PersonalInfoForm handleNext={handleNext} />}
              {activeFormIndex === 2 && <SummaryForm handleNext={handleNext} />}
              {activeFormIndex === 3 && <ExperienceForm handleNext={handleNext} />}
              {activeFormIndex === 4 && <EducationForm handleNext={handleNext} />}
              {activeFormIndex === 5 && <SkillsForm />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Sticky Mobile Footer Navigation ── */}
      <div className="lg:hidden sticky bottom-0 z-30 px-6 py-4 bg-background/80 backdrop-blur-xl border-t border-border/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-[9px] font-black text-muted-foreground">
            {completionPercentage}%
          </span>
        </div>
        <Button
          onClick={handleNext}
          className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-600/20 transition-all duration-200 active:scale-[0.98]"
          disabled={activeFormIndex === 5}
        >
          {activeFormIndex < 5 ? (
            <>
              Continue to {steps[activeFormIndex]?.label}
              <ArrowRight className="ml-2" size={18} />
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2" size={18} />
              All Steps Complete
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ResumeForm;
