"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import TopSection from "./common/TopSection";
import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import { cn } from "@/lib/utils";
import ResumeDoctor from "./common/ResumeDoctor";
import { useResumeContext } from "@/context/resume-info-provider";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CollaborationProvider } from "@/components/collaboration/CollaborationProvider";
import { PresenceIndicator } from "@/components/collaboration/PresenceIndicator";
import { Cursors } from "@/components/collaboration/Cursors";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  History,
  Keyboard,
  X,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const EditResume = () => {
  const [activeTab, setActiveTab] = React.useState<"form" | "preview">("form");
  const [isMounted, setIsMounted] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [showMobileFAB, setShowMobileFAB] = useState(false);
  const param = useParams();
  const searchParams = useSearchParams();
  const previewRef = useRef<HTMLDivElement>(null);
  const isCollabMode = searchParams?.get("collab") === "true";
  const documentId = param.documentId as string;
  const roomId = `document-${documentId}`;

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/document/${documentId}/edit?collab=true`
      : "";

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Share this link to collaborate in real-time",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          setPreviewZoom((prev) => Math.min(prev + 10, 200));
        } else if (e.key === "-") {
          e.preventDefault();
          setPreviewZoom((prev) => Math.max(prev - 10, 50));
        } else if (e.key === "0") {
          e.preventDefault();
          setPreviewZoom(100);
        }
      }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          setShowShortcuts((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mobile FAB visibility on scroll
  useEffect(() => {
    if (isDesktop) return;
    const handleScroll = () => {
      setShowMobileFAB(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDesktop]);

  const editorContent = (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Keyboard Shortcuts Overlay */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Keyboard size={18} className="text-indigo-500" />
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  {
                    category: "Navigation",
                    shortcuts: [
                      { keys: "Ctrl + ←", desc: "Previous form step" },
                      { keys: "Ctrl + →", desc: "Next form step" },
                      { keys: "Alt + 1-5", desc: "Jump to step" },
                    ],
                  },
                  {
                    category: "Preview",
                    shortcuts: [
                      { keys: "Ctrl + +", desc: "Zoom in preview" },
                      { keys: "Ctrl + -", desc: "Zoom out preview" },
                      { keys: "Ctrl + 0", desc: "Reset zoom" },
                    ],
                  },
                  {
                    category: "General",
                    shortcuts: [
                      { keys: "?", desc: "Toggle shortcuts panel" },
                      { keys: "Esc", desc: "Close modals" },
                    ],
                  },
                ].map((group) => (
                  <div key={group.category}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                      {group.category}
                    </p>
                    <div className="space-y-2">
                      {group.shortcuts.map((shortcut) => (
                        <div
                          key={shortcut.keys}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-muted-foreground">
                            {shortcut.desc}
                          </span>
                          <kbd className="px-2.5 py-1 rounded-lg bg-muted border border-border/50 font-mono text-[11px] font-bold text-foreground">
                            {shortcut.keys}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version History Panel */}
      <AnimatePresence>
        {showVersionHistory && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[90] w-80 bg-background border-l border-border shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <History size={14} className="text-indigo-500" />
                Version History
              </h3>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {[
                {
                  time: "Just now",
                  label: "Current version",
                  active: true,
                },
                {
                  time: new Date(Date.now() - 3600000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  label: "Auto-saved",
                },
                {
                  time: new Date(Date.now() - 86400000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  label: "Manual save",
                },
              ].map((version, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-xl border transition-colors cursor-pointer",
                    version.active
                      ? "border-indigo-500/30 bg-indigo-500/5"
                      : "border-border/50 hover:border-indigo-500/20 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{version.label}</span>
                    {version.active && (
                      <span className="text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {version.time}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Toolbar Bar */}
      <div className="flex-none bg-background/80 backdrop-blur-xl z-30 border-b border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="max-w-full mx-auto px-4 py-2.5 flex items-center gap-2">
          <TopSection />

          {/* Preview Zoom Controls (desktop) */}
          {isDesktop && (
            <div className="hidden lg:flex items-center gap-1 px-2 border-r border-border/50 mr-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewZoom((z) => Math.max(z - 10, 50))}
                title="Zoom out (Ctrl+-)"
              >
                <ZoomOut size={13} />
              </Button>
              <span className="text-[10px] font-black tabular-nums w-10 text-center text-muted-foreground">
                {previewZoom}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewZoom((z) => Math.min(z + 10, 200))}
                title="Zoom in (Ctrl++)"
              >
                <ZoomIn size={13} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewZoom(100)}
                title="Reset zoom (Ctrl+0)"
              >
                <Maximize2 size={13} />
              </Button>
            </div>
          )}

          {isCollabMode && <PresenceIndicator />}

          {/* Version History */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground border-border/50 bg-muted/30 hover:bg-muted/50 shrink-0"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
          >
            <History size={14} />
            <span className="hidden md:inline">History</span>
          </Button>

          {/* Keyboard Shortcuts Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground border-border/50 bg-muted/30 hover:bg-muted/50 shrink-0"
            onClick={() => setShowShortcuts(true)}
          >
            <Keyboard size={14} />
          </Button>

          {/* Share for Collaboration */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 font-bold text-[10px] uppercase tracking-widest text-indigo-500 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 shrink-0"
            onClick={() => setShowShareModal(true)}
          >
            <Share2 size={14} />
            Collab
          </Button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex-none lg:hidden flex justify-center p-3 bg-background/50 backdrop-blur-md border-b border-border/50 z-20">
        <div className="bg-muted/50 p-1 rounded-[16px] flex gap-1 w-full max-w-sm border border-border/20 shadow-inner">
          <button
            onClick={() => setActiveTab("form")}
            className={cn(
              "flex-1 py-2.5 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all duration-300",
              activeTab === "form"
                ? "bg-white dark:bg-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-indigo-600 dark:text-indigo-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "flex-1 py-2.5 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all duration-300",
              activeTab === "preview"
                ? "bg-white dark:bg-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-indigo-600 dark:text-indigo-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative z-10 w-full">
        {isMounted &&
          (isDesktop ? (
            <ResizablePanelGroup
              direction="horizontal"
              className="w-full h-full flex"
            >
              {/* Form Section Sidebar */}
              <ResizablePanel
                defaultSize={42}
                minSize={25}
                maxSize={65}
                className="h-full overflow-y-auto bg-background relative z-10 custom-scrollbar"
              >
                <div className="max-w-2xl mx-auto h-full">
                  <ResumeForm />
                </div>
              </ResizablePanel>

              <ResizableHandle
                withHandle
                className="bg-border/30 w-1 hover:bg-indigo-500/30 transition-colors duration-200"
              />

              {/* Right Preview Panel */}
              <ResizablePanel
                defaultSize={58}
                minSize={35}
                maxSize={75}
                className="h-full overflow-y-auto relative flex justify-center py-10 px-8 xl:px-16 custom-scrollbar preview-canvas"
              >
                <div
                  ref={previewRef}
                  className="w-full max-w-[850px] flex justify-center transition-transform duration-300 origin-top relative"
                  style={{ transform: `scale(${previewZoom / 100})` }}
                >
                  <ResumePreview />
                  {isCollabMode && <Cursors containerRef={previewRef} />}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className="w-full h-full overflow-y-auto bg-background custom-scrollbar">
              {activeTab === "form" ? (
                <div className="max-w-2xl mx-auto px-4 py-6">
                  <ResumeForm />
                </div>
              ) : (
                <div className="w-full h-full min-h-screen py-12 px-4 preview-canvas flex justify-center">
                  <div className="w-full max-w-[850px]">
                    <ResumePreview />
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Mobile FAB - Scroll to Top */}
      <AnimatePresence>
        {showMobileFAB && !isDesktop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Resume Doctor */}
      <ResumeDoctor />

      {/* Share for Collaboration Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Share for Collaboration</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareModal(false)}
                >
                  ✕
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Share this link with collaborators. They&apos;ll be able to see
                your edits in real-time, leave inline comments, and track each
                other&apos;s presence.
              </p>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm font-mono truncate">
                  {shareLink}
                </div>
                <Button
                  size="sm"
                  className={cn(
                    "gap-2",
                    copied && "bg-green-600 hover:bg-green-700"
                  )}
                  onClick={copyShareLink}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    Enable Collaboration Mode
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Shows real-time cursors, presence indicators, and inline
                    comments
                  </div>
                </div>
                <Button
                  variant={isCollabMode ? "default" : "outline"}
                  size="sm"
                  className="text-xs font-bold"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    if (isCollabMode) {
                      url.searchParams.delete("collab");
                    } else {
                      url.searchParams.set("collab", "true");
                    }
                    window.location.href = url.toString();
                  }}
                >
                  {isCollabMode ? "Active" : "Enable"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isCollabMode) {
    return (
      <CollaborationProvider roomId={roomId}>
        {editorContent}
      </CollaborationProvider>
    );
  }

  return editorContent;
};

export default EditResume;
