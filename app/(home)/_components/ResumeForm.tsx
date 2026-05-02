"use client";
import React, { useState } from "react";
import { useResumeContext } from "@/context/resume-info-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import SummaryForm from "./forms/SummaryForm";
import ExperienceForm from "./forms/ExperienceForm";
import EducationForm from "./forms/EducationForm";
import SkillsForm from "./forms/SkillsForm";

const steps = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Summary" },
  { id: 3, label: "Experience" },
  { id: 4, label: "Education" },
  { id: 5, label: "Skills" },
];

const ResumeForm = () => {
  const { resumeInfo } = useResumeContext();
  const [activeFormIndex, setActiveFormIndex] = useState(1);

  const handleNext = () => {
    const newIndex = activeFormIndex + 1;
    setActiveFormIndex(newIndex);
  };

  return (
    <div className="flex-1 w-full lg:sticky lg:top-16">
      <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
        {/* Step Progress Bar */}
        <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-1">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setActiveFormIndex(step.id)}
                  disabled={resumeInfo?.status === "archived"}
                  className={`
                    flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition-all duration-200 w-full justify-center
                    ${activeFormIndex === step.id
                      ? "bg-indigo-500/10 text-indigo-500"
                      : activeFormIndex > step.id
                      ? "text-green-500"
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {activeFormIndex > step.id ? (
                    <CheckCircle2 size="12px" />
                  ) : (
                    <span
                      className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold
                        ${activeFormIndex === step.id
                          ? "bg-indigo-500 text-white"
                          : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {step.id}
                    </span>
                  )}
                  <span className="hidden xl:inline">{step.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={`h-px w-4 shrink-0 ${
                      activeFormIndex > step.id
                        ? "bg-green-500"
                        : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 justify-end">
          {activeFormIndex > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 h-7"
              onClick={() => setActiveFormIndex(activeFormIndex - 1)}
            >
              <ArrowLeft size="13px" />
              Previous
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 h-7"
            disabled={
              activeFormIndex === 5 || resumeInfo?.status === "archived"
            }
            onClick={handleNext}
          >
            Next
            <ArrowRight size="13px" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="px-5 py-4 pb-6">
          {activeFormIndex === 1 && (
            <PersonalInfoForm handleNext={handleNext} />
          )}
          {activeFormIndex === 2 && <SummaryForm handleNext={handleNext} />}
          {activeFormIndex === 3 && <ExperienceForm handleNext={handleNext} />}
          {activeFormIndex === 4 && <EducationForm handleNext={handleNext} />}
          {activeFormIndex === 5 && <SkillsForm />}
        </div>
      </div>
    </div>
  );
};

export default ResumeForm;
