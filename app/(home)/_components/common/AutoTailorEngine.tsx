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
import { Wand2, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import useUpdateDocument from "@/features/document/use-update-document";

const AutoTailorEngine = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isReflectionMode, setIsReflectionMode] = useState(true);

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job description.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSuccess(false);
    try {
      const response = await fetch(isReflectionMode ? "/api/ai/ats-reflection-tailor" : "/api/ai/auto-tailor", {
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
        throw new Error("Failed to automatically tailor the resume");
      }

      const parsedData = await response.json();
      
      if (parsedData.summary || parsedData.experiences) {
        const updatedExperiences = resumeInfo?.experiences?.map((exp: any) => {
          const tailored = parsedData.experiences?.find((e: any) => e.id === exp.id);
          if (tailored) {
            return {
              ...exp,
              workSummary: tailored.workSummary,
            };
          }
          return exp;
        }) || [];

        const updatedResume = {
          ...resumeInfo,
          summary: parsedData.summary || resumeInfo?.summary,
          experiences: updatedExperiences,
        };
        
        // Update local state
        onUpdate(updatedResume as any);
        
        // Save to backend
        await mutateAsync({
          summary: updatedResume.summary,
          experience: updatedResume.experiences as any,
        });

        setSuccess(true);
        toast({
          title: "Auto-Tailor Complete!",
          description: "Your resume has been completely rewritten to match the job.",
        });
        
        setTimeout(() => {
          setOpen(false);
        }, 3000);
      }
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Tailoring Failed",
        description: "Failed to automatically tailor the resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all hover:scale-105 border-0">
          <Sparkles size={16} className="text-yellow-300" />
          <span className="hidden lg:flex font-semibold">Auto-Tailor</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wand2 className="w-5 h-5 text-indigo-500" />
            Auto-Tailor Engine
          </DialogTitle>
          <DialogDescription>
            Paste a Job Description below. The AI will instantly rewrite your summary and experience bullet points to perfectly align with the role, maximizing your ATS score.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 shadow-inner">
            <div className="pr-4">
              <label className="text-xs font-bold text-foreground block">Multi-Agent Reflection Mode</label>
              <span className="text-[10px] text-muted-foreground font-semibold leading-normal block mt-0.5">Executes a 2-pass critique loop to avoid factual errors and optimize readability.</span>
            </div>
            <input 
              type="checkbox" 
              checked={isReflectionMode} 
              onChange={(e) => setIsReflectionMode(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0"
            />
          </div>
          <div>
            <Textarea
              placeholder="Paste the target job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[250px] resize-none border-indigo-200 focus-visible:ring-indigo-500"
            />
          </div>
          
          {success ? (
            <div className="w-full bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-center gap-2 border border-green-200">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Resume Successfully Tailored & Saved!</span>
            </div>
          ) : (
            <Button
              onClick={handleTailor}
              disabled={loading || !jobDescription.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md h-12 text-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Rewriting your resume... (this takes ~10s)
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Tailor My Resume Now
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoTailorEngine;
