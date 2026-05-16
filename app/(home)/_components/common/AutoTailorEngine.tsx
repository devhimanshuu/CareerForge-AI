"use client";
import React, { useState } from "react";
import { useResumeContext } from "@/context/resume-info-provider";
import { AIChatSession } from "@/lib/groq-model";
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
      const prompt = `
        You are an elite executive resume writer and ATS specialist.
        Your task is to take the provided Resume Data and the Target Job Description and rewrite the resume data to be perfectly tailored for this job.
        
        Rules for tailoring:
        1. Rewrite the "summary" to strongly align with the job description.
        2. For each experience in "experiences", rewrite the "workSummary" (HTML format) to highlight achievements relevant to the job. Use power verbs and quantify results if possible. Keep the original HTML tags (ul, li).
        3. Do not modify IDs, docIds, dates, or company names.
        
        Output ONLY a valid JSON object matching this structure (only return summary and experiences):
        {
          "summary": "new tailored summary",
          "experiences": [
            { "id": 1, "workSummary": "<ul><li>tailored bullet</li></ul>", ...other original fields }
          ]
        }

        Resume Data:
        ${JSON.stringify({ summary: resumeInfo?.summary, experiences: resumeInfo?.experiences })}

        Job Description:
        ${jobDescription}
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const responseText = aiResponse.response.text();
      
      // Extract JSON from response (robust against conversational filler)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON found in AI response");
      
      const parsedData = JSON.parse(jsonMatch[0]);
      
      if (parsedData.summary || parsedData.experiences) {
        const updatedResume = {
          ...resumeInfo,
          summary: parsedData.summary || resumeInfo?.summary,
          experiences: parsedData.experiences || resumeInfo?.experiences,
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
