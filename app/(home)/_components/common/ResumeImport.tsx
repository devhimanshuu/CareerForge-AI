"use client";

import React, { useState, useRef, useContext } from "react";
import { Upload, Loader2, FileText, Sparkles, Check, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ResumeInfoContext } from "@/context/resume-info-provider";
import { toast } from "@/hooks/use-toast";
import useCreateDocument from "@/features/document/use-create-document";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import type { ImportedResumeData } from "@/lib/resume-import";
import type { ResumeDataType } from "@/types/resume.type";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ResumeImport = () => {
  // Use context optionally — null when not inside a ResumeInfoProvider (e.g. dashboard)
  const resumeContext = useContext(ResumeInfoContext);
  const { mutateAsync: createDocument } = useCreateDocument();
  const router = useRouter();
  const params = useParams();
  const documentId = params?.documentId as string | undefined;

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Extracting, 3: Review

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.type === "application/octet-stream" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toast({
        title: "Invalid File",
        description: "Please upload a valid PDF resume.",
        variant: "destructive"
      });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "Please upload a PDF smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
  };

  const buildDocumentTitle = (data: ImportedResumeData) => {
    const fullName = [
      data.personalInfo?.firstName,
      data.personalInfo?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    if (fullName && data.personalInfo?.jobTitle) {
      return `${fullName} - ${data.personalInfo.jobTitle}`;
    }

    return fullName || file?.name.replace(/\.pdf$/i, "") || "Imported Resume";
  };

  const toUpdatePayload = (data: ImportedResumeData) => ({
    title: buildDocumentTitle(data),
    personalInfo: data.personalInfo,
    experience: data.experiences,
    education: data.educations,
    skills: data.skills,
    summary: data.summary,
  });

  /**
   * Update the currently open resume (editor context).
   * Uses a direct fetch to /api/document/update/:documentId so we don't depend
   * on the useUpdateDocument hook (which reads documentId from URL params and
   * may not match when invoked from the MagicAI dropdown).
   */
  const applyToCurrentResume = async (data: ImportedResumeData) => {
    if (!resumeContext?.resumeInfo || !documentId) return false;

    const { resumeInfo, onUpdate } = resumeContext;

    const updatedInfo: ResumeDataType = {
      ...resumeInfo,
      title: buildDocumentTitle(data),
      summary: data.summary || resumeInfo.summary,
      experiences: data.experiences || [],
      educations: data.educations || [],
      skills: data.skills || [],
      personalInfo: {
        ...resumeInfo.personalInfo,
        ...data.personalInfo
      }
    };

    onUpdate(updatedInfo);

    const response = await fetch(`/api/document/update/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toUpdatePayload(data)),
    });

    const json = await response.json().catch(() => null);
    if (!response.ok || json?.success === false) {
      throw new Error(json?.message || json?.error || "Failed to save imported resume.");
    }

    return true;
  };

  const createResumeFromImport = async (data: ImportedResumeData) => {
    const created = await createDocument({
      title: buildDocumentTitle(data),
    });
    const newDocumentId = created.data?.documentId;

    if (!newDocumentId) {
      throw new Error("Failed to create a resume for the imported data.");
    }

    const response = await fetch(`/api/document/update/${newDocumentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toUpdatePayload(data)),
    });

    const json = await response.json().catch(() => null);
    if (!response.ok || json?.success === false) {
      throw new Error(json?.message || json?.error || "Failed to save imported resume.");
    }

    router.push(`/dashboard/document/${newDocumentId}/edit`);
  };

  const handleExtract = async () => {
    if (!file) return;

    setLoading(true);
    setStep(2);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract/resume", {
        method: "POST",
        body: formData,
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || json?.error || "Failed to process your resume.");
      }

      const extractedData = json.data as ImportedResumeData;

      // If we're inside the editor with a valid resume context, update in place.
      // Otherwise (dashboard), create a brand-new document.
      const updatedExistingResume = await applyToCurrentResume(extractedData);

      if (!updatedExistingResume) {
        await createResumeFromImport(extractedData);
      }

      setStep(3);
      toast({
        title: "Import Success!",
        description: "Your resume data has been extracted and applied.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to process your resume.",
        variant: "destructive"
      });
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) { setStep(1); setFile(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-amber-500/60 bg-amber-500/5 text-amber-600 hover:bg-amber-50 font-bold">
          <Upload size={16} />
          AI Import PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-w-lg">
        <div className="bg-slate-950 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText size={120} />
            </div>
            <DialogHeader className="text-left space-y-2 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/15 backdrop-blur-md flex items-center justify-center border border-amber-300/30 text-amber-200">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-white">AI Resume Import</DialogTitle>
                        <DialogDescription className="text-slate-300 font-medium">
                            Extract structured resume data from your PDF.
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>
        </div>

        <div className="p-8 bg-background min-h-[350px] flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full space-y-8"
                    >
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-48 rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-amber-50 hover:border-amber-400 transition-all group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                <Upload size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{file ? file.name : "Click to upload your PDF"}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Maximum size 5MB</p>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-left">
                            <AlertCircle size={18} className="text-amber-500 shrink-0" />
                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                <b>Note:</b> {resumeContext && documentId
                                  ? "This will overwrite your current progress with data extracted from the PDF. Make sure you want to proceed!"
                                  : "A new resume will be created from the extracted PDF data."}
                            </p>
                        </div>

                        <Button 
                            disabled={!file}
                            onClick={handleExtract}
                            className="w-full h-12 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold gap-2 shadow-xl shadow-slate-950/20"
                        >
                            Start AI Extraction
                            <ArrowRight size={18} />
                        </Button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                        key="step2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-amber-100 border-t-amber-600 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 size={32} className="text-amber-600 animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold">Intelligent Parsing...</h3>
                            <p className="text-xs text-muted-foreground animate-pulse font-medium">Mapping sections, dates, bullets, and skills</p>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div 
                        key="step3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                            <Check size={40} strokeWidth={3} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-emerald-700">Data Extracted Successfully!</h3>
                            <p className="text-sm text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
                                We&apos;ve mapped your personal info, experiences, and skills into your new template.
                            </p>
                        </div>
                        <Button 
                            onClick={() => setOpen(false)}
                            className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold"
                        >
                            Great, Take Me to Editor
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeImport;
