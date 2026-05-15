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
      <div className="w-full flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <ResumeTitle
            isLoading={isLoading || isPending}
            initialTitle={resumeInfo?.title || ""}
            status={resumeInfo?.status}
            onSave={(value) => handleTitle(value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <AutoTailorEngine />
          <InterviewPrepAssistant />
          <CoverLetterGenerator />
          <AtsMatcher />
          <ThemeColor />
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
    </>
  );
};

export default TopSection;
