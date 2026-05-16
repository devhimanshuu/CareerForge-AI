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

const MinimalistTemplate: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || "#000000";

  return (
    <div className="flex flex-col gap-8 p-4 font-sans max-w-3xl mx-auto">
      {/* Header - Minimal & Centered */}
      <div className="text-center pb-4">
        {resumeInfo?.personalInfo?.userImage && (
          <div className="flex justify-center mb-4">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img 
              src={resumeInfo.personalInfo.userImage} 
              alt="Profile" 
              className="w-20 h-20 rounded-full object-cover border p-1"
              style={{ borderColor: themeColor }}
             />
          </div>
        )}
        <h1 className="text-4xl font-light tracking-widest text-black mb-2" style={{ color: themeColor }}>
          {resumeInfo?.personalInfo?.firstName} <span className="font-bold">{resumeInfo?.personalInfo?.lastName}</span>
        </h1>
        <p className="text-sm font-medium tracking-widest uppercase text-gray-500 mb-4">
          {resumeInfo?.personalInfo?.jobTitle}
        </p>
        <div className="flex justify-center items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400 font-mono">
          <span>{resumeInfo?.personalInfo?.email}</span>
          <span>/</span>
          <span>{resumeInfo?.personalInfo?.phone}</span>
          <span>/</span>
          <span>{resumeInfo?.personalInfo?.address}</span>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200" />

      {/* Content - 1 Column Centered Flow */}
      <div className="grid grid-cols-1 gap-10">
        <section>
          <div className="mb-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Profile</h2>
          </div>
          <SummaryPreview resumeInfo={resumeInfo} isLoading={isLoading} />
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Experience</h2>
          </div>
          <ExperiencePreview resumeInfo={resumeInfo} isLoading={isLoading} />
        </section>

        <div className="grid grid-cols-2 gap-8">
          <section>
            <div className="mb-3">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Education</h2>
            </div>
            <EducationPreview resumeInfo={resumeInfo} isLoading={isLoading} />
          </section>
          
          <section>
            <div className="mb-3">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Skills</h2>
            </div>
            <SkillPreview resumeInfo={resumeInfo} isLoading={isLoading} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default MinimalistTemplate;
