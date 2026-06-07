"use client";
import React from "react";
import TopSection from "./common/TopSection";
import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import { cn } from "@/lib/utils";
import ResumeDoctor from "./common/ResumeDoctor";
import { useResumeContext } from "@/context/resume-info-provider";
import { useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";


const EditResume = () => {
  const [activeTab, setActiveTab] = React.useState<"form" | "preview">("form");
  const [isMounted, setIsMounted] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  return (
    <div className="relative w-full h-[calc(100dvh-56px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation Bar - Professional Studio Look */}
      <div className="flex-none bg-background/80 backdrop-blur-xl z-30 border-b border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
         <div className="max-w-[1800px] mx-auto px-4 py-2.5">
            <TopSection />
         </div>
      </div>

      {/* Mobile Tab Switcher - Premium Glassmorphism */}
      <div className="flex-none lg:hidden flex justify-center p-3 bg-background/50 backdrop-blur-md border-b border-border/50 z-20">
          <div className="bg-muted/50 p-1 rounded-[16px] flex gap-1 w-full max-w-sm border border-border/20 shadow-inner">
            <button
              onClick={() => setActiveTab("form")}
              className={cn(
                "flex-1 py-2.5 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all duration-300",
                activeTab === "form"
                  ? "bg-white dark:bg-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={cn(
                "flex-1 py-2.5 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all duration-300",
                activeTab === "preview"
                  ? "bg-white dark:bg-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Preview
            </button>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative z-10 max-w-[1920px] mx-auto w-full">
        {isMounted && (
          isDesktop ? (
            <ResizablePanelGroup direction="horizontal" className="w-full h-full flex">
              {/* Form Section Sidebar - Clean & Focused */}
              <ResizablePanel
                defaultSize={42}
                minSize={25}
                maxSize={65}
                className="h-full overflow-y-auto bg-background relative z-10 custom-scrollbar shadow-[20px_0_40px_rgba(0,0,0,0.02)]"
              >
                <div className="max-w-2xl mx-auto h-full">
                  <ResumeForm />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-border/40 w-1.5 transition-colors hover:bg-indigo-500/50" />

              {/* Right Preview Panel */}
              <ResizablePanel
                defaultSize={58}
                minSize={35}
                maxSize={75}
                className="h-full overflow-y-auto relative flex justify-center py-12 px-8 xl:px-16 custom-scrollbar bg-slate-200/50 dark:bg-slate-900/40"
              >
                <div className="w-full max-w-[850px] flex justify-center transform-gpu hover:scale-[1.01] transition-transform duration-500 origin-top">
                   <ResumePreview />
                </div>

                {/* Floating Canvas Controls - Subtle UX detail */}
                <div className="fixed bottom-8 right-8 flex items-center gap-2 p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-2xl z-30">
                    <div className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground px-3">Live Canvas v2.4</div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            // Mobile Tabbed View: Only render active tab to optimize DOM and memory
            <div className="w-full h-full overflow-y-auto bg-background custom-scrollbar">
              {activeTab === "form" ? (
                <div className="max-w-2xl mx-auto px-4 py-6">
                  <ResumeForm />
                </div>
              ) : (
                <div className="w-full h-full min-h-screen py-12 px-4 bg-slate-200/50 dark:bg-slate-900/40 flex justify-center">
                  <div className="w-full max-w-[850px]">
                    <ResumePreview />
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* AI Resume Doctor - Live Health Audit */}
      <ResumeDoctor />
    </div>

  );
};


export default EditResume;
