"use client";
import React, { useEffect, useRef, useState } from "react";
import { useResumeContext } from "@/context/resume-info-provider";
import { cn } from "@/lib/utils";
import SkillPreview from "@/components/preview/SkillPreview";
import ModernTemplate from "@/components/preview/templates/ModernTemplate";
import ProfessionalTemplate from "@/components/preview/templates/ProfessionalTemplate";
import CreativeTemplate from "@/components/preview/templates/CreativeTemplate";
import CustomTemplate from "@/components/preview/templates/CustomTemplate";
import MinimalistTemplate from "@/components/preview/templates/MinimalistTemplate";
import ExecutiveTemplate from "@/components/preview/templates/ExecutiveTemplate";


const ResumePreview = () => {
  const { resumeInfo, isLoading } = useResumeContext();
  const previewRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(1123);

  // AI Dynamic Layouts: Auto-scale to fit container width and A4 height
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current && previewRef.current) {
        const wrapperWidth = wrapperRef.current.clientWidth;
        const A4_WIDTH = 794;
        const A4_HEIGHT = 1123;
        
        // Temporarily remove scaling to get true height without visual flash
        const oldTransform = previewRef.current.style.transform;
        previewRef.current.style.transform = "none";
        const currentContentHeight = previewRef.current.scrollHeight;
        previewRef.current.style.transform = oldTransform; // Immediately restore
        
        setContentHeight(Math.max(1123, currentContentHeight));
        
        const widthScale = wrapperWidth / A4_WIDTH;

        let finalScale = 1;
        
        // Scale down if container is narrower than A4
        if (widthScale < 1) {
          finalScale = widthScale;
        }

        setScale(finalScale);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    // Also trigger on content change
    const mutationObserver = new MutationObserver(handleResize);
    if (previewRef.current) {
      mutationObserver.observe(previewRef.current, { childList: true, subtree: true, characterData: true });
    }

    // Trigger on container resize (critical for ResizablePanel slider)
    const resizeObserver = new ResizeObserver(handleResize);
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }
    
    return () => {
      window.removeEventListener("resize", handleResize);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [resumeInfo]);

  return (
    <div className="relative w-full flex justify-center overflow-visible" ref={wrapperRef}>
      {/* Container that takes exact scaled height to prevent empty space */}
      <div 
        className="relative flex justify-center transition-all duration-300" 
        style={{ 
          height: `${contentHeight * scale}px`,
          width: `${794 * scale}px`,
        }}
      >
        <div
          id="resume-preview-id"
          ref={previewRef}
          className={cn(`
          shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.6)] 
          bg-white text-black w-[794px] min-h-[1123px]
          p-8 md:p-12 !font-open-sans
          dark:bg-white dark:text-black
          rounded-sm border border-slate-200/50 dark:border-slate-800/50
          `)}
          style={{
            borderTop: `8px solid ${resumeInfo?.themeColor}`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {resumeInfo?.template === "professional" ? (
            <ProfessionalTemplate isLoading={isLoading} resumeInfo={resumeInfo} />
          ) : resumeInfo?.template === "creative" ? (
            <CreativeTemplate isLoading={isLoading} resumeInfo={resumeInfo} />
          ) : resumeInfo?.template === "custom" ? (
            <CustomTemplate isLoading={isLoading} resumeInfo={resumeInfo} />
          ) : resumeInfo?.template === "minimalist" ? (
            <MinimalistTemplate isLoading={isLoading} resumeInfo={resumeInfo} />
          ) : resumeInfo?.template === "executive" ? (
            <ExecutiveTemplate isLoading={isLoading} resumeInfo={resumeInfo} />
          ) : (
            <ModernTemplate isLoading={isLoading} resumeInfo={resumeInfo} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
