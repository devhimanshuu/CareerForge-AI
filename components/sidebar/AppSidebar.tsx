"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Briefcase,
  Mic,
  Globe,
  Map,
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Zap,
  FileText,
  Target,
  Languages,
  DownloadCloud,
  ShareIcon,
  Layout,
  Ruler,
  Palette,
  Eye,
  ShieldCheck,
  BookOpen,
  DollarSign,
  Compass,
  Headphones,
  Flame,
  LogOut,
  X,
  AlertTriangle,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/sidebar-context";
import Image from "next/image";
import FeaturePanel from "@/app/(home)/_components/common/FeaturePanel";

/* ── Navigation items ── */
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/applications", label: "Job Tracker", icon: Briefcase },
  { href: "/dashboard/interview", label: "Interview Lab", icon: Mic },
  { href: "/dashboard/market", label: "Market Data", icon: Globe },
  { href: "/dashboard/roadmap", label: "Roadmap", icon: Map },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/automation", label: "Agents", icon: Bot },
  { href: "/dashboard/pipeline", label: "Job Pipeline", icon: Workflow },
];

/* ── Editor tool features (shown when on editor route) ── */
const editorFeatures = [
  { id: "auto-tailor", icon: <Zap size={15} />, title: "Auto-Tailor", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "interview-prep", icon: <Bot size={15} />, title: "Interview Prep", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "skill-gap", icon: <Target size={15} />, title: "Skill Gap", color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "mind-reader", icon: <Eye size={15} />, title: "Mind-Reader", color: "text-red-500", bg: "bg-red-500/10" },
  { id: "liar-detector", icon: <ShieldCheck size={15} />, title: "Liar Detector", color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "cheat-sheet", icon: <BookOpen size={15} />, title: "Cheat Sheet", color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "salary", icon: <DollarSign size={15} />, title: "Salary Estimate", color: "text-green-500", bg: "bg-green-500/10" },
  { id: "career-paths", icon: <Compass size={15} />, title: "Career Paths", color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "podcast", icon: <Headphones size={15} />, title: "Podcast Resume", color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "roast", icon: <Flame size={15} />, title: "Resume Roast", color: "text-red-500", bg: "bg-red-500/10" },
  { id: "templates", icon: <Layout size={15} />, title: "Templates", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "theme-color", icon: <Palette size={15} />, title: "Theme Color", color: "text-pink-500", bg: "bg-pink-500/10" },
  { id: "auto-fit", icon: <Ruler size={15} />, title: "AI Perfect Fit", color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "cover-letter", icon: <FileText size={15} />, title: "Cover Letter", color: "text-primary", bg: "bg-primary/10" },
  { id: "ats-match", icon: <Target size={15} />, title: "ATS Match", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "translate", icon: <Languages size={15} />, title: "Translate", color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "download-pdf", icon: <DownloadCloud size={15} />, title: "Download PDF", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "share", icon: <ShareIcon size={15} />, title: "Share Portfolio", color: "text-indigo-500", bg: "bg-indigo-500/10" },
];

/* ── Tooltip for collapsed state ── */
function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="group/tip relative">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 z-[200] ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-[10px] font-bold text-background opacity-0 shadow-lg transition-all duration-200 group-hover/tip:opacity-100 group-hover/tip:translate-x-0">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
      </div>
    </div>
  );
}

/* ── Nav Item ── */
function NavItem({
  item,
  isActive,
  collapsed,
}: {
  item: (typeof navItems)[number];
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 group relative",
        isActive
          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-500/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        collapsed && "justify-center px-0 py-2.5"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-xl bg-indigo-500/10 shadow-sm shadow-indigo-500/10"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <Icon
        size={18}
        className={cn(
          "relative z-10 shrink-0 transition-transform duration-300",
          isActive ? "scale-110" : "group-hover:scale-110"
        )}
      />
      {!collapsed && (
        <span className="relative z-10 truncate">{item.label}</span>
      )}
      {isActive && !collapsed && (
        <div className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-indigo-500" />
      )}
    </Link>
  );

  if (collapsed) {
    return <Tooltip label={item.label}>{content}</Tooltip>;
  }
  return content;
}

/* ── Feature Item (editor tools) ── */
function FeatureItem({
  feature,
  collapsed,
  onClick,
}: {
  feature: (typeof editorFeatures)[number];
  collapsed: boolean;
  onClick: () => void;
}) {
  if (collapsed) {
    return (
      <Tooltip label={feature.title}>
        <button
          onClick={onClick}
          className="flex items-center justify-center w-full rounded-xl p-2.5 hover:bg-muted/60 transition-all duration-200 group"
        >
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", feature.bg, feature.color)}>
            {feature.icon}
          </div>
        </button>
      </Tooltip>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full rounded-xl px-3 py-2 hover:bg-muted/60 transition-all duration-200 group text-left"
    >
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", feature.bg, feature.color)}>
        {feature.icon}
      </div>
      <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
        {feature.title}
      </span>
    </button>
  );
}

/* ── Main Sidebar ── */
const AppSidebar = () => {
  const { collapsed, toggle } = useSidebar();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [showTools, setShowTools] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showFeaturePanel, setShowFeaturePanel] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  /* ── Touch swipe to close ── */
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  /* Detect if we're on an editor page */
  const isEditorPage = pathname?.includes("/document/") && pathname?.includes("/edit");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Close mobile sidebar on navigation */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* Escape key closes mobile sidebar */
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!mobileOpen) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    /* Close if swiping left > 60px and more horizontal than vertical */
    if (deltaX < -60 && deltaY < 80) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile hamburger */}
      <AnimatePresence>
        {!mobileOpen && (
          <motion.button
            key="mobile-hamburger"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onClick={() => setMobileOpen(true)}
            className="fixed top-3 left-3 z-[80] lg:hidden w-10 h-10 rounded-xl bg-background/80 backdrop-blur-md border border-border/50 shadow-lg flex items-center justify-center"
          >
            <Image
              src="/CareerForge_ai_final.png"
              alt="CareerForge AI"
              width={28}
              height={28}
              className="rounded-md"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — fixed overlay on mobile, normal flex child on desktop */}
      <aside
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "bg-background border-r border-border/50 flex flex-col shrink-0 z-[70]",
          isMobile
            ? cn(
                "fixed top-0 left-0 bottom-0 transition-[width,transform] duration-300 [transitionTimingFunction:cubic-bezier(0.4,0,0.2,1)]",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              )
            : "relative transition-[width] duration-300 [transitionTimingFunction:cubic-bezier(0.4,0,0.2,1)]",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* ── Logo ── */}
        <div className={cn("flex items-center shrink-0 h-16 border-b border-border/40", collapsed ? "justify-center px-2" : "px-4 gap-3")}>
          <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative shrink-0">
              <Image
                src="/CareerForge_ai_final.png"
                alt="CareerForge AI"
                width={32}
                height={32}
                className="group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)] rounded-lg"
              />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-indigo-400 bg-clip-text text-transparent overflow-hidden whitespace-nowrap"
                >
                  CareerForge AI
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          {/* Mobile close button */}
          {isMobile && mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── Main Navigation ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-2 space-y-1">
          {!collapsed && (
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-3 mb-2">
              Navigation
            </p>
          )}
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <NavItem
                key={item.href}
                item={item}
                isActive={isActive}
                collapsed={collapsed}
              />
            );
          })}

          {/* ── Editor Tools Section (only on editor pages) ── */}
          {isEditorPage && (
            <>
              <div className={cn("my-3 border-t border-border/30", collapsed ? "mx-1" : "mx-2")} />
              {!collapsed && (
                <div className="flex items-center justify-between px-3 mb-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                    Editor Tools
                  </p>
                  <button
                    onClick={() => setShowTools(!showTools)}
                    className="text-[9px] font-bold text-indigo-500 hover:text-indigo-400 transition-colors"
                  >
                    {showTools ? "Hide" : "Show All"}
                  </button>
                </div>
              )}

              {(showTools || collapsed) ? (
                <div className="space-y-0.5">
                  {editorFeatures.map((f) => (
                    <FeatureItem
                      key={f.id}
                      feature={f}
                      collapsed={collapsed}
                      onClick={() => setShowFeaturePanel(true)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {editorFeatures.slice(0, 6).map((f) => (
                    <FeatureItem
                      key={f.id}
                      feature={f}
                      collapsed={collapsed}
                      onClick={() => setShowFeaturePanel(true)}
                    />
                  ))}
                  {!collapsed && (
                    <button
                      onClick={() => setShowFeaturePanel(true)}
                      className="flex items-center gap-3 w-full rounded-xl px-3 py-2 hover:bg-muted/60 transition-all text-left"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/50">
                        <Sparkles size={14} className="text-muted-foreground" />
                      </div>
                      <span className="text-xs font-semibold text-indigo-500">
                        +{editorFeatures.length - 6} more tools
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* ── All Tools Button ── */}
              {!collapsed && (
                <button
                  onClick={() => setShowFeaturePanel(true)}
                  className="flex items-center gap-2 w-full rounded-xl px-3 py-2.5 mt-1 bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 transition-all duration-200 group"
                >
                  <Sparkles size={14} className="transition-transform group-hover:scale-110" />
                  <span className="text-xs font-bold">All Tools</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Bottom Section ── */}
        <div className={cn("shrink-0 border-t border-border/40 space-y-1", collapsed ? "px-2 py-2" : "px-3 py-3")}>
          {/* Theme Toggle */}
          <div className={cn("flex rounded-xl bg-muted/30 p-0.5", collapsed ? "flex-col" : "")}>
            {[
              { theme: "light", icon: <Sun size={13} />, label: "Light" },
              { theme: "dark", icon: <Moon size={13} />, label: "Dark" },
              { theme: "system", icon: <Monitor size={13} />, label: "System" },
            ].map((t) => (
              <button
                key={t.theme}
                onClick={() => setTheme(t.theme)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold transition-all duration-200",
                  collapsed ? "px-0" : "flex-1 px-2",
                  "text-muted-foreground hover:text-foreground hover:bg-background/60"
                )}
                title={t.label}
              >
                {t.icon}
                {!collapsed && <span>{t.label}</span>}
              </button>
            ))}
          </div>

          {/* User Section */}
          <div className={cn(
            "flex items-center gap-2.5 rounded-xl py-2 transition-all",
            collapsed ? "flex-col px-0" : "px-2"
          )}>
            <div className={cn("flex items-center gap-2.5", collapsed ? "" : "flex-1 min-w-0")}>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 ring-2 ring-border/30 ring-offset-1 ring-offset-background",
                  },
                }}
              />
              <AnimatePresence>
                {!collapsed && isLoaded && user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="min-w-0"
                  >
                    <p className="text-xs font-bold truncate">{user.firstName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {user.emailAddresses?.[0]?.emailAddress}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Sign Out Button */}
            <Tooltip label="Sign out">
              <button
                onClick={() => setShowSignOutConfirm(true)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg text-[10px] font-bold text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-200",
                  collapsed ? "w-8 h-8" : "px-2.5 py-1.5"
                )}
                title="Sign out"
              >
                <LogOut size={14} />
                {!collapsed && <span>Sign Out</span>}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* ── Collapse Toggle (desktop only) ── */}
        <button
          onClick={toggle}
          className="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 rounded-full bg-background border border-border/50 shadow-md items-center justify-center hover:bg-muted transition-all duration-200 hover:scale-110"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── Feature Panel (full tool drawer) ── */}
      <FeaturePanel isOpen={showFeaturePanel} onClose={() => setShowFeaturePanel(false)} />

      {/* ── Sign Out Confirmation Dialog ── */}
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

export default AppSidebar;
