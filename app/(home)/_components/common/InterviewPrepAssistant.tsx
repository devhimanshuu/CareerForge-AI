"use client";

import React, { useState } from "react";
import { useResumeContext } from "@/context/resume-info-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Loader2, Sparkles, BrainCircuit, Target, MessageSquareQuote, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const InterviewPrepAssistant = ({ initialResumeInfo }: { initialResumeInfo?: any }) => {
  const context = useResumeContext();
  const resumeInfo = initialResumeInfo || context?.resumeInfo;

  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [prepData, setPrepData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"questions" | "star">("questions");

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job description.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeData: resumeInfo,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate interview prep");
      }

      const data = await response.json();
      setPrepData(data);
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate interview prep. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-purple-500 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30">
          <Mic size={16} />
          <span className="hidden lg:flex">Mock Prep</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0">
        <div className="flex flex-col md:flex-row h-full overflow-hidden min-h-[600px]">
          {/* Left Panel: Input */}
          <div className="w-full md:w-[350px] border-r p-8 bg-muted/20 flex flex-col gap-6">
            <div className="space-y-2">
              <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                <BrainCircuit className="w-6 h-6 text-purple-500" />
                Interview AI
              </DialogTitle>
              <DialogDescription>
                Tailored interview strategies based on your resume and JD.
              </DialogDescription>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                  Target Job Description
                </label>
                <Textarea
                  placeholder="Paste the JD here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[300px] rounded-2xl resize-none border-none bg-background shadow-inner focus:ring-2 ring-purple-500/20"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={loading || !jobDescription.trim()}
                className="w-full h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 shadow-lg shadow-purple-500/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={16} />}
                Generate Interview Kit
              </Button>
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="flex-1 p-8 overflow-y-auto">
            {!prepData && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground opacity-40">
                <Target size={48} />
                <p className="max-w-xs font-medium">Generate your kit to see custom questions and STAR method helpers.</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                <p className="text-purple-600 font-bold animate-pulse uppercase tracking-widest text-[10px]">Analyzing Behavioral Patterns...</p>
              </div>
            )}

            {prepData && (
              <div className="space-y-8">
                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit">
                  <button
                    onClick={() => setActiveTab("questions")}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      activeTab === "questions" ? "bg-background shadow-sm text-purple-600" : "text-muted-foreground"
                    )}
                  >
                    Custom Questions
                  </button>
                  <button
                    onClick={() => setActiveTab("star")}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      activeTab === "star" ? "bg-background shadow-sm text-purple-600" : "text-muted-foreground"
                    )}
                  >
                    STAR Guide
                  </button>
                </div>

                {activeTab === "questions" ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {prepData.questions.map((q: any, i: number) => (
                        <div key={i} className="p-5 rounded-2xl bg-card border group hover:border-purple-500/50 transition-all">
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 font-black text-xs shrink-0">
                              0{i + 1}
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-bold text-sm leading-relaxed">{q.question}</h4>
                              <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
                                <MessageSquareQuote size={10} className="text-purple-400" />
                                INTENT: {q.intent}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 space-y-4">
                      <h3 className="text-rose-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <Target size={12} /> Potential Red Flags
                      </h3>
                      {prepData.weakPoints.map((wp: any, i: number) => (
                        <div key={i} className="space-y-1">
                          <p className="text-sm font-bold text-foreground/80">{wp.gap}</p>
                          <p className="text-xs text-muted-foreground">💡 <span className="font-bold text-rose-500/70">Pivot:</span> {wp.pivot}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {prepData.questions.map((q: any, i: number) => (
                      <div key={i} className="space-y-4">
                        <h4 className="font-black text-xs text-purple-500 flex items-center gap-2">
                          <CheckCircle2 size={14} /> QUESTION 0{i + 1}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <StarBox label="Situation" text={q.starHint.s} />
                          <StarBox label="Task" text={q.starHint.t} />
                          <StarBox label="Action" text={q.starHint.a} />
                          <StarBox label="Result" text={q.starHint.r} />
                        </div>
                        <div className="h-px bg-border/50 my-6" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StarBox = ({ label, text }: { label: string, text: string }) => (
  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
    <p className="text-[11px] leading-relaxed font-medium">{text}</p>
  </div>
);

export default InterviewPrepAssistant;
