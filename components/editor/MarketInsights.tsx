"use client";

import React, { useState } from "react";
import { Sparkles, Bot, Zap, TrendingUp, Compass, Flame, MessageSquare, Wand2, Target, DollarSign, BrainCircuit, ChevronDown, Eye, Clock, ShieldCheck, Terminal as TerminalIcon, Headphones, BookOpen, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import SalaryEstimator from "../../app/(home)/_components/common/SalaryEstimator";
import CareerFortuneTeller from "../../app/(home)/_components/common/CareerFortuneTeller";
import TimeTraveler from "../../app/(home)/_components/common/TimeTraveler";
import TerminalEditor from "../../app/(home)/_components/common/TerminalEditor";
import PodcastResume from "../../app/(home)/_components/common/PodcastResume";
import DigitalWalletCard from "../../app/(home)/_components/common/DigitalWalletCard";
import RecruiterRoast from "../../app/(home)/_components/common/RecruiterRoast";



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

const MarketInsights = () => {
    const [showTerminal, setShowTerminal] = useState(false);

    return (
        <React.Fragment>
            <AnimatePresence>
                {showTerminal && <TerminalEditor onClose={() => setShowTerminal(false)} />}
            </AnimatePresence>

            <DropdownMenu modal={false}>

                <DropdownMenuTrigger asChild>
                    <Button className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 bg-[length:200%_auto] animate-gradient-x hover:scale-[1.02] active:scale-95 text-white font-black uppercase tracking-widest text-[10px] h-9 gap-2 px-4 rounded-xl shadow-lg shadow-teal-500/25 border-none transition-all group">
                        <TrendingUp size={14} className="group-hover:rotate-12 transition-transform duration-500 fill-white/20" />
                        Market Insights
                        <div className="w-px h-3 bg-white/20 mx-1 hidden sm:block" />
                        <ChevronDown size={12} className="opacity-50 group-data-[state=open]:rotate-180 transition-transform duration-300" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-80 p-0 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-slate-950/95 backdrop-blur-xl overflow-hidden"
                >
                    {/* Header Section */}
                    <div className="p-4 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 dark:from-teal-500/10 dark:to-emerald-500/10 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-lg bg-teal-500 dark:bg-teal-600 flex items-center justify-center">
                                    <TrendingUp size={14} className="text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Industry Data</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white/90">Market & Trends</h3>
                        </div>
                    </div>

                    <div className="p-2 max-h-[450px] overflow-y-auto custom-scrollbar">

                        <div className="grid grid-cols-1 gap-1">
                            <MagicItem
                                icon={<DollarSign size={18} />}
                                title="Salary Estimate"
                                description="Real-world market rates"
                                color="text-green-600 dark:text-green-400"
                                bgColor="bg-green-50 dark:bg-green-500/10"
                                trigger={<SalaryEstimator />}
                            />
                            <MagicItem
                                icon={<Compass size={18} />}
                                title="Career Paths"
                                description="Predictive role trajectories"
                                color="text-purple-600 dark:text-purple-400"
                                bgColor="bg-purple-50 dark:bg-purple-500/10"
                                trigger={<CareerFortuneTeller />}
                            />
                            <MagicItem
                                icon={<Headphones size={18} />}
                                title="Podcast Resume"
                                description="2-min AI interview podcast"
                                color="text-amber-600 dark:text-amber-400"
                                bgColor="bg-amber-50 dark:bg-amber-500/10"
                                trigger={<PodcastResume />}
                            />
                            <MagicItem
                                icon={<Flame size={18} />}
                                title="Resume Roast"
                                description="Brutally honest AI critique"
                                color="text-red-600 dark:text-red-400"
                                bgColor="bg-red-50 dark:bg-red-500/10"
                                trigger={<RecruiterRoast />}
                            />
                            <MagicItem
                                icon={<Clock size={18} />}
                                title="Time-Traveler"
                                description="See your resume in 2030"
                                color="text-purple-600 dark:text-purple-400"
                                bgColor="bg-purple-50 dark:bg-purple-500/10"
                                trigger={<TimeTraveler />}
                            />
                            <MagicItem
                                icon={<TerminalIcon size={18} />}
                                title="Hacker Mode"
                                description="Build resume via Terminal"
                                color="text-emerald-600 dark:text-emerald-400"
                                bgColor="bg-emerald-50 dark:bg-emerald-500/10"
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-8 h-8 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                                        onClick={() => setShowTerminal(true)}
                                    >
                                        <TerminalIcon size={16} />
                                    </Button>
                                }
                            />
                            <MagicItem
                                icon={<Smartphone size={18} />}
                                title="Digital Card"
                                description="Add resume to Mobile Wallet"
                                color="text-indigo-600 dark:text-indigo-400"
                                bgColor="bg-indigo-50 dark:bg-indigo-500/10"
                                trigger={<DigitalWalletCard />}
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

export default MarketInsights;
