"use client";
import React, { FC } from "react";
import { ResumeDataType } from "@/types/resume.type";
import ExperiencePreview from "../ExperiencePreview";
import EducationPreview from "../EducationPreview";
import SkillPreview from "../SkillPreview";
import SummaryPreview from "../SummaryPreview";

interface PropsType {
  resumeInfo: ResumeDataType | undefined;
  isLoading: boolean;
}

const ProfessionalTemplate: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || "#000000";

  return (
    <div className="flex flex-col gap-6 p-2">
      {/* Header - Left Aligned */}
      <div className="border-b-2 pb-4" style={{ borderColor: themeColor }}>
        <h1 className="text-3xl font-black uppercase tracking-tight" style={{ color: themeColor }}>
          {resumeInfo?.personalInfo?.firstName} {resumeInfo?.personalInfo?.lastName}
        </h1>
        <p className="text-lg font-bold text-muted-foreground mt-1">
          {resumeInfo?.personalInfo?.jobTitle}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs font-medium text-muted-foreground">
          <span>{resumeInfo?.personalInfo?.email}</span>
          <span>•</span>
          <span>{resumeInfo?.personalInfo?.phone}</span>
          <span>•</span>
          <span>{resumeInfo?.personalInfo?.address}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section>
            <SummaryPreview resumeInfo={resumeInfo} isLoading={isLoading} />
        </section>

        <section>
          <ExperiencePreview resumeInfo={resumeInfo} isLoading={isLoading} />
        </section>

        <section className="grid grid-cols-2 gap-8">
          <EducationPreview resumeInfo={resumeInfo} isLoading={isLoading} />
          <SkillPreview resumeInfo={resumeInfo} isLoading={isLoading} />
        </section>
      </div>
    </div>
  );
};

export default ProfessionalTemplate;
