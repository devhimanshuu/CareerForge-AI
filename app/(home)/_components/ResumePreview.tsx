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
  const [isOversized, setIsOversized] = useState(false);

  // AI Dynamic Layouts: Auto-scale to fit container width and A4 height
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current && previewRef.current) {
        const wrapperWidth = wrapperRef.current.clientWidth;
        const A4_WIDTH = 794;
        const A4_HEIGHT = 1123;
        
        // Temporarily remove scaling to get true height
        previewRef.current.style.transform = "none";
        const contentHeight = previewRef.current.scrollHeight;
        
        const widthScale = wrapperWidth / A4_WIDTH;
        const heightScale = A4_HEIGHT / contentHeight;

        let finalScale = 1;
        
        // Scale down if container is narrower than A4
        if (widthScale < 1) {
          finalScale = widthScale;
        }
        
        // Scale down further if content is taller than A4
        if (contentHeight > A4_HEIGHT && heightScale < finalScale) {
          finalScale = Math.max(heightScale, 0.4); 
          setIsOversized(true);
        } else {
          setIsOversized(false);
        }

        setScale(finalScale);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    // Also trigger on content change
    const observer = new MutationObserver(handleResize);
    if (previewRef.current) {
      observer.observe(previewRef.current, { childList: true, subtree: true, characterData: true });
    }
    
    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [resumeInfo]);

  return (
    <div className="relative w-full flex justify-center overflow-visible" ref={wrapperRef}>
      {isOversized && (
        <div className="absolute -top-10 bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 animate-pulse z-10 shadow-sm border border-indigo-200">
          <span>✨ AI Dynamic Layout applied to fit one page</span>
        </div>
      )}
      
      {/* Container that takes exact scaled height to prevent empty space */}
      <div 
        className="relative flex justify-center transition-all duration-300" 
        style={{ 
          height: `${1123 * scale}px`,
          width: `${794 * scale}px`,
        }}
      >
        <div
          id="resume-preview-id"
          ref={previewRef}
          className={cn(`
          shadow-xl bg-white text-black w-[794px] min-h-[1123px]
          p-4 md:p-10 !font-open-sans
          dark:bg-white dark:text-black
          `)}
          style={{
            borderTop: `13px solid ${resumeInfo?.themeColor}`,
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
