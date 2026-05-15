"use client";
import React, { FC } from "react";
import { ResumeDataType } from "@/types/resume.type";
import PersonalInfo from "../PersonalInfo";
import SummaryPreview from "../SummaryPreview";
import ExperiencePreview from "../ExperiencePreview";
import EducationPreview from "../EducationPreview";
import SkillPreview from "../SkillPreview";
import { cn } from "@/lib/utils";

interface PropsType {
  resumeInfo: ResumeDataType | undefined;
  isLoading: boolean;
}

const CustomTemplate: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  // Parse settings
  let settings = {
    sectionOrder: ["personalInfo", "summary", "experience", "education", "skills"],
    fontSize: "14px",
    fontFamily: "font-open-sans",
    sectionSpacing: "24px",
    lineHeight: "1.5"
  };

  try {
    if (typeof resumeInfo?.settings === 'string') {
      settings = JSON.parse(resumeInfo.settings);
    } else if (resumeInfo?.settings) {
      settings = resumeInfo.settings;
    }
  } catch (e) {
    console.error("Failed to parse settings", e);
  }

  const renderSection = (section: string) => {
    switch (section) {
      case "personalInfo":
        return <PersonalInfo key="pi" isLoading={isLoading} resumeInfo={resumeInfo} />;
      case "summary":
        return <SummaryPreview key="sum" isLoading={isLoading} resumeInfo={resumeInfo} />;
      case "experience":
        return <ExperiencePreview key="exp" isLoading={isLoading} resumeInfo={resumeInfo} />;
      case "education":
        return <EducationPreview key="edu" isLoading={isLoading} resumeInfo={resumeInfo} />;
      case "skills":
        return <SkillPreview key="sk" isLoading={isLoading} resumeInfo={resumeInfo} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn("flex flex-col w-full", settings.fontFamily)}
      style={{ 
        fontSize: settings.fontSize,
        lineHeight: settings.lineHeight
      }}
    >
      {settings.sectionOrder.map((section: string, index: number) => (
        <div key={section} style={{ marginBottom: index === settings.sectionOrder.length - 1 ? 0 : settings.sectionSpacing }}>
          {renderSection(section)}
        </div>
      ))}
    </div>
  );
};

export default CustomTemplate;
