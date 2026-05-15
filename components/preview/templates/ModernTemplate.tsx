"use client";
import React, { FC } from "react";
import PersonalInfo from "@/components/preview/PersonalInfo";
import SummaryPreview from "@/components/preview/SummaryPreview";
import ExperiencePreview from "@/components/preview/ExperiencePreview";
import EducationPreview from "@/components/preview/EducationPreview";
import SkillPreview from "@/components/preview/SkillPreview";
import { ResumeDataType } from "@/types/resume.type";

interface PropsType {
  resumeInfo: ResumeDataType | undefined;
  isLoading: boolean;
}

const ModernTemplate: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  return (
    <div className="flex flex-col gap-1">
      <PersonalInfo isLoading={isLoading} resumeInfo={resumeInfo} />
      <SummaryPreview isLoading={isLoading} resumeInfo={resumeInfo} />
      <ExperiencePreview isLoading={isLoading} resumeInfo={resumeInfo} />
      <EducationPreview isLoading={isLoading} resumeInfo={resumeInfo} />
      <SkillPreview isLoading={isLoading} resumeInfo={resumeInfo} />
    </div>
  );
};

export default ModernTemplate;
