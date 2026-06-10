"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeContext } from "@/context/resume-info-provider";
import useUpdateDocument from "@/features/document/use-update-document";
import { toast } from "@/hooks/use-toast";
import { AIChatSession } from "@/lib/groq-model";
import { generateThumbnail } from "@/lib/helper";
import { ResumeDataType } from "@/types/resume.type";
import { Loader, Sparkles, FileText, CheckCircle2, Lightbulb } from "lucide-react";
import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GeneratesSummaryType {
  fresher: string;
  mid: string;
  experienced: string;
}

const prompt = `Job Title: {jobTitle}. Based on the job title, please generate concise 
and complete summaries for my resume in JSON format, incorporating the following experience
levels: fresher, mid, and experienced. Each summary should be limited to 3 to 4 lines,
reflecting a personal tone and showcasing specific relevant programming languages, technologies,
frameworks, and methodologies without any placeholders or gaps. Ensure that the summaries are
engaging and tailored to highlight unique strengths, aspirations, and contributions to collaborative
projects, demonstrating a clear understanding of the role and industry standards.`;

const SummaryForm = (props: { handleNext: () => void }) => {
  const { handleNext } = props;
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync, isPending } = useUpdateDocument();
  const [loading, setLoading] = useState(false);
  const [aiGeneratedSummary, setAiGeneratedSummary] =
    useState<GeneratesSummaryType | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const summaryText = resumeInfo?.summary || "";
  const charCount = summaryText.length;
  const wordCount = summaryText.trim().split(/\s+/).filter(Boolean).length;

  const handleChange = (e: { target: { value: string } }) => {
    const { value } = e.target;
    const resumeDataInfo = resumeInfo as ResumeDataType;
    const updatedInfo = {
      ...resumeDataInfo,
      summary: value,
    };
    onUpdate(updatedInfo);
  };

  const handleSubmit = useCallback(
    async (e: { preventDefault: () => void }) => {
      e.preventDefault();
      if (!resumeInfo) return;
      const thumbnail = await generateThumbnail();
      const currentNo = resumeInfo?.currentPosition
        ? resumeInfo?.currentPosition + 1
        : 1;

      await mutateAsync(
        {
          currentPosition: currentNo,
          thumbnail: thumbnail,
          summary: resumeInfo?.summary,
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Summary updated successfully",
            });
            handleNext();
          },
          onError() {
            toast({
              title: "Error",
              description: "Failed to update summary",
              variant: "destructive",
            });
          },
        }
      );
    },
    [resumeInfo, handleNext, mutateAsync]
  );

  const GenerateSummaryFromAI = async () => {
    try {
      const jobTitle = resumeInfo?.personalInfo?.jobTitle;
      if (!jobTitle) {
        toast({
          title: "Missing job title",
          description: "Please add a job title in Personal Info first",
          variant: "destructive",
        });
        return;
      }
      setLoading(true);
      const PROMPT = prompt.replace("{jobTitle}", jobTitle);
      const result = await AIChatSession.sendMessage(PROMPT);
      const responseText = await result.response.text();
      setAiGeneratedSummary(JSON?.parse(responseText));
      setShowSuggestions(true);
    } catch (error) {
      toast({
        title: "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = useCallback(
    (summary: string) => {
      if (!resumeInfo) return;
      const resumeDataInfo = resumeInfo as ResumeDataType;
      const updatedInfo = {
        ...resumeDataInfo,
        summary: summary,
      };
      onUpdate(updatedInfo);
      setAiGeneratedSummary(null);
      setShowSuggestions(false);
    },
    [onUpdate, resumeInfo]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FileText size={16} className="text-purple-500" />
            </div>
            Professional Summary
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Write a compelling summary that highlights your strengths
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Summary Input Card */}
        <div className="section-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Your Summary
              </Label>
            </div>
            <Button
              variant="outline"
              type="button"
              className="gap-1.5 h-8 text-[10px] font-bold border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 transition-all hover:scale-105 active:scale-95"
              disabled={loading || isPending}
              onClick={() => GenerateSummaryFromAI()}
            >
              {loading ? (
                <Loader size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} className="text-indigo-500" />
              )}
              {loading ? "Generating..." : "Generate with AI"}
            </Button>
          </div>

          <Textarea
            className="min-h-40 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 focus-visible:border-indigo-500 transition-all resize-none leading-relaxed"
            required
            value={summaryText}
            onChange={handleChange}
            placeholder="Write a brief summary about your professional background, key achievements, and career goals..."
          />

          {/* Character/Word Count */}
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
            <span>
              {wordCount} words · {charCount} characters
            </span>
            <span
              className={cn(
                "transition-colors",
                charCount > 500 ? "text-amber-500" : charCount > 0 ? "text-emerald-500" : ""
              )}
            >
              {charCount > 500 ? "Consider keeping it under 500 chars" : "Good length"}
            </span>
          </div>
        </div>

        {/* AI Generated Suggestions */}
        <AnimatePresence>
          {aiGeneratedSummary && showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Lightbulb size={14} className="text-amber-500" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  AI Suggested Summaries
                </p>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground ml-auto"
                >
                  Dismiss
                </button>
              </div>

              {Object?.entries(aiGeneratedSummary)?.map(
                ([experienceType, summary], index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(summary)}
                      className="w-full text-left rounded-2xl border border-border/50 bg-card/50 p-4 transition-all duration-200 hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.99] group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
                          {experienceType?.charAt(0)?.toUpperCase() +
                            experienceType?.slice(1)}{" "}
                          Level
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to use →
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                        {summary}
                      </p>
                    </button>
                  </motion.div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          className="w-full h-11 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/10"
          type="submit"
          disabled={isPending || loading || resumeInfo?.status === "archived"}
        >
          {isPending ? (
            <Loader size="15px" className="animate-spin" />
          ) : (
            <>
              Save & Continue
              <span className="ml-1 text-xs opacity-70">→</span>
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default SummaryForm;
