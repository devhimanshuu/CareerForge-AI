"use client";

import React, { useState } from "react";
import { Sparkles, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export const CoverLetterSection = ({ app }: { app: any }) => {
  const [jd, setJd] = useState("");
  const [tone, setTone] = useState("Confident");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");

  const handleGenerate = async () => {
    if (!jd.trim()) {
      toast({
        title: "Job Description Required",
        description: "Paste the JD to tailor your letter.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/application/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: app.documentId,
          jobDescription: jd,
          tone,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedLetter(json.content);
        toast({
          title: "Letter Generated!",
          description: "Tailored to your resume and the job.",
        });
      } else {
        throw new Error(json.message || "Generation failed");
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Generation Failed",
        description: e.message || "Could not generate cover letter.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" />
          AI Cover Letter Generator
        </h3>
        <div className="flex gap-2">
          {["Confident", "Enthusiastic", "Formal", "Direct"].map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={cn(
                "px-2 py-1 rounded-md text-[10px] font-bold border transition-all",
                tone === t
                  ? "bg-indigo-500 border-indigo-500 text-white"
                  : "border-border hover:bg-muted",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {!generatedLetter ? (
        <div className="space-y-4">
          <textarea
            className="w-full h-40 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 focus:ring-2 ring-indigo-500/20 text-sm resize-none"
            placeholder="Paste the job description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
          <Button
            className="w-full h-12 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 gap-2"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            Generate Tailored Cover Letter
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-sm leading-relaxed whitespace-pre-wrap font-serif">
            {generatedLetter}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl font-bold"
              onClick={() => setGeneratedLetter("")}
            >
              Start Over
            </Button>
            <Button
              className="flex-1 h-11 rounded-xl font-bold bg-indigo-600"
              onClick={() => {
                navigator.clipboard.writeText(generatedLetter);
                toast({
                  title: "Copied!",
                  description: "Letter copied to clipboard.",
                });
              }}
            >
              Copy to Clipboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
