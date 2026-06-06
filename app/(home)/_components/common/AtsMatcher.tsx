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
import { Target, Loader2, CheckCircle, AlertTriangle, Lightbulb, Link as LinkIcon, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface AtsResult {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
}

const AtsMatcher = () => {
  const { resumeInfo } = useResumeContext();
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);

  const handleMatch = async () => {
    let textToAnalyze = jobDescription;

    if (inputType === "url") {
      if (!jobUrl.trim()) {
        toast({
          title: "Error",
          description: "Please enter a job description URL.",
          variant: "destructive",
        });
        return;
      }
      setLoading(true);
      try {
        const response = await fetch("/api/fetch-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: jobUrl.trim() }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch URL");
        }
        const data = await response.json();
        textToAnalyze = data.text;
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch job description from URL. Please try pasting the text instead.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    } else {
      if (!jobDescription.trim()) {
        toast({
          title: "Error",
          description: "Please enter a job description.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/ats-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeData: resumeInfo,
          jobDescription: textToAnalyze,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const parsedData = await response.json();
      setResult(parsedData);
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getColorByScore = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getBgColorByScore = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
          <Target size={16} />
          ATS Match
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            ATS Optimization Score
          </DialogTitle>
          <DialogDescription>
            Paste a job description or URL below to see how well your resume matches and get actionable tips.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="flex flex-col gap-5">
            <div className="flex p-1 bg-muted/50 rounded-xl w-full">
              <Button
                variant={inputType === "text" ? "secondary" : "ghost"}
                size="sm"
                className={`flex-1 gap-2 rounded-lg transition-all ${inputType === "text" ? "shadow-sm bg-background" : ""}`}
                onClick={() => setInputType("text")}
              >
                <FileText size={14} />
                Paste Text
              </Button>
              <Button
                variant={inputType === "url" ? "secondary" : "ghost"}
                size="sm"
                className={`flex-1 gap-2 rounded-lg transition-all ${inputType === "url" ? "shadow-sm bg-background" : ""}`}
                onClick={() => setInputType("url")}
              >
                <LinkIcon size={14} />
                Use Link
              </Button>
            </div>

            {inputType === "text" ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <FileText size={14} className="text-indigo-500" />
                  Job Description Text
                </label>
                <Textarea
                  placeholder="Paste the full job description text here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[300px] resize-none bg-muted/20 border-border/50 focus:border-indigo-500/50 transition-all rounded-xl"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <LinkIcon size={14} className="text-indigo-500" />
                  Job Description URL
                </label>
                <Input
                  placeholder="e.g. https://www.linkedin.com/jobs/view/..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="bg-muted/20 border-border/50 focus:border-indigo-500/50 transition-all rounded-xl h-11"
                />
                <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 mt-4">
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 leading-relaxed flex gap-2">
                    <Lightbulb size={14} className="shrink-0" />
                    Note: Our AI will attempt to extract requirements from the link. If it fails due to site protections, please switch to &apos;Paste Text&apos;.
                  </p>
                </div>
              </div>
            )}
            
            <Button
              onClick={handleMatch}
              disabled={loading || (inputType === "text" ? !jobDescription.trim() : !jobUrl.trim())}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                "Calculate Score"
              )}
            </Button>
          </div>

          <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center">
                <Target className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Enter a job description and calculate your score to see the analysis.</p>
              </div>
            )}
            
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="w-10 h-10 mb-4 animate-spin text-indigo-500" />
                <p className="text-sm animate-pulse">Running AI analysis against ATS algorithms...</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Score Section */}
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={351.86}
                        strokeDashoffset={351.86 - (351.86 * result.score) / 100}
                        className={getColorByScore(result.score)}
                        style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className={`text-3xl font-bold ${getColorByScore(result.score)}`}>
                        {result.score}%
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">Match Score</h3>
                </div>

                {/* Missing Keywords */}
                {result.missingKeywords.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded-md"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      Improvement Tips
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {result.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
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

export default AtsMatcher;
