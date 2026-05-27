"use client";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Linkedin, Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useResumeContext } from "@/context/resume-info-provider";
import useUpdateDocument from "@/features/document/use-update-document";
import { PersonalInfoType, ExperienceType, EducationType, SkillType } from "@/types/resume.type";

/**
 * Sanitizes a date string to ensure it's either a valid YYYY-MM-DD or null.
 * Prevents database crashes with invalid PostgreSQL date format.
 */
function sanitizeDate(dateStr: any): string | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // If it's already YYYY-MM-DD, check if it's a valid date
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (isoRegex.test(trimmed)) {
    const timestamp = Date.parse(trimmed);
    return isNaN(timestamp) ? null : trimmed;
  }

  // Try to parse with standard JS Date
  const timestamp = Date.parse(trimmed);
  if (!isNaN(timestamp)) {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Attempt to parse "Month Year" format (e.g. "Jan 2020", "September 2018")
  const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = yearMatch[0];
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const lowerTrimmed = trimmed.toLowerCase();
    let monthIdx = 0; // Default to January
    for (let i = 0; i < months.length; i++) {
      if (lowerTrimmed.includes(months[i])) {
        monthIdx = i;
        break;
      }
    }
    const monthStr = String(monthIdx + 1).padStart(2, "0");
    return `${year}-${monthStr}-01`;
  }

  return null;
}

/**
 * Sanitize the AI-parsed personal info to match expected types.
 * Ensures all string fields default to empty string instead of undefined/null.
 */
function sanitizePersonalInfo(raw: any): PersonalInfoType {
  if (!raw) return {};
  return {
    firstName: raw.firstName || "",
    lastName: raw.lastName || "",
    jobTitle: raw.jobTitle || "",
    address: raw.address || "",
    phone: raw.phone || "",
    email: raw.email || "",
  };
}

/**
 * Sanitize experience entries from AI. Ensures:
 * - currentlyWorking is a proper boolean
 * - dates are strings (YYYY-MM-DD) or null
 * - workSummary is HTML string
 */
function sanitizeExperiences(raw: any[]): ExperienceType[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((exp) => {
    const currentlyWorking = exp.currentlyWorking === true;
    return {
      title: exp.title || "",
      companyName: exp.companyName || "",
      city: exp.city || "",
      state: exp.state || "",
      startDate: sanitizeDate(exp.startDate),
      endDate: currentlyWorking ? null : sanitizeDate(exp.endDate),
      currentlyWorking,
      workSummary: exp.workSummary || "",
    };
  });
}

/**
 * Sanitize education entries from AI. Ensures:
 * - dates are strings or null
 * - description defaults to empty string
 */
function sanitizeEducations(raw: any[]): EducationType[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((edu) => ({
    universityName: edu.universityName || "",
    degree: edu.degree || "",
    major: edu.major || "",
    startDate: sanitizeDate(edu.startDate),
    endDate: sanitizeDate(edu.endDate),
    description: edu.description || "",
  }));
}

/**
 * Sanitize skills from AI. Ensures:
 * - rating is a number between 0-5
 * - name is a string
 */
function sanitizeSkills(raw: any[]): SkillType[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((skill) => ({
    name: skill.name || "",
    rating: typeof skill.rating === "number" ? Math.min(5, Math.max(0, skill.rating)) : 3,
  }));
}

export const LinkedInImport = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  
  const { resumeInfo, onUpdate, refetch } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Please upload a LinkedIn PDF", variant: "destructive" });
      return;
    }

    setLoading(true);
    toast({ title: "Analyzing LinkedIn profile..." });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import-linkedin", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Import failed");

      const { data } = await response.json();
      
      if (!resumeInfo?.documentId) throw new Error("No active document");

      // Sanitize all data from AI to match expected types
      const personalInfo = sanitizePersonalInfo(data.personalInfo);
      const summary = typeof data.summary === "string" ? data.summary : "";
      const experiences = sanitizeExperiences(data.experience);
      const educations = sanitizeEducations(data.education);
      const skills = sanitizeSkills(data.skills);
      
      // Save all sections to DB in one call
      await mutateAsync({
        personalInfo,
        summary,
        experience: experiences,
        education: educations,
        skills,
      });

      // Immediately update local context so forms reflect changes without waiting for refetch
      onUpdate({
        ...resumeInfo,
        personalInfo: personalInfo,
        summary: summary,
        experiences: experiences,
        educations: educations,
        skills: skills,
      });

      // Also refetch from DB to get proper server-assigned IDs on all items.
      // This ensures form components can properly track individual items for
      // reordering, editing, and deletion.
      await refetch();

      toast({ title: "LinkedIn imported successfully! 🎉" });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to import LinkedIn profile", variant: "destructive" });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs gap-1.5 border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:text-blue-700 font-semibold"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading || resumeInfo?.status === "archived"}
      >
        {loading ? (
          <Loader size="12px" className="animate-spin" />
        ) : (
          <Linkedin size="12px" />
        )}
        Import LinkedIn PDF
      </Button>
    </>
  );
};
