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

const ExecutiveTemplate: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || "#000000";

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header - Heavy Top Bar with Image */}
      <div 
        className="text-white p-8 rounded-b-xl mb-4 flex justify-between items-center" 
        style={{ backgroundColor: themeColor }}
      >
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-1">
            {resumeInfo?.personalInfo?.firstName} {resumeInfo?.personalInfo?.lastName}
          </h1>
          <p className="text-xl font-medium opacity-90 mb-6">
            {resumeInfo?.personalInfo?.jobTitle}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium opacity-80">
            <div className="flex items-center gap-2">
              <span>✉</span> {resumeInfo?.personalInfo?.email}
            </div>
            <div className="flex items-center gap-2">
              <span>☏</span> {resumeInfo?.personalInfo?.phone}
            </div>
            <div className="flex items-center gap-2">
              <span>⌂</span> {resumeInfo?.personalInfo?.address}
            </div>
          </div>
        </div>
        {resumeInfo?.personalInfo?.userImage && (
          <div className="shrink-0 bg-white p-1 rounded-2xl shadow-lg">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img 
              src={resumeInfo.personalInfo.userImage} 
              alt="Profile" 
              className="w-32 h-32 rounded-xl object-cover"
             />
          </div>
        )}
      </div>

      {/* Two Column Layout for the rest */}
      <div className="grid grid-cols-12 gap-8 px-4">
        {/* Main Content (Left) */}
        <div className="col-span-8 flex flex-col gap-8">
          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b-2 pb-1" style={{ borderColor: themeColor, color: themeColor }}>
              Executive Summary
            </h2>
            <SummaryPreview resumeInfo={resumeInfo} isLoading={isLoading} />
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b-2 pb-1" style={{ borderColor: themeColor, color: themeColor }}>
              Professional Experience
            </h2>
            <ExperiencePreview resumeInfo={resumeInfo} isLoading={isLoading} />
          </section>
        </div>

        {/* Sidebar (Right) */}
        <div className="col-span-4 flex flex-col gap-8">
          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b-2 pb-1" style={{ borderColor: themeColor, color: themeColor }}>
              Core Competencies
            </h2>
            <SkillPreview resumeInfo={resumeInfo} isLoading={isLoading} />
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b-2 pb-1" style={{ borderColor: themeColor, color: themeColor }}>
              Education
            </h2>
            <EducationPreview resumeInfo={resumeInfo} isLoading={isLoading} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveTemplate;
