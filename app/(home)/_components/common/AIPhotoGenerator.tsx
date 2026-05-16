"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Loader2, Camera, UserCircle, Wand2, ArrowRight, ShieldCheck } from "lucide-react";
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

const AIPhotoGenerator = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: Processing, 3: Success

  const handleGenerate = async () => {
    if (!resumeInfo?.personalInfo?.userImage) {
        toast({
            title: "No Photo Found",
            description: "Please upload or fetch a photo first.",
            variant: "destructive"
        });
        return;
    }

    setLoading(true);
    setStep(2);

    try {
      const response = await fetch("/api/image/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: resumeInfo.personalInfo.userImage,
          prompt: "Enhance this person's photo to look like a professional studio headshot. Add professional formal attire (suit/blazer), clean studio background, and cinematic professional lighting. Ensure high consistency with the original face.",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate headshot");
      }

      if (resumeInfo) {
        const updatedInfo = {
          ...resumeInfo,
          personalInfo: {
            ...resumeInfo.personalInfo,
            userImage: data.image
          }
        };
        onUpdate(updatedInfo);
        
        await mutateAsync({
            personalInfo: updatedInfo.personalInfo
        });

        setStep(3);
        toast({
          title: data.isFallback ? "Professional Profile Ready" : "AI Headshot Ready!",
          description: data.isFallback 
            ? "We've applied a professional standard profile for you while our AI studio is busy." 
            : "Your photo has been enhanced with professional attire and lighting using Qwen AI.",
        });
      }
    } catch (error) {
        console.error(error);
        toast({
            title: "Generation Failed",
            description: error instanceof Error ? error.message : "Something went wrong",
            variant: "destructive"
        });
        setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) setStep(1); }}>
      <DialogTrigger asChild>
        <Button 
            variant="outline" 
            size="sm" 
            className="text-[10px] h-8 gap-1.5 border-amber-500/30 hover:bg-amber-50 text-amber-600 transition-all font-bold"
        >
          <Wand2 size={12} />
          AI Pro Headshot
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-none shadow-2xl overflow-hidden p-0 max-w-md">
        <div className="bg-amber-500 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Camera size={100} />
          </div>
          <DialogHeader className="text-left space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Sparkles size={24} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-white">AI Headshot Studio</DialogTitle>
                <DialogDescription className="text-white/80 font-medium">
                  Transform casual photos into professional portraits.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8 bg-background min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                   <ShieldCheck className="text-amber-500 shrink-0" size={20} />
                   <div className="space-y-1">
                      <h4 className="text-sm font-bold">Studio Quality Enhancement</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Our AI will adjust your lighting, add professional formal attire, and place you in a clean studio background.
                      </p>
                   </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden">
                        {resumeInfo?.personalInfo?.userImage ? (
                            <Image 
                                src={resumeInfo.personalInfo.userImage} 
                                alt="User headshot preview"
                                width={80}
                                height={80}
                                className="w-full h-full object-cover opacity-50" 
                            />
                        ) : <UserCircle className="text-muted-foreground" size={40} />}
                    </div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Current Source Photo</p>
                </div>

                <Button 
                    onClick={handleGenerate} 
                    className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold gap-2 shadow-xl shadow-amber-500/20"
                >
                    Enhance with Professional AI
                    <ArrowRight size={18} />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 space-y-6"
              >
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Wand2 className="text-amber-500 animate-pulse" size={32} />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold">Generating Studio Portrait...</h3>
                    <p className="text-xs text-muted-foreground animate-pulse">Applying formal attire and studio lighting</p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-6 space-y-6"
              >
                <div className="w-32 h-32 rounded-3xl border-4 border-emerald-500 p-1 shadow-2xl shadow-emerald-500/20">
                    <Image 
                        src={resumeInfo?.personalInfo?.userImage || ""} 
                        alt="AI Generated Professional Headshot"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-2xl" 
                    />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-emerald-600">Headshot Perfected!</h3>
                    <p className="text-xs text-muted-foreground">Your professional profile is now live.</p>
                </div>
                <Button 
                    onClick={() => setOpen(false)}
                    className="w-full bg-slate-900 text-white h-12 rounded-xl font-bold"
                >
                    Perfect, Keep It!
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIPhotoGenerator;
