"use client";
import React, { useRef, useState } from "react";
import TopSection from "./common/TopSection";
import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import { cn } from "@/lib/utils";
import ResumeDoctor from "./common/ResumeDoctor";
import { useResumeContext } from "@/context/resume-info-provider";
import { useEffect } from "react";
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
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const EditResume = () => {
  const [activeTab, setActiveTab] = React.useState<"form" | "preview">("form");
  const [isMounted, setIsMounted] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const param = useParams();
  const searchParams = useSearchParams();
  const previewRef = useRef<HTMLDivElement>(null);

  // Collaboration mode is enabled when ?collab=true query param is present
  const isCollabMode = searchParams?.get("collab") === "true";
  const documentId = param.documentId as string;
  const roomId = `document-${documentId}`;

  // Generate share link for collaboration
  const shareLink = typeof window !== "undefined"
    ? `${window.location.origin}/dashboard/document/${documentId}/edit?collab=true`
    : "";

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({ title: "Link copied", description: "Share this link to collaborate in real-time" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
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

  // The editor content to render — wrapped in CollaborationProvider if collab mode
  const editorContent = (
    <div className="relative w-full h-[calc(100dvh-56px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation Bar - Professional Studio Look */}
      <div className="flex-none bg-background/80 backdrop-blur-xl z-30 border-b border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
         <div className="max-w-[1800px] mx-auto px-4 py-2.5 flex items-center gap-2">
            <TopSection />
            {/* Presence indicator — only visible in collab mode */}
            {isCollabMode && <PresenceIndicator />}
            {/* Share for Collaboration button */}
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
                  : "text-muted-foreground hover:text-foreground",
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
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Preview
            </button>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative z-10 max-w-[1920px] mx-auto w-full">
        {isMounted && (
          isDesktop ? (
            <ResizablePanelGroup direction="horizontal" className="w-full h-full flex">
              {/* Form Section Sidebar */}
              <ResizablePanel
                defaultSize={42}
                minSize={25}
                maxSize={65}
                className="h-full overflow-y-auto bg-background relative z-10 custom-scrollbar shadow-[20px_0_40px_rgba(0,0,0,0.02)]"
              >
                <div className="max-w-2xl mx-auto h-full">
                  <ResumeForm />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-border/40 w-1.5 transition-colors hover:bg-indigo-500/50" />

              {/* Right Preview Panel */}
              <ResizablePanel
                defaultSize={58}
                minSize={35}
                maxSize={75}
                className="h-full overflow-y-auto relative flex justify-center py-12 px-8 xl:px-16 custom-scrollbar bg-slate-200/50 dark:bg-slate-900/40"
              >
                <div ref={previewRef} className="w-full max-w-[850px] flex justify-center transform-gpu hover:scale-[1.01] transition-transform duration-500 origin-top relative">
                   <ResumePreview />
                   {/* Cursors overlay — only in collab mode */}
                   {isCollabMode && <Cursors containerRef={previewRef} />}
                </div>

                {/* Floating Canvas Controls */}
                <div className="fixed bottom-8 right-8 flex items-center gap-2 p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-2xl z-30">
                    <div className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground px-3">Live Canvas v2.4</div>
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
                <div className="w-full h-full min-h-screen py-12 px-4 bg-slate-200/50 dark:bg-slate-900/40 flex justify-center">
                  <div className="w-full max-w-[850px]">
                    <ResumePreview />
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

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
                <Button variant="ghost" size="sm" onClick={() => setShowShareModal(false)}>
                  ✕
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Share this link with collaborators. They\'ll be able to see your edits in real-time, leave inline comments, and track each other\'s presence.
              </p>

              {/* Share link input */}
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

              {/* Toggle collaboration mode */}
              <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                <div className="flex-1">
                  <div className="text-sm font-medium">Enable Collaboration Mode</div>
                  <div className="text-xs text-muted-foreground">
                    Shows real-time cursors, presence indicators, and inline comments
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

  // Wrap with CollaborationProvider only in collab mode
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
