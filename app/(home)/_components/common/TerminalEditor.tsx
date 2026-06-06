"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Zap, Save, X, Terminal as TerminalIcon, Info, HelpCircle } from "lucide-react";
import { useResumeContext } from "@/context/resume-info-provider";
import useUpdateDocument from "@/features/document/use-update-document";
import { toast } from "@/hooks/use-toast";
import { createPortal } from "react-dom";

const TerminalEditor = ({ onClose }: { onClose: () => void }) => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([
    "CAREERFORGE AI [Version 10.0.24.22]",
    "(c) 2026 CareerForge Corporation. All rights reserved.",
    "",
    "Type 'help' for a list of available commands.",
    ""
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = async (cmd: string) => {
    const parts = cmd.trim().split(" ");
    const action = parts[0].toLowerCase();
    const args = parts.slice(1);

    setHistory((prev) => [...prev, `> ${cmd}`]);

    switch (action) {
      case "help":
        setHistory((prev) => [
          ...prev,
          "Available commands:",
          "  set <field> <value>    - Update a personal info field (e.g. set jobTitle 'Lead Dev')",
          "  ls                     - List current resume sections",
          "  cat <section>          - View detailed data for a section",
          "  clear                  - Clear terminal screen",
          "  save                   - Sync changes to database",
          "  exit                   - Return to GUI mode",
          "  whoami                 - Display user identity",
          ""
        ]);
        break;

      case "whoami":
        setHistory((prev) => [...prev, `${resumeInfo?.personalInfo?.firstName || "Unknown User"}@careerforge:~$`, ""]);
        break;

      case "clear":
        setHistory([]);
        break;

      case "ls":
        setHistory((prev) => [
          ...prev,
          "personal_info/",
          "experience/",
          "education/",
          "skills/",
          "summary.txt",
          ""
        ]);
        break;

      case "set":
        if (args.length < 2) {
            setHistory(prev => [...prev, "Usage: set <field> <value>", ""]);
            break;
        }
        const field = args[0];
        const value = args.slice(1).join(" ").replace(/['"]/g, "");
        
        if (resumeInfo) {
            const updatedInfo = {
                ...resumeInfo,
                personalInfo: {
                    ...resumeInfo.personalInfo,
                    [field]: value
                }
            };
            onUpdate(updatedInfo);
            setHistory(prev => [...prev, `Successfully updated ${field} to: "${value}"`, ""]);
        }
        break;

      case "cat":
        if (args[0] === "personal_info") {
            setHistory(prev => [...prev, JSON.stringify(resumeInfo?.personalInfo, null, 2), ""]);
        } else if (args[0] === "summary.txt") {
            setHistory(prev => [...prev, resumeInfo?.summary || "No summary found.", ""]);
        } else {
            setHistory(prev => [...prev, `cat: ${args[0]}: No such file or directory`, ""]);
        }
        break;

      case "exit":
        onClose();
        break;

      case "save":
        if (resumeInfo) {
          try {
            await mutateAsync({
              personalInfo: resumeInfo.personalInfo || {},
              summary: resumeInfo.summary,
              experience: resumeInfo.experiences as any,
              education: resumeInfo.educations as any,
              skills: resumeInfo.skills as any,
            });
            setHistory(prev => [...prev, "Initializing secure database sync...", " [OK] Verifying credentials", " [OK] Uploading blobs", " [DONE] Changes persisted successfully.", ""]);
            toast({ title: "Terminal Sync Successful", description: "All manual CLI overrides have been saved." });
          } catch (err: any) {
            setHistory(prev => [...prev, "Initializing secure database sync...", ` [FAIL] Database sync failed: ${err.message || err}`, ""]);
            toast({ title: "Terminal Sync Failed", description: "Failed to persist overrides.", variant: "destructive" });
          }
        } else {
          setHistory(prev => [...prev, "No active resume loaded.", ""]);
        }
        break;

      default:
        setHistory((prev) => [...prev, `Command not found: ${action}. Type 'help' for assistance.`, ""]);
    }
  };

  const terminalContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md p-4 flex items-center justify-center"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="w-full max-w-4xl h-[70vh] bg-slate-900/50 rounded-2xl border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col overflow-hidden font-mono text-emerald-500 relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,1,0.06))] z-10 [background-size:100%_4px,3px_100%]" />
        
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-emerald-500/20 z-20">
            <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest ml-2 opacity-50">CareerForge // Secure Terminal</span>
            </div>
            <button onClick={onClose} className="hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto custom-scrollbar relative z-20"
        >
            {history.map((line, i) => (
                <div key={i} className="min-h-[1.2rem] whitespace-pre-wrap leading-relaxed">
                    {line}
                </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
                <span className="text-emerald-400 font-bold italic">guest@careerforge:~$</span>
                <input
                    ref={inputRef}
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-emerald-500 focus:ring-0 p-0"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleCommand(input);
                            setInput("");
                        }
                    }}
                />
            </div>
        </div>

        <div className="px-6 py-3 bg-emerald-500/5 border-t border-emerald-500/10 flex items-center justify-between text-[9px] uppercase font-black tracking-[0.2em] z-20">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><Shield size={10} /> Encryption: AES-256</span>
                <span className="flex items-center gap-1.5"><Zap size={10} /> Latency: 2ms</span>
            </div>
            <div className="opacity-40">
                [Hacker Mode Active]
            </div>
        </div>
      </div>
    </motion.div>
  );

  if (!mounted) return null;

  return createPortal(terminalContent, document.body);
};

export default TerminalEditor;
