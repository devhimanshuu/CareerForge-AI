"use client";

import React, { useState } from "react";
import { 
  Settings2, 
  GripVertical, 
  Type, 
  AlignLeft, 
  ArrowUpDown, 
  Check, 
  Sparkles,
  LayoutTemplate
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useResumeContext } from "@/context/resume-info-provider";
import useUpdateDocument from "@/features/document/use-update-document";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Reorder } from "framer-motion";

const FONTS = [
  { id: "font-open-sans", name: "Open Sans" },
  { id: "font-serif", name: "Serif Classic" },
  { id: "font-mono", name: "Modern Mono" },
  { id: "font-outfit", name: "Outfit" },
];

const CustomLayoutBuilder = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  const [open, setOpen] = useState(false);

  let settings = {
    sectionOrder: ["personalInfo", "summary", "experience", "education", "skills"],
    fontSize: "14px",
    fontFamily: "font-open-sans",
    sectionSpacing: "24px",
    lineHeight: "1.5"
  };

  try {
    if (typeof resumeInfo?.settings === 'string') {
      settings = JSON.parse(resumeInfo.settings);
    } else if (resumeInfo?.settings) {
      settings = resumeInfo.settings;
    }
  } catch (e) {
    console.error("Failed to parse settings", e);
  }

  const saveSettings = async (newSettings: any) => {
    if (resumeInfo) {
      const updatedInfo = { ...resumeInfo, settings: JSON.stringify(newSettings), template: "custom" };
      onUpdate(updatedInfo);
      try {
        await mutateAsync({
          settings: JSON.stringify(newSettings),
          template: "custom"
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReorder = (newOrder: string[]) => {
    const newSettings = { ...settings, sectionOrder: newOrder };
    saveSettings(newSettings);
  };

  const updateStyle = (key: string, value: string) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-amber-500/50 hover:bg-amber-500/10 transition-all">
          <Settings2 size={16} className="text-amber-500" />
          <span className="hidden lg:flex">Customize</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[500px] overflow-y-auto p-0 border-none bg-background">
        <div className="bg-amber-500 p-8 text-white">
          <SheetHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <LayoutTemplate size={24} />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black tracking-tight text-white">Custom Layout Builder</SheetTitle>
                <SheetDescription className="text-white/80 font-medium">
                  Design your own resume architecture
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="p-8 space-y-10">
          {/* Section Reordering */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <ArrowUpDown size={14} className="text-amber-500" />
              Section Hierarchy
            </h3>
            <Reorder.Group 
              axis="y" 
              values={settings.sectionOrder} 
              onReorder={handleReorder}
              className="space-y-3"
            >
              {settings.sectionOrder.map((section: string) => (
                <Reorder.Item 
                  key={section} 
                  value={section}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-card border hover:border-amber-500/50 transition-all cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-md"
                >
                  <GripVertical size={16} className="text-muted-foreground/30 group-hover:text-amber-500 transition-colors" />
                  <span className="text-sm font-bold capitalize">
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <p className="text-[10px] text-muted-foreground italic bg-muted/50 p-3 rounded-xl border border-dashed">
              💡 Drag to rearrange. Changes are saved automatically and applied to the &quot;Custom&quot; template.
            </p>
          </div>

          {/* Typography */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Type size={14} className="text-indigo-500" />
              Typography & Spacing
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-muted-foreground px-1">Font Family</label>
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map(font => (
                    <button
                      key={font.id}
                      onClick={() => updateStyle("fontFamily", font.id)}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-bold transition-all text-left flex justify-between items-center",
                        settings.fontFamily === font.id ? "border-amber-500 bg-amber-500/5 text-amber-600" : "hover:bg-muted"
                      )}
                    >
                      {font.name}
                      {settings.fontFamily === font.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground px-1">Base Font Size</label>
                  <select 
                    value={settings.fontSize}
                    onChange={(e) => updateStyle("fontSize", e.target.value)}
                    className="w-full h-11 rounded-xl bg-muted/50 border-none px-4 text-xs font-bold focus:ring-2 ring-amber-500/20"
                  >
                    <option value="12px">12px (Compact)</option>
                    <option value="14px">14px (Standard)</option>
                    <option value="16px">16px (Large)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground px-1">Section Spacing</label>
                  <select 
                    value={settings.sectionSpacing}
                    onChange={(e) => updateStyle("sectionSpacing", e.target.value)}
                    className="w-full h-11 rounded-xl bg-muted/50 border-none px-4 text-xs font-bold focus:ring-2 ring-amber-500/20"
                  >
                    <option value="12px">Tight</option>
                    <option value="24px">Normal</option>
                    <option value="40px">Spacious</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 p-4 rounded-2xl">
              <Sparkles size={14} />
              AI Layout Scaling Active
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CustomLayoutBuilder;
