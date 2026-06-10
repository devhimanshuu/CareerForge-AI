"use client";
import { useResumeContext } from "@/context/resume-info-provider";
import { ShieldAlert } from "lucide-react";
import React, { useCallback } from "react";
import ResumeTitle from "./ResumeTitle";
import useUpdateDocument from "@/features/document/use-update-document";
import { toast } from "@/hooks/use-toast";

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
        },
      );
    },
    [resumeInfo, onUpdate, mutateAsync],
  );

  return (
    <>
      {resumeInfo?.status === "archived" && (
        <div className="absolute z-[9] inset-x-0 top-0 bg-destructive/90 backdrop-blur-sm text-center text-sm py-2 text-white flex items-center gap-2 justify-center font-medium">
          <ShieldAlert size={14} />
          This resume is in the trash bin
        </div>
      )}
      <div className="w-full flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
        {/* Left: Title + Save Status */}
        <div className="flex items-center gap-3 shrink-0 min-w-0">
          <ResumeTitle
            isLoading={isLoading || isPending}
            initialTitle={resumeInfo?.title || ""}
            status={resumeInfo?.status}
            onSave={(value) => handleTitle(value)}
          />
          {/* Auto-save indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/60">
            {isPending ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="save-pending">Saving...</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                Saved
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopSection;
