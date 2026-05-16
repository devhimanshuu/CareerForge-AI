"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, Maximize, Minimize, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeContext } from "@/context/resume-info-provider";
import useUpdateDocument from "@/features/document/use-update-document";
import { toast } from "@/hooks/use-toast";
import { AIChatSession } from "@/lib/groq-model";

const AutoPageFit = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  const [loading, setLoading] = useState(false);

  const handleAutoFit = async () => {
    if (!resumeInfo) return;
    setLoading(true);

    try {
      // We'll ask the AI to suggest the best layout settings to fit a one-page A4
      // We'll also ask it to suggest which parts of the experience or summary to condense if it's way too long.
      const prompt = `
        You are an expert resume designer. Your goal is to optimize the following resume data to fit perfectly on ONE PAGE (A4) while maintaining maximum readability.
        
        CURRENT DATA:
        ${JSON.stringify(resumeInfo)}
        
        TASK:
        1. Analyze the current content volume.
        2. Suggest "settings": { "fontSize": "12px" | "14px" | "16px", "sectionSpacing": "10px" to "40px", "lineHeight": "1.2" to "1.8" }
        3. If the content is significantly too long, provide a "condensedSummary" or shorter bullet points for experiences.
        
        Output ONLY a JSON object:
        {
          "settings": {
            "fontSize": "14px",
            "sectionSpacing": "20px",
            "lineHeight": "1.4",
            "fontFamily": "font-open-sans"
          },
          "suggestions": "Brief explanation of changes"
        }
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const responseText = aiResponse.response.text();
      
      const jsonStr = responseText.match(/\{[\s\S]*\}/)?.[0] || "";
      const result = JSON.parse(jsonStr);

      if (result.settings) {
        const updatedInfo = { 
          ...resumeInfo, 
          settings: JSON.stringify({
            ...JSON.parse(resumeInfo.settings || "{}"),
            ...result.settings
          }),
          template: "custom" // Switch to custom to apply these settings
        };
        
        onUpdate(updatedInfo);
        await mutateAsync({
          settings: updatedInfo.settings,
          template: "custom"
        });

        toast({
          title: "AI Optimized!",
          description: result.suggestions || "Layout adjusted for perfect fit.",
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Optimization Failed",
        description: "AI couldn't find a perfect fit. Try manual adjustments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-bold"
      onClick={handleAutoFit}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Ruler size={16} />
      )}
      <span className="hidden lg:flex">AI Perfect Fit</span>
    </Button>
  );
};

export default AutoPageFit;
