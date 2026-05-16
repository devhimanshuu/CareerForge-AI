"use client";

import React, { useState, useRef } from "react";
import { Upload, Loader2, FileText, Sparkles, Check, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useResumeContext } from "@/context/resume-info-provider";
import { toast } from "@/hooks/use-toast";
import useUpdateDocument from "@/features/document/use-update-document";
import { motion, AnimatePresence } from "framer-motion";

const ResumeImport = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Extracting, 3: Review

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a valid PDF resume.",
        variant: "destructive"
      });
    }
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
      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      if (resumeInfo) {
        const extractedData = json.data;
        const updatedInfo = {
          ...resumeInfo,
          ...extractedData,
          personalInfo: {
            ...resumeInfo.personalInfo,
            ...extractedData.personalInfo
          }
        };

        onUpdate(updatedInfo);
        
        await mutateAsync({
            personalInfo: updatedInfo.personalInfo,
            experience: updatedInfo.experiences,
            education: updatedInfo.educations,
            skills: updatedInfo.skills,
            summary: updatedInfo.summary
        });

        setStep(3);
        toast({
          title: "Import Success!",
          description: "Your resume data has been extracted and applied.",
        });
      }
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
        <Button variant="outline" size="sm" className="gap-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50 font-bold">
          <Upload size={16} />
          AI Import PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-w-lg">
        <div className="bg-indigo-600 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText size={120} />
            </div>
            <DialogHeader className="text-left space-y-2 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-white">AI Resume Import</DialogTitle>
                        <DialogDescription className="text-indigo-100 font-medium">
                            Migrate your existing resume in seconds.
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
                            className="w-full h-48 rounded-3xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                <Upload size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{file ? file.name : "Click to upload your PDF"}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Maximum size 2MB</p>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-left">
                            <AlertCircle size={18} className="text-amber-500 shrink-0" />
                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                <b>Note:</b> This will overwrite your current progress with data extracted from the PDF. Make sure you want to proceed!
                            </p>
                        </div>

                        <Button 
                            disabled={!file}
                            onClick={handleExtract}
                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold gap-2 shadow-xl shadow-indigo-600/20"
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
                            <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 size={32} className="text-indigo-600 animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold">Intelligent Parsing...</h3>
                            <p className="text-xs text-muted-foreground animate-pulse font-medium">Kimi 2.6 is mapping your professional history</p>
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
