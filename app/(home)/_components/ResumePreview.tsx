"use client";
import React, { useEffect, useRef, useState } from "react";
import { useResumeContext } from "@/context/resume-info-provider";
import { cn } from "@/lib/utils";
import SkillPreview from "@/components/preview/SkillPreview";
import ModernTemplate from "@/components/preview/templates/ModernTemplate";
import ProfessionalTemplate from "@/components/preview/templates/ProfessionalTemplate";
import CreativeTemplate from "@/components/preview/templates/CreativeTemplate";
import CustomTemplate from "@/components/preview/templates/CustomTemplate";


const ResumePreview = () => {
  const { resumeInfo, isLoading } = useResumeContext();
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isOversized, setIsOversized] = useState(false);

  // AI Dynamic Layouts: Auto-scale to fit one page perfectly
  useEffect(() => {
    if (previewRef.current) {
      // Standard A4 height is roughly ~1123px.
      // We check if the content exceeds this and scale down if necessary.
      const A4_HEIGHT = 1120;
      // Temporarily remove scaling to get true height
      previewRef.current.style.transform = "none";
      const contentHeight = previewRef.current.scrollHeight;

      if (contentHeight > A4_HEIGHT) {
        // Calculate the scale needed to fit it into A4
        const newScale = Math.max(A4_HEIGHT / contentHeight, 0.75); // Don't shrink below 75%
        setScale(newScale);
        setIsOversized(true);
      } else {
        setScale(1);
        setIsOversized(false);
      }
    }
  }, [resumeInfo]);

  return (
    <div className="relative w-full flex justify-center">
      {isOversized && (
        <div className="absolute -top-10 bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 animate-pulse z-10 shadow-sm border border-indigo-200">
          <span>✨ AI Dynamic Layout applied to fit one page</span>
        </div>
      )}
      <div
        id="resume-preview-id"
        ref={previewRef}
        className={cn(`
        shadow-lg bg-white w-full flex-[1.02]
        h-full p-4 md:p-10 !font-open-sans
        dark:border dark:bg-card 
        dark:border-b-gray-800 
        dark:border-x-gray-800
        `)}
        style={{
          borderTop: `13px solid ${resumeInfo?.themeColor}`,
          transform: scale < 1 ? `scale(${scale})` : "none",
          transformOrigin: "top center",
          marginBottom: scale < 1 ? `-${(1 - scale) * 1120}px` : "0",
        }}
      >
        {resumeInfo?.template === "professional" ? (
          <ProfessionalTemplate isLoading={isLoading} resumeInfo={resumeInfo} />
        ) : resumeInfo?.template === "creative" ? (
          <CreativeTemplate isLoading={isLoading} resumeInfo={resumeInfo} />
        ) : resumeInfo?.template === "custom" ? (
          <CustomTemplate isLoading={isLoading} resumeInfo={resumeInfo} />
        ) : (
          <ModernTemplate isLoading={isLoading} resumeInfo={resumeInfo} />
        )}

      </div>
    </div>
  );
};

export default ResumePreview;
