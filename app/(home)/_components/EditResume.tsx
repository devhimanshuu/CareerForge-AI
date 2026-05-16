"use client";
import React from "react";
import TopSection from "./common/TopSection";
import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import { cn } from "@/lib/utils";

const EditResume = () => {
  const [activeTab, setActiveTab] = React.useState<"form" | "preview">("form");

  return (
    <div className="relative w-full h-[calc(100vh-56px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
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
      <div className="flex-1 flex overflow-hidden relative z-10 max-w-[1920px] mx-auto w-full">
        
        {/* Form Section Sidebar - Clean & Focused */}
        <div
          className={cn(
            "w-full lg:w-[42%] xl:w-[40%] h-full overflow-y-auto border-r border-border/40 bg-background relative z-10 custom-scrollbar shadow-[20px_0_40px_rgba(0,0,0,0.02)]",
            activeTab === "form" ? "block" : "hidden lg:block",
          )}
        >
          <div className="max-w-2xl mx-auto h-full">
            <ResumeForm />
          </div>
        </div>

        {/* Live Preview Section - Immersive Workspace */}
        <div
          className={cn(
            "w-full lg:w-[58%] xl:w-[60%] h-full overflow-y-auto relative flex justify-center pt-10 pb-24 px-6 xl:px-12 custom-scrollbar bg-slate-100/30 dark:bg-slate-900/10",
            activeTab === "preview" ? "flex" : "hidden lg:flex",
          )}
        >
          <div className="w-full max-w-[850px] transform-gpu hover:scale-[1.01] transition-transform duration-500 origin-top">
             <div className="shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-sm overflow-hidden border border-white/10">
                <ResumePreview />
             </div>
          </div>

          {/* Floating Canvas Controls - Subtle UX detail */}
          <div className="fixed bottom-8 right-8 hidden lg:flex items-center gap-2 p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-2xl z-30">
              <div className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground px-3">Live Canvas v2.4</div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default EditResume;
