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
import { useTheme } from "next-themes";
import { useClerk, useUser, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
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
  Compass,
  Linkedin,
  DollarSign,
  SplitSquareHorizontal,
  Workflow,
  Sun,
  Moon,
  Monitor,
  LogOut,
  AlertTriangle,
  Building2,
  Scale,
  Activity,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ThemeColor from "./ThemeColor";
import Share from "./Share";
import AtsMatcher from "./AtsMatcher";
import { useResumeContext, ResumeInfoContext } from "@/context/resume-info-provider";

const MobileCustomizer = () => {
  const pathname = usePathname();
  const currentPath = pathname || "";
  const context = React.useContext(ResumeInfoContext);
  const resumeInfo = context?.resumeInfo;
  const { setTheme } = useTheme();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const [showSignOutConfirm, setShowSignOutConfirm] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only show certain tools if we are on an edit page
  const isEditPage = currentPath.includes("/edit");

  if (!isMounted) {
    return null;
  }

  return (
    <>
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
                    active={currentPath === "/dashboard"}
                  />
                  <MobileNavItem
                    href="/dashboard/applications"
                    icon={<Briefcase size={16} />}
                    label="Job Tracker"
                    active={currentPath === "/dashboard/applications" || currentPath.startsWith("/dashboard/applications")}
                  />
                  <MobileNavItem
                    href="/dashboard/interview"
                    icon={<Mic size={16} />}
                    label="Interview Lab"
                    active={currentPath === "/dashboard/interview" || currentPath.startsWith("/dashboard/interview") || currentPath === "/dashboard/interview-coach"}
                  />
                  <MobileNavItem
                    href="/dashboard/market"
                    icon={<Globe size={16} />}
                    label="Market Data"
                    active={currentPath === "/dashboard/market" || currentPath.startsWith("/dashboard/market")}
                  />
                  <MobileNavItem
                    href="/dashboard/roadmap"
                    icon={<Map size={16} />}
                    label="Roadmap"
                    active={currentPath === "/dashboard/roadmap" || currentPath.startsWith("/dashboard/roadmap")}
                  />
                  <MobileNavItem
                    href="/dashboard/analytics"
                    icon={<BarChart3 size={16} />}
                    label="Analytics"
                    active={currentPath === "/dashboard/analytics" || currentPath.startsWith("/dashboard/analytics")}
                  />
                  <MobileNavItem
                    href="/dashboard/automation"
                    icon={<Bot size={16} />}
                    label="Agent Hub"
                    active={currentPath === "/dashboard/automation" || currentPath.startsWith("/dashboard/automation")}
                  />
                  <MobileNavItem
                    href="/dashboard/advisor"
                    icon={<Compass size={16} />}
                    label="Career Advisor"
                    active={currentPath === "/dashboard/advisor" || currentPath.startsWith("/dashboard/advisor")}
                  />
                  <MobileNavItem
                    href="/dashboard/linkedin-optimizer"
                    icon={<Linkedin size={16} />}
                    label="LinkedIn Optimizer"
                    active={currentPath === "/dashboard/linkedin-optimizer" || currentPath.startsWith("/dashboard/linkedin-optimizer")}
                  />
                  <MobileNavItem
                    href="/dashboard/salary-simulator"
                    icon={<DollarSign size={16} />}
                    label="Salary Simulator"
                    active={currentPath === "/dashboard/salary-simulator" || currentPath.startsWith("/dashboard/salary-simulator")}
                  />
                  <MobileNavItem
                    href="/dashboard/portfolio-settings"
                    icon={<Globe size={16} />}
                    label="Portfolio Sites"
                    active={currentPath === "/dashboard/portfolio-settings" || currentPath.startsWith("/dashboard/portfolio-settings")}
                  />
                  <MobileNavItem
                    href="/dashboard/ab-testing"
                    icon={<SplitSquareHorizontal size={16} />}
                    label="A/B Testing"
                    active={currentPath === "/dashboard/ab-testing" || currentPath.startsWith("/dashboard/ab-testing")}
                  />
                  <MobileNavItem
                    href="/dashboard/pipeline"
                    icon={<Workflow size={16} />}
                    label="Job Pipeline"
                    active={currentPath === "/dashboard/pipeline" || currentPath.startsWith("/dashboard/pipeline")}
                  />
                  <MobileNavItem
                    href="/dashboard/culture-fit"
                    icon={<Building2 size={16} />}
                    label="Culture Fit"
                    active={currentPath === "/dashboard/culture-fit" || currentPath.startsWith("/dashboard/culture-fit")}
                  />
                  <MobileNavItem
                    href="/dashboard/offer-compare"
                    icon={<Scale size={16} />}
                    label="Offer Compare"
                    active={currentPath === "/dashboard/offer-compare" || currentPath.startsWith("/dashboard/offer-compare")}
                  />
                  <MobileNavItem
                    href="/dashboard/usage-metrics"
                    icon={<Activity size={16} />}
                    label="Usage Metrics"
                    active={currentPath === "/dashboard/usage-metrics" || currentPath.startsWith("/dashboard/usage-metrics")}
                  />
                </div>
              </div>

              {/* App Preferences Section */}
              <div className="space-y-4 pt-2 border-t border-border/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                  App Preferences
                </h3>
                
                <div className="space-y-3">
                  {isLoaded && user && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/30 border border-border/50">
                      <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                          elements: {
                            avatarBox: "w-10 h-10 ring-2 ring-border/30 ring-offset-1 ring-offset-background",
                          },
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.emailAddresses?.[0]?.emailAddress}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex bg-muted/50 p-1 rounded-xl">
                    {[
                      { theme: "light", icon: <Sun size={14} />, label: "Light" },
                      { theme: "dark", icon: <Moon size={14} />, label: "Dark" },
                      { theme: "system", icon: <Monitor size={14} />, label: "System" },
                    ].map((t) => (
                      <button
                        key={t.theme}
                        onClick={() => setTheme(t.theme)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all duration-200"
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => setShowSignOutConfirm(true)}
                    className="w-full justify-start gap-3 rounded-xl bg-rose-500/10 text-rose-600 hover:text-rose-700 hover:bg-rose-500/20"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </Button>
                </div>
              </div>

            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AnimatePresence>
        {showSignOutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSignOutConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl p-6 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 mx-auto mb-4">
                <AlertTriangle size={22} className="text-rose-500" />
              </div>
              <h3 className="text-base font-bold text-center mb-1">Sign out of CareerForge AI?</h3>
              <p className="text-xs text-muted-foreground text-center mb-6">
                You&apos;ll need to sign in again to access your resumes and portfolios.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-muted/50 hover:bg-muted transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => signOut(() => { window.location.href = "/"; })}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors duration-200 shadow-sm shadow-rose-600/20"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
