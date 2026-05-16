"use client";

import React from "react"; // Rebuild trigger
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Settings2, 
  Palette, 
  Share2, 
  Target, 
  Zap, 
  Wand2,
  LayoutDashboard,
  Briefcase,
  BarChart3,
  ChevronRight
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ThemeColor from "./ThemeColor";
import Share from "./Share";
import AtsMatcher from "./AtsMatcher";
import { useResumeContext, ResumeInfoContext } from "@/context/resume-info-provider";

const MobileCustomizer = () => {
  const pathname = usePathname();
  const context = React.useContext(ResumeInfoContext);
  const resumeInfo = context?.resumeInfo;
  
  // Only show certain tools if we are on an edit page
  const isEditPage = pathname.includes("/edit");

  return (
    <div className="fixed bottom-6 right-6 z-[60] md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white border-4 border-background animate-bounce-subtle"
          >
            <Settings2 className="h-6 w-6 animate-spin-slow" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-[32px] p-6 pt-2 h-[auto] max-h-[85vh] overflow-y-auto">
          <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 mt-2" />
          
          <SheetHeader className="text-left mb-6">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <Zap className="text-indigo-500 w-6 h-6" />
              Quick Controls
            </SheetTitle>
            <SheetDescription>
              Customise your experience and access pro tools.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {/* Customization Section (only for edit page) */}
            {isEditPage && context && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                  Design & Optimization
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Palette className="w-4 h-4 text-indigo-500" />
                      Theme
                    </div>
                    <ThemeColor />
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Target className="w-4 h-4 text-indigo-500" />
                      ATS Match
                    </div>
                    <AtsMatcher />
                  </div>
                  <div className="col-span-2 p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Share2 className="w-4 h-4 text-indigo-500" />
                        Share Portfolio
                      </div>
                      <Share />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                Navigation
              </h3>
              <div className="space-y-2">
                <MobileNavItem 
                  href="/dashboard" 
                  icon={<LayoutDashboard size={18} />} 
                  label="Dashboard" 
                  active={pathname === "/dashboard"} 
                />
                <MobileNavItem 
                  href="/dashboard/jobs" 
                  icon={<Briefcase size={18} />} 
                  label="Job Board" 
                  active={pathname === "/dashboard/jobs"} 
                />
                <MobileNavItem 
                  href="/dashboard/analytics" 
                  icon={<BarChart3 size={18} />} 
                  label="Analytics" 
                  active={pathname === "/dashboard/analytics"} 
                />
              </div>
            </div>

            {/* AI Magic */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Wand2 size={20} />
                </div>
                <div className="px-2 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-widest">
                  Pro Feature
                </div>
              </div>
              <h4 className="font-bold text-lg mb-1">AI Resume Architect</h4>
              <p className="text-white/70 text-xs leading-relaxed mb-4">
                Let our AI rebuild your entire resume structure for maximum ATS impact.
              </p>
              <Button variant="secondary" className="w-full font-bold h-11 rounded-xl">
                Unlock Magic
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const MobileNavItem = ({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link href={href} className="block">
    <div className={`
      flex items-center justify-between p-4 rounded-2xl border transition-all duration-200
      ${active 
        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm" 
        : "bg-background border-border/50 text-foreground active:bg-muted/50"
      }
    `}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${active ? "bg-indigo-500 text-white" : "bg-muted text-muted-foreground"}`}>
          {icon}
        </div>
        <span className="font-bold text-sm">{label}</span>
      </div>
      <ChevronRight size={16} className={active ? "text-indigo-500" : "text-muted-foreground/30"} />
    </div>
  </Link>
);

export default MobileCustomizer;
