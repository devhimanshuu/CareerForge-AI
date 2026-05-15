"use client";
import React from "react";
import TopSection from "./common/TopSection";
import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import { cn } from "@/lib/utils";

const EditResume = () => {
  const [activeTab, setActiveTab] = React.useState<"form" | "preview">("form");

  return (
    <div className="relative w-full">
      <div
        className="w-full mx-auto max-w-7xl 3xl:max-w-9xl 4xl:max-w-10xl
       py-4 px-5"
      >
        <TopSection />

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden justify-center my-4">
          <div className="bg-muted/50 p-1 rounded-xl flex gap-1 border border-border/50">
            <button
              onClick={() => setActiveTab("form")}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-bold transition-all duration-200",
                activeTab === "form"
                  ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Edit Form
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-bold transition-all duration-200",
                activeTab === "preview"
                  ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Live Preview
            </button>
          </div>
        </div>

        <div className="w-full mt-1">
          <div
            className="flex flex-col lg:flex-row
                  items-start w-full py-3 gap-6"
          >
            {/* {Form Section} */}
            <div
              className={cn(
                "flex-1 w-full lg:block",
                activeTab === "form" ? "block" : "hidden",
              )}
            >
              <ResumeForm />
            </div>

            {/* {Preview Section} */}
            <div
              className={cn(
                "flex-1 w-full lg:block",
                activeTab === "preview" ? "block" : "hidden",
              )}
            >
              <ResumePreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditResume;
