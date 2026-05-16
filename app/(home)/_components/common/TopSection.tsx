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
      <div className="w-full flex flex-col gap-4">
        {/* Row 1: Title & Export Actions */}
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ResumeTitle
              isLoading={isLoading || isPending}
              initialTitle={resumeInfo?.title || ""}
              status={resumeInfo?.status}
              onSave={(value) => handleTitle(value)}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-indigo-500/5 backdrop-blur-sm rounded-xl p-1 border border-indigo-500/10">
            <div className="px-2 hidden md:flex items-center gap-2 text-indigo-500 border-r border-indigo-500/10 mr-1">
              <DownloadCloud size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Export & Share
              </span>
            </div>
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

        {/* Row 2: AI & Design Tools */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* AI Studio Group */}
          <div className="flex items-center gap-2 pr-4 border-r border-border/50 shrink-0">
            <MagicAI />
          </div>

          {/* Design Group */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border/50 shrink-0">
            <div className="px-2 hidden xl:flex items-center gap-1.5 text-muted-foreground border-r border-border/50 mr-1">
              <Layout size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Design
              </span>
            </div>

            <div className="hidden xl:flex items-center gap-1">
              <TemplateSelector />
              <AutoPageFit />
              <CustomLayoutBuilder />
              <ThemeColor />
            </div>

            {/* Mobile/Tablet Design Menu */}
            <div className="xl:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 font-bold text-[10px] uppercase tracking-widest px-2"
                  >
                    <Layout size={14} className="text-muted-foreground" />
                    Design
                    <ChevronDown size={12} className="opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="p-2 min-w-[180px] space-y-1"
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
          </div>

          {/* Content Utilities Group */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border/50 shrink-0">
            <div className="px-2 hidden 2xl:flex items-center gap-2 text-muted-foreground border-r border-border/50 mr-1">
              <FileEdit size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Content Tools
              </span>
            </div>

            <div className="hidden 2xl:flex items-center gap-1">
              <CoverLetterGenerator />
              <AtsMatcher />
              <LanguageTranslator />
            </div>

            {/* Mobile/Tablet Tools Menu */}
            <div className="2xl:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 font-bold text-[10px] uppercase tracking-widest px-2"
                  >
                    <PenTool size={14} className="text-muted-foreground" />
                    Tools
                    <ChevronDown size={12} className="opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="p-2 min-w-[180px] space-y-1"
                >
                  <div className="flex flex-col gap-1">
                    <CoverLetterGenerator />
                    <AtsMatcher />
                    <LanguageTranslator />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopSection;
