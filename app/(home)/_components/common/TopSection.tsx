"use client";
import { useResumeContext } from "@/context/resume-info-provider";
import { AlertCircle, ShieldAlert } from "lucide-react";
import React, { useCallback } from "react";
import ResumeTitle from "./ResumeTitle";
import useUpdateDocument from "@/features/document/use-update-document";
import { toast } from "@/hooks/use-toast";
import ThemeColor from "./ThemeColor";
import PreviewModal from "../PreviewModal";
import Download from "./Download";
import Share from "./Share";
import MoreOption from "./MoreOption";
import AtsMatcher from "./AtsMatcher";
import CoverLetterGenerator from "./CoverLetterGenerator";
import InterviewPrepAssistant from "./InterviewPrepAssistant";
import AutoTailorEngine from "./AutoTailorEngine";
import SkillGapAnalyzer from "./SkillGapAnalyzer";
import TemplateSelector from "./TemplateSelector";
import CustomLayoutBuilder from "./CustomLayoutBuilder";
import AutoPageFit from "./AutoPageFit";
import LanguageTranslator from "./LanguageTranslator";





const TopSection = () => {
  const { resumeInfo, isLoading, onUpdate } = useResumeContext();
  const { mutateAsync, isPending } = useUpdateDocument();

  const handleTitle = useCallback(
    (title: string) => {
      if (title === "Untitled Resume" && !title) return;

      if (resumeInfo) {
        onUpdate({
          ...resumeInfo,
          title: title,
        });
      }

      mutateAsync(
        {
          title: title,
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Title updated successfully",
            });
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update the title",
              variant: "destructive",
            });
          },
        }
      );
    },
    [resumeInfo, onUpdate, mutateAsync]
  );
  return (
    <>
      {resumeInfo?.status === "archived" && (
        <div
          className="
            absolute z-[9] inset-x-0 top-0
            bg-destructive/90 backdrop-blur-sm
            text-center text-sm py-2 text-white
            flex items-center gap-2
            justify-center font-medium
          "
        >
          <ShieldAlert size="14px" />
          This resume is in the trash bin
        </div>
      )}
      <div className="w-full flex flex-col xl:flex-row items-start xl:items-center justify-between border-b border-border/50 pb-4 gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <ResumeTitle
            isLoading={isLoading || isPending}
            initialTitle={resumeInfo?.title || ""}
            status={resumeInfo?.status}
            onSave={(value) => handleTitle(value)}
          />
        </div>
        <div className="w-full flex flex-col gap-2.5 pb-1 xl:ml-auto xl:max-w-fit">
          {/* Top Row: Builder & Design */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full justify-start xl:justify-end">
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10 shrink-0">
              <AutoTailorEngine />
              <InterviewPrepAssistant />
              <SkillGapAnalyzer />
            </div>
            
            <div className="w-px h-6 bg-border/50 mx-1 shrink-0 hidden sm:block" />
            
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/30 border border-border/50 shrink-0">
              <TemplateSelector />
              <AutoPageFit />
              <CustomLayoutBuilder />
              <ThemeColor />

            </div>
          </div>

          {/* Bottom Row: Utilities & Actions */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full justify-start xl:justify-end">
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/30 border border-border/50 shrink-0">
               <CoverLetterGenerator />
               <AtsMatcher />
               <LanguageTranslator />
            </div>

            <div className="w-px h-6 bg-border/50 mx-1 shrink-0 hidden sm:block" />
            
            <div className="flex items-center gap-1.5 shrink-0 bg-background/50 backdrop-blur-sm rounded-lg p-1">
              <PreviewModal />
              <Download
                title={resumeInfo?.title || "Untitled Resume"}
                status={resumeInfo?.status}
                isLoading={isLoading}
              />
              <Share />
              <MoreOption />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopSection;
