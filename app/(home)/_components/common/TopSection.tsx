"use client";
import { useResumeContext } from "@/context/resume-info-provider";
import { ShieldAlert } from "lucide-react";
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
import TemplateSelector from "./TemplateSelector";
import AutoPageFit from "./AutoPageFit";
import CustomLayoutBuilder from "./CustomLayoutBuilder";
import LanguageTranslator from "./LanguageTranslator";
import MagicAI from "@/components/editor/MagicAI";
import MarketInsights from "@/components/editor/MarketInsights";
import {
  Wand2,
  Layout,
  FileEdit,
  DownloadCloud,
  ChevronDown,
  MoreHorizontal,
  Settings2,
  PenTool,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
      <div className="w-full flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pb-2">
        {/* Left: Title */}
        <div className="flex items-center shrink-0">
          <ResumeTitle
            isLoading={isLoading || isPending}
            initialTitle={resumeInfo?.title || ""}
            status={resumeInfo?.status}
            onSave={(value) => handleTitle(value)}
          />
        </div>

        {/* Right: Tools & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Studio Group */}
          <div className="flex items-center gap-2 pr-2 border-r border-border/50 shrink-0">
            <MagicAI />
            <MarketInsights />
          </div>

          {/* Design Group */}
          <div className="flex items-center shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground border-border/50 bg-muted/30 hover:bg-muted/50"
                  >
                    <Layout size={14} />
                    Design
                    <ChevronDown size={14} className="opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="p-2 min-w-[200px] space-y-1 [&_button]:w-full [&_button]:justify-start [&_button]:bg-transparent [&_button]:border-none [&_button]:shadow-none [&_button]:hover:bg-accent [&_button]:px-2 [&_span]:!flex"
                >
                  <div className="flex flex-col gap-1">
                    <TemplateSelector />
                    <AutoPageFit />
                    <CustomLayoutBuilder />
                    <ThemeColor />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>

          {/* Content Utilities Group */}
          <div className="flex items-center pr-2 border-r border-border/50 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground border-border/50 bg-muted/30 hover:bg-muted/50"
                  >
                    <FileEdit size={14} />
                    Content Tools
                    <ChevronDown size={14} className="opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="p-2 min-w-[200px] space-y-1 [&_button]:w-full [&_button]:justify-start [&_button]:bg-transparent [&_button]:border-none [&_button]:shadow-none [&_button]:hover:bg-accent [&_button]:px-2 [&_span]:!flex"
                >
                  <div className="flex flex-col gap-1">
                    <CoverLetterGenerator />
                    <AtsMatcher />
                    <LanguageTranslator />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>

          <div className="flex items-center shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 font-bold text-[10px] uppercase tracking-widest text-indigo-500 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10"
                >
                  <DownloadCloud size={14} />
                  Export & Share
                  <ChevronDown size={14} className="opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="p-2 min-w-[200px] space-y-1 [&_button]:w-full [&_button]:justify-start [&_button]:bg-transparent [&_button]:border-none [&_button]:shadow-none [&_button]:hover:bg-accent [&_button]:px-2 [&_span]:!flex"
              >
                <div className="flex flex-col gap-1">
                  <PreviewModal />
                  <Download
                    title={resumeInfo?.title || "Untitled Resume"}
                    status={resumeInfo?.status}
                    isLoading={isLoading}
                  />
                  <Share />
                  <MoreOption />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopSection;
