"use client";

import React, { useState } from "react";
import { Languages, Loader2, Globe, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResumeContext } from "@/context/resume-info-provider";
import useUpdateDocument from "@/features/document/use-update-document";
import { toast } from "@/hooks/use-toast";
import { AIChatSession } from "@/lib/groq-model";

const LANGUAGES = [
  { code: "en", name: "English", icon: "🇺🇸" },
  { code: "es", name: "Spanish", icon: "🇪🇸" },
  { code: "fr", name: "French", icon: "🇫🇷" },
  { code: "de", name: "German", icon: "🇩🇪" },
  { code: "ja", name: "Japanese", icon: "🇯🇵" },
  { code: "zh", name: "Chinese", icon: "🇨🇳" },
];

const LanguageTranslator = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  const [loading, setLoading] = useState(false);

  const handleTranslate = async (langName: string) => {
    if (!resumeInfo) return;
    setLoading(true);

    try {
      const prompt = `
        You are an expert translator specializing in professional resumes and technical terminology.
        Translate the following Resume Data into ${langName}.
        
        DATA:
        ${JSON.stringify(resumeInfo)}
        
        RULES:
        1. Translate all visible content including job titles, summaries, experience descriptions, and skills.
        2. Ensure technical terms are translated contextually (e.g., use the local industry equivalent).
        3. Maintain the exact same JSON structure.
        4. Do NOT translate proper names of companies or universities unless they have a standard localized version.
        
        Output ONLY the translated JSON object.
      `;

      const aiResponse = await AIChatSession.sendMessage(prompt);
      const responseText = aiResponse.response.text();
      
      const jsonStr = responseText.match(/\{[\s\S]*\}/)?.[0] || "";
      const translatedData = JSON.parse(jsonStr);

      // Preserve IDs from original data
      const finalData = {
        ...translatedData,
        documentId: resumeInfo.documentId,
        id: resumeInfo.id,
        userId: resumeInfo.userId
      };

      onUpdate(finalData);
      
      // Update DB
      await mutateAsync({
        personalInfo: finalData.personalInfo,
        experience: finalData.experiences,
        education: finalData.educations,
        skills: finalData.skills,
        summary: finalData.summary,
        title: finalData.title + ` (${langName})`
      });

      toast({
        title: `Translated to ${langName}`,
        description: "Your resume content has been successfully localized.",
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Translation Failed",
        description: "AI encountered an issue translating your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-blue-500/50 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Globe size={16} />
          )}
          <span className="hidden lg:flex">Translate</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-none shadow-2xl">
        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Sparkles size={12} className="text-blue-500" />
            AI Contextual Translation
        </div>
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleTranslate(lang.name)}
            className="rounded-xl cursor-pointer py-2.5 gap-3"
          >
            <span className="text-lg">{lang.icon}</span>
            <span className="font-bold text-xs">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageTranslator;
