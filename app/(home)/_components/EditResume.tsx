"use client";
import React from "react";
import TopSection from "./common/TopSection";
import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import { cn } from "@/lib/utils";

const EditResume = () => {
  const [activeTab, setActiveTab] = React.useState<"form" | "preview">("form");

  return (
    <div className="relative w-full h-[calc(100vh-56px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900/50">
      {/* Top Navigation Bar */}
      <div className="flex-none bg-background shadow-sm border-b border-border/50 z-20">
         <div className="px-4 py-2">
            <TopSection />
         </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex-none lg:hidden flex justify-center p-3 bg-background border-b border-border/50 z-20">
          <div className="bg-muted/50 p-1 rounded-xl flex gap-1 w-full max-w-sm">
            <button
              onClick={() => setActiveTab("form")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                activeTab === "form"
                  ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Edit Details
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                activeTab === "preview"
                  ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Live Preview
            </button>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Form Section Sidebar */}
        <div
          className={cn(
            "w-full lg:w-[45%] h-full overflow-y-auto border-r border-border/50 bg-background relative z-10 custom-scrollbar",
            activeTab === "form" ? "block" : "hidden lg:block",
          )}
        >
          <ResumeForm />
        </div>

        {/* Live Preview Section */}
        <div
          className={cn(
            "w-full lg:w-[55%] h-full overflow-y-auto relative justify-center pt-8 pb-16 px-4 custom-scrollbar",
            activeTab === "preview" ? "flex" : "hidden lg:flex",
          )}
        >
          <ResumePreview />
        </div>
      </div>
    </div>
  );
};

export default EditResume;
