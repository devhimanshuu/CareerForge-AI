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
  ChevronRight,
  Mic,
  Globe,
  Map,
  Bot,
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
                Workspace Modules
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <MobileNavItem 
                  href="/dashboard" 
                  icon={<LayoutDashboard size={16} />} 
                  label="Dashboard" 
                  active={pathname === "/dashboard"} 
                />
                <MobileNavItem 
                  href="/dashboard/applications" 
                  icon={<Briefcase size={16} />} 
                  label="Job Tracker" 
                  active={pathname === "/dashboard/applications" || pathname?.startsWith("/dashboard/applications")} 
                />
                <MobileNavItem 
                  href="/dashboard/interview" 
                  icon={<Mic size={16} />} 
                  label="Interview Lab" 
                  active={pathname === "/dashboard/interview" || pathname?.startsWith("/dashboard/interview") || pathname === "/dashboard/interview-coach"} 
                />
                <MobileNavItem 
                  href="/dashboard/market" 
                  icon={<Globe size={16} />} 
                  label="Market Data" 
                  active={pathname === "/dashboard/market" || pathname?.startsWith("/dashboard/market")} 
                />
                <MobileNavItem 
                  href="/dashboard/roadmap" 
                  icon={<Map size={16} />} 
                  label="Roadmap" 
                  active={pathname === "/dashboard/roadmap" || pathname?.startsWith("/dashboard/roadmap")} 
                />
                <MobileNavItem 
                  href="/dashboard/analytics" 
                  icon={<BarChart3 size={16} />} 
                  label="Analytics" 
                  active={pathname === "/dashboard/analytics" || pathname?.startsWith("/dashboard/analytics")} 
                />
                <MobileNavItem
                  href="/dashboard/automation"
                  icon={<Bot size={16} />}
                  label="Agent Hub"
                  active={pathname === "/dashboard/automation" || pathname?.startsWith("/dashboard/automation")}
                />
              </div>
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
      flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
      ${active 
        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm" 
        : "bg-background border-border/50 text-foreground active:bg-muted/50"
      }
    `}>
      <div className={`p-2 rounded-lg shrink-0 ${active ? "bg-indigo-500 text-white" : "bg-muted text-muted-foreground"}`}>
        {icon}
      </div>
      <span className="font-bold text-xs sm:text-sm truncate">{label}</span>
    </div>
  </Link>
);

export default MobileCustomizer;
