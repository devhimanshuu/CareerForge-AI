"use client";

import React, { useState } from "react";
import { Sparkles, Bot, Zap, TrendingUp, Compass, Flame, MessageSquare, Wand2, Target, DollarSign, BrainCircuit, ChevronDown, Eye, Clock, ShieldCheck, Terminal as TerminalIcon, Headphones, BookOpen, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AutoTailorEngine from "../../app/(home)/_components/common/AutoTailorEngine";
import InterviewPrepAssistant from "../../app/(home)/_components/common/InterviewPrepAssistant";
import SkillGapAnalyzer from "../../app/(home)/_components/common/SkillGapAnalyzer";
import ResumeImport from "../../app/(home)/_components/common/ResumeImport";
import LiarDetector from "../../app/(home)/_components/common/LiarDetector";
import AttentionHeatmap from "../../app/(home)/_components/common/AttentionHeatmap";
import TerminalEditor from "../../app/(home)/_components/common/TerminalEditor";
import InterviewCheatSheet from "../../app/(home)/_components/common/InterviewCheatSheet"



interface MagicItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    bgColor: string;
    trigger: React.ReactNode;
}

function MagicItem({ icon, title, description, color, bgColor, trigger }: MagicItemProps) {
    return (
        <div className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all duration-300 group cursor-default">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-white/90">{title}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{description}</span>
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {trigger}
            </div>
        </div>
    );
}

const MagicAI = () => {
    const [showTerminal, setShowTerminal] = useState(false);

    return (
        <React.Fragment>
            <AnimatePresence>
                {showTerminal && <TerminalEditor onClose={() => setShowTerminal(false)} />}
            </AnimatePresence>

            <DropdownMenu modal={false}>

                <DropdownMenuTrigger asChild>
                    <Button className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] animate-gradient-x hover:scale-[1.02] active:scale-95 text-white font-black uppercase tracking-widest text-[10px] h-9 gap-2 px-4 rounded-xl shadow-lg shadow-indigo-500/25 border-none transition-all group">
                        <Sparkles size={14} className="group-hover:rotate-12 transition-transform duration-500 fill-white/20" />
                        Magic AI Suite
                        <div className="w-px h-3 bg-white/20 mx-1 hidden sm:block" />
                        <ChevronDown size={12} className="opacity-50 group-data-[state=open]:rotate-180 transition-transform duration-300" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-80 p-0 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-slate-950/95 backdrop-blur-xl overflow-hidden"
                >
                    {/* Header Section */}
                    <div className="p-4 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 dark:from-indigo-500/10 dark:to-violet-500/10 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
                                    <BrainCircuit size={14} className="text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Career Intelligence</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white/90">AI-Powered Workflows</h3>
                        </div>
                        <div className="scale-75 origin-right">
                            <ResumeImport />
                        </div>
                    </div>


                    <div className="p-2 max-h-[450px] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 gap-1">
                            <MagicItem
                                icon={<Zap size={18} />}
                                title="Auto-Tailor"
                                description="Optimize for specific job posts"
                                color="text-indigo-600 dark:text-indigo-400"
                                bgColor="bg-indigo-50 dark:bg-indigo-500/10"
                                trigger={<AutoTailorEngine />}
                            />
                            <MagicItem
                                icon={<Bot size={18} />}
                                title="Interview Prep"
                                description="AI-generated mock interview"
                                color="text-emerald-600 dark:text-emerald-400"
                                bgColor="bg-emerald-50 dark:bg-emerald-500/10"
                                trigger={<InterviewPrepAssistant />}
                            />
                            <MagicItem
                                icon={<Target size={18} />}
                                title="Skill Gap"
                                description="Analyze missing requirements"
                                color="text-amber-600 dark:text-amber-400"
                                bgColor="bg-amber-50 dark:bg-amber-500/10"
                                trigger={<SkillGapAnalyzer />}
                            />
                            <MagicItem
                                icon={<Eye size={18} />}
                                title="Mind-Reader"
                                description="Recruiter attention heatmap"
                                color="text-red-600 dark:text-red-400"
                                bgColor="bg-red-50 dark:bg-red-500/10"
                                trigger={<AttentionHeatmap />}
                            />
                            <MagicItem
                                icon={<ShieldCheck size={18} />}
                                title="Liar Detector"
                                description="AI-driven veracity audit"
                                color="text-blue-600 dark:text-blue-400"
                                bgColor="bg-blue-50 dark:bg-blue-500/10"
                                trigger={<LiarDetector />}
                            />
                            <MagicItem
                                icon={<BookOpen size={18} />}
                                title="Cheat Sheet"
                                description="Company-specific prep dossier"
                                color="text-purple-600 dark:text-purple-400"
                                bgColor="bg-purple-50 dark:bg-purple-500/10"
                                trigger={<InterviewCheatSheet />}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                        <div className="p-3 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center border-t border-slate-100 dark:border-white/5">
                            <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={10} className="text-indigo-600 dark:text-indigo-500" />
                                Powered by CareerForge AI Core
                            </p>
                        </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </React.Fragment>
    );
};

export default MagicAI;
