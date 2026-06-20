"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, GraduationCap, Sparkles, X, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useResumeContext } from "@/context/resume-info-provider";
import useUpdateDocument from "@/features/document/use-update-document";
import { toast } from "@/hooks/use-toast";
import {
  ExperienceType,
  EducationType,
  SkillType,
  ResumeDataType,
} from "@/types/resume.type";

type QuickKind = "experience" | "education" | "skill" | null;

// Touch-optimized floating action button for tablets/phones.
// Opens a bottom sheet with large tap targets to quickly append a resume entry.
// Falls back to a queued service-worker write when offline so users can keep editing.
const MobileQuickAdd = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<QuickKind>(null);
  const [value, setValue] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setIsOffline(!navigator.onLine);
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const queueOffline = (payload: any) => {
    if (typeof navigator === "undefined") return;
    navigator.serviceWorker?.controller?.postMessage({
      type: "queue-edit",
      payload,
    });
  };

  const commit = async (next: Partial<ResumeDataType>) => {
    if (!resumeInfo) return;
    const merged = { ...resumeInfo, ...next } as ResumeDataType;
    onUpdate(merged);

    if (isOffline) {
      queueOffline({
        url: `/api/document/update/${resumeInfo.documentId}`,
        method: "PATCH",
        body: next,
      });
      toast({
        title: "Saved offline",
        description: "Will sync when you reconnect.",
      });
      return;
    }
    try {
      await mutateAsync(next as any);
      toast({ title: "Added", description: "Resume updated." });
    } catch {
      toast({
        title: "Save failed",
        description: "Will retry on reconnect.",
        variant: "destructive",
      });
      queueOffline({
        url: `/api/document/update/${resumeInfo.documentId}`,
        method: "PATCH",
        body: next,
      });
    }
  };

  const handleSubmit = async () => {
    if (!value.trim() || !resumeInfo) return;

    if (kind === "skill") {
      const skill: SkillType = { name: value.trim(), rating: 3 };
      await commit({ skills: [...(resumeInfo.skills || []), skill] });
    } else if (kind === "experience") {
      const exp: ExperienceType = {
        title: value.trim(),
        companyName: null,
        city: null,
        state: null,
        startDate: null,
        endDate: null,
        currentlyWorking: false,
        workSummary: null,
      };
      await commit({ experiences: [...(resumeInfo.experiences || []), exp] });
    } else if (kind === "education") {
      const edu: EducationType = {
        universityName: value.trim(),
        startDate: null,
        endDate: null,
        degree: null,
        major: null,
        description: null,
      };
      await commit({ educations: [...(resumeInfo.educations || []), edu] });
    }

    setValue("");
    setKind(null);
    setOpen(false);
  };

  return (
    <>
      {/* FAB — visible only on small screens */}
      <button
        type="button"
        aria-label="Quick add"
        onClick={() => setOpen(true)}
        className={cn(
          "lg:hidden fixed bottom-6 right-6 z-40",
          "w-14 h-14 rounded-full bg-indigo-600 text-white",
          "shadow-xl shadow-indigo-600/40 active:scale-90 transition-transform",
          "flex items-center justify-center touch-manipulation"
        )}
      >
        <Plus size={24} />
      </button>

      {isOffline && (
        <div className="lg:hidden fixed bottom-24 right-6 z-40 flex items-center gap-1.5 rounded-full bg-amber-500/90 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg">
          <WifiOff size={12} /> Offline
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end"
            onClick={() => {
              setOpen(false);
              setKind(null);
              setValue("");
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full rounded-t-3xl bg-background border-t border-border p-5 pb-8 safe-bottom"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black">
                  {kind ? `Add ${kind}` : "Quick add"}
                </h3>
                <button
                  onClick={() => {
                    setOpen(false);
                    setKind(null);
                    setValue("");
                  }}
                  className="p-2 rounded-lg hover:bg-muted"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {!kind ? (
                <div className="grid grid-cols-3 gap-3">
                  <QuickButton
                    icon={<Briefcase size={22} />}
                    label="Experience"
                    onClick={() => setKind("experience")}
                  />
                  <QuickButton
                    icon={<GraduationCap size={22} />}
                    label="Education"
                    onClick={() => setKind("education")}
                  />
                  <QuickButton
                    icon={<Sparkles size={22} />}
                    label="Skill"
                    onClick={() => setKind("skill")}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    autoFocus
                    inputMode="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder={
                      kind === "skill"
                        ? "e.g. TypeScript"
                        : kind === "experience"
                          ? "Job title — e.g. Senior Engineer"
                          : "School — e.g. MIT"
                    }
                    className="w-full h-14 px-4 rounded-2xl bg-muted/50 border border-border text-base outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!value.trim()}
                    className={cn(
                      "w-full h-14 rounded-2xl font-bold text-base",
                      "bg-indigo-600 text-white active:scale-95 transition-transform",
                      "disabled:opacity-50 disabled:active:scale-100 touch-manipulation"
                    )}
                  >
                    Add to resume
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const QuickButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl",
      "bg-muted/40 border border-border hover:bg-muted active:scale-95 transition-transform",
      "h-24 touch-manipulation"
    )}
  >
    <span className="text-indigo-500">{icon}</span>
    <span className="text-xs font-bold">{label}</span>
  </button>
);

export default MobileQuickAdd;
