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
import { FileText, Loader2, Copy, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CoverLetterGenerator = () => {
  const { resumeInfo } = useResumeContext();
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState<"Confident" | "Enthusiastic" | "Formal" | "Direct">("Formal");


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
      const prompt = `
        You are an expert career coach and professional copywriter.
        Review the following Resume Data and the Job Description.
        
        Write a compelling, professional cover letter for this specific job based on the candidate's resume.
        
        TONE: ${tone}
        
        The cover letter should:
        1. Have a strong opening hook using a ${tone} tone.
        2. Highlight relevant experience and skills that match the job description.
        3. Explain why the candidate is a great fit for the company.
        4. End with a strong call to action.
        
        Output ONLY the text of the cover letter. Do not include any JSON formatting or intro text like "Here is the cover letter".
        Make it ready to copy-paste. Include placeholders like [Company Name] or [Hiring Manager Name] if not provided.


        Resume Data:
        ${JSON.stringify(resumeInfo)}

        Job Description:
        ${jobDescription}
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const responseText = aiResponse.response.text();
      
      setCoverLetter(responseText.trim());
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate cover letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Cover letter copied to clipboard.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary text-primary hover:bg-primary/5">
          <FileText size={16} />
          <span className="hidden lg:flex">Cover Letter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            AI Cover Letter Generator
          </DialogTitle>
          <DialogDescription>
            Generate a highly tailored cover letter based on your resume and the target job description.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Job Description
              </label>
              <Textarea
                placeholder="Paste the target job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {(["Confident", "Enthusiastic", "Formal", "Direct"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-bold border transition-all",
                      tone === t 
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                        : "bg-background border-border hover:border-primary/30"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !jobDescription.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Writing Cover Letter...
                </>
              ) : (
                "Generate Cover Letter"
              )}
            </Button>
          </div>

          <div className="bg-muted/30 rounded-xl p-5 border border-border/50 relative h-[360px] md:h-auto overflow-hidden flex flex-col">
            {!coverLetter && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-center">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Provide a job description to generate your custom cover letter.</p>
              </div>
            )}
            
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="w-10 h-10 mb-4 animate-spin text-primary" />
                <p className="text-sm animate-pulse">Crafting the perfect pitch...</p>
              </div>
            )}

            {coverLetter && !loading && (
              <>
                <div className="absolute top-3 right-3 z-10">
                  <Button size="icon" variant="secondary" onClick={handleCopy}>
                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed p-2">
                    {coverLetter}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoverLetterGenerator;
