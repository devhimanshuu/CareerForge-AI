"use client";

import React, { useState } from "react";
import { Layout, Check, Palette, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useResumeContext } from "@/context/resume-info-provider";
import useUpdateDocument from "@/features/document/use-update-document";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  {
    id: "modern",
    name: "Modern Standard",
    desc: "Clean, balanced and professional",
    preview: "bg-slate-100",
  },
  {
    id: "professional",
    name: "Professional Bold",
    desc: "High-impact, left-aligned layout",
    preview: "bg-slate-800",
  },
  {
    id: "creative",
    name: "Modern Sidebar",
    desc: "Two-column creative arrangement",
    preview: "bg-indigo-500",
  },
  {
    id: "minimalist",
    name: "Minimalist Clean",
    desc: "Elegant, centered, distraction-free",
    preview: "bg-stone-100 border border-stone-300",
  },
  {
    id: "executive",
    name: "Executive Suite",
    desc: "Heavy colored header, two-column body",
    preview: "bg-emerald-900",
  },
];

const TemplateSelector = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  const [open, setOpen] = useState(false);

  const handleTemplateChange = async (templateId: string) => {
    if (resumeInfo) {
      const updatedInfo = { ...resumeInfo, template: templateId };
      onUpdate(updatedInfo);
      
      try {
        await mutateAsync({
          template: templateId,
        });
        toast({
          title: "Template Updated",
          description: `Switched to ${templateId} layout`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save template selection",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-indigo-500/50 hover:bg-indigo-500/10 transition-all">
          <Layout size={16} className="text-indigo-500" />
          <span className="hidden lg:flex">Templates</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-2xl border-none shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 p-4 text-white">
          <h3 className="text-lg font-black flex items-center gap-2">
            <Wand2 size={18} />
            Resume Layouts
          </h3>
          <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-1">
            Choose your professional style
          </p>
        </div>
        
        <div className="p-3 space-y-2 bg-background">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTemplateChange(t.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all border-2",
                resumeInfo?.template === t.id 
                  ? "border-indigo-500 bg-indigo-500/5" 
                  : "border-transparent hover:bg-muted/50"
              )}
            >
              <div className={cn("w-12 h-12 rounded-lg shrink-0 flex items-center justify-center", t.preview)}>
                {resumeInfo?.template === t.id && <Check className="text-white" size={20} />}
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold">{t.name}</h4>
                <p className="text-[10px] text-muted-foreground">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 border-t bg-muted/30">
            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest px-2">
                <Sparkles size={12} />
                AI Auto-Formatting Active
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TemplateSelector;
