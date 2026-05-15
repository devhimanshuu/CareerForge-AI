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
import { TrendingUp, Loader2, Target, BookOpen, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SkillGapAnalyzer = ({ initialResumeInfo }: { initialResumeInfo?: any }) => {
  const context = useResumeContext();
  const resumeInfo = initialResumeInfo || context?.resumeInfo;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const prompt = `
        You are a career strategist and industry analyst.
        Based on the candidate's Resume Data, analyze their target role (or current role) against current industry trends.
        
        RESUME DATA:
        ${JSON.stringify(resumeInfo)}
        
        Analyze:
        1. "Missing Skills": Identify 3-5 high-demand technical or soft skills they lack for their target level.
        2. "Industry Trends": What's changing in their field? (e.g., AI integration, specific frameworks).
        3. "Action Plan": Specific steps to bridge the gap.
        4. "Course Recommendations": Suggest 2-3 specific courses (from platforms like Coursera, Udemy, or YouTube) for the missing skills.
        
        Output the response in this exact JSON format:
        {
          "missingSkills": ["skill1", "skill2"],
          "trends": ["trend1", "trend2"],
          "recommendations": [
            {"skill": "Skill Name", "course": "Course Title", "platform": "Platform Name", "link": "search_query"}
          ]
        }
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const responseText = aiResponse.response.text();
      
      // Extract JSON from response
      const jsonStr = responseText.match(/\{[\s\S]*\}/)?.[0] || "";
      const data = JSON.parse(jsonStr);
      setAnalysis(data);
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze skill gaps. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
          <TrendingUp size={16} />
          <span className="hidden lg:flex">Skill Gap</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black">
            <Target className="w-6 h-6 text-emerald-500" />
            AI Skill Gap Analysis
          </DialogTitle>
          <DialogDescription className="text-base">
            Discover what skills you need to level up your career based on current market demands.
          </DialogDescription>
        </DialogHeader>

        {!analysis && !loading && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 animate-pulse">
              <Sparkles size={40} />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold mb-2">Ready for a reality check?</h3>
              <p className="text-muted-foreground text-sm">
                Our AI will compare your resume against thousands of job descriptions in your field to find exactly what's missing.
              </p>
            </div>
            <Button onClick={handleAnalyze} className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 rounded-2xl font-bold gap-2">
              Start Analysis
            </Button>
          </div>
        )}

        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
            <p className="text-emerald-600 font-bold animate-pulse">Scanning market trends...</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-8 py-4">
            {/* Missing Skills */}
            <div className="space-y-4">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Target size={14} className="text-emerald-500" />
                Missing Key Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((skill: string, i: number) => (
                  <span key={i} className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-sm font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Trends */}
            <div className="space-y-4">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <TrendingUp size={14} className="text-indigo-500" />
                Industry Trends
              </h3>
              <ul className="space-y-3">
                {analysis.trends.map((trend: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm font-medium p-4 rounded-2xl bg-muted/30 border">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    {trend}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="space-y-4 pb-4">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <BookOpen size={14} className="text-amber-500" />
                Learning Pathway
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {analysis.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="group p-5 rounded-3xl border bg-card hover:border-emerald-500/50 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-500 mb-1 block">{rec.skill}</span>
                        <h4 className="font-bold group-hover:text-emerald-600 transition-colors">{rec.course}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{rec.platform}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(rec.course + " " + rec.platform)}`} target="_blank">
                          <ExternalLink size={16} />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SkillGapAnalyzer;
