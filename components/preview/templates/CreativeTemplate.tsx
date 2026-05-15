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

const CreativeTemplate: FC<PropsType> = ({ resumeInfo, isLoading }) => {
  const themeColor = resumeInfo?.themeColor || "#000000";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Top Banner */}
      <div 
        className="p-8 text-white flex flex-col items-center justify-center text-center"
        style={{ backgroundColor: themeColor }}
      >
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          {resumeInfo?.personalInfo?.firstName} {resumeInfo?.personalInfo?.lastName}
        </h1>
        <p className="text-sm font-bold opacity-80 mt-2 uppercase tracking-[0.3em]">
          {resumeInfo?.personalInfo?.jobTitle}
        </p>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-1/3 bg-slate-50 dark:bg-slate-800/50 p-6 space-y-8 border-r border-slate-100 dark:border-slate-800">
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Contact</h3>
            <div className="space-y-3 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase opacity-50">Email</span>
                {resumeInfo?.personalInfo?.email}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase opacity-50">Phone</span>
                {resumeInfo?.personalInfo?.phone}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase opacity-50">Address</span>
                {resumeInfo?.personalInfo?.address}
              </div>
            </div>
          </section>

          <section>
            <SkillPreview resumeInfo={resumeInfo} isLoading={isLoading} />
          </section>

          <section>
            <EducationPreview resumeInfo={resumeInfo} isLoading={isLoading} />
          </section>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          <section>
            <SummaryPreview resumeInfo={resumeInfo} isLoading={isLoading} />
          </section>

          <section>
            <ExperiencePreview resumeInfo={resumeInfo} isLoading={isLoading} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default CreativeTemplate;
