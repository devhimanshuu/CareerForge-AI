"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Box, Sparkles, Smartphone, Layers, Github, Video, BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ARPopOutViewerProps {
  data: any;
}

const ARPopOutViewer = ({ data }: ARPopOutViewerProps) => {
  const [active, setActive] = useState(false);
  const [orientation, setOrientation] = useState({ x: 0, y: 0 });

  // Motion values for simulated AR tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 100 };
  const rotateX = useSpring(useTransform(y, [-10, 10], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(x, [-10, 10], [-15, 15]), springConfig);

  useEffect(() => {
    if (!active) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        // Clamp values to a reasonable range
        const beta = Math.max(-20, Math.min(20, e.beta - 45)); // Adjust for natural holding angle
        const gamma = Math.max(-20, Math.min(20, e.gamma));
        
        y.set(beta / 2);
        x.set(gamma / 2);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [active, x, y]);

  const requestPermission = async () => {
    // Only works on HTTPS and requires user gesture
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === "granted") {
          setActive(true);
        }
      } catch (err) {
        console.error("Permission denied", err);
        // Fallback for non-permission browsers
        setActive(true);
      }
    } else {
      setActive(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-24 right-6 z-50">
        <Button
          onClick={active ? () => setActive(false) : requestPermission}
          className="rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/40 p-0 group overflow-hidden"
        >
          <motion.div
            animate={active ? { rotate: 90 } : { rotate: 0 }}
            className="flex items-center justify-center w-full h-full"
          >
            {active ? <X size={24} /> : <Smartphone size={24} className="group-hover:scale-110 transition-transform" />}
          </motion.div>
          {!active && (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-16 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold whitespace-nowrap text-white pointer-events-none"
            >
                Launch AR Mode
            </motion.div>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 overflow-hidden"
          >
            {/* AR Scanning Grid UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/20 rounded-3xl" />
                <motion.div 
                    animate={{ y: [0, 320, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[calc(50%-160px)] left-1/2 -translate-x-1/2 w-80 h-0.5 bg-indigo-500 shadow-[0_0_20px_#6366f1]"
                />
            </div>

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                <div className="text-center mb-12 space-y-2">
                    <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">AR Perspective Active</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Tilt your device to see projects pop out</p>
                </div>

                <motion.div
                    style={{ rotateX, rotateY, perspective: 1000 }}
                    className="relative w-full aspect-[3/4] rounded-[2.5rem] bg-slate-800 border-8 border-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] flex flex-col p-8 overflow-visible"
                >
                    {/* Simulated Paper Background */}
                    <div className="absolute inset-0 bg-white rounded-[2rem] opacity-[0.05]" />
                    
                    {/* Pop-out Project Card 1 */}
                    <motion.div
                        initial={{ z: 0 }}
                        style={{ translateZ: 100 }}
                        className="absolute -top-10 -right-10 w-48 p-4 rounded-2xl bg-indigo-600 shadow-2xl border border-white/20 z-20"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Github size={16} className="text-white" />
                            <span className="text-[10px] font-black uppercase text-white/70 tracking-widest">Active Repo</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">Project Nova</h4>
                        <div className="h-12 bg-white/10 rounded-lg flex items-end p-2 gap-1">
                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                <motion.div 
                                    key={i}
                                    animate={{ height: [`${h}%`, `${h+10}%`, `${h}%`] }}
                                    transition={{ duration: 1 + Math.random(), repeat: Infinity }}
                                    className="flex-1 bg-white/40 rounded-t-sm"
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Pop-out Testimonial Video */}
                    <motion.div
                        style={{ translateZ: 60 }}
                        className="absolute -bottom-12 -left-12 w-56 p-4 rounded-2xl bg-slate-900 shadow-2xl border border-white/10 z-10"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Video size={16} className="text-emerald-400" />
                            <span className="text-[10px] font-black uppercase text-emerald-400/70 tracking-widest">Testimonial</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                                <Sparkles size={20} className="text-white/20" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-white italic">"Absolute game changer..."</span>
                                <span className="text-[8px] text-slate-500">- CTO at TechCorp</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Pop-out Skill Graph */}
                    <motion.div
                        style={{ translateZ: 140 }}
                        className="absolute top-1/2 -left-16 w-40 p-4 rounded-2xl bg-white text-slate-950 shadow-2xl z-30"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 size={14} className="text-indigo-600" />
                            <span className="text-[9px] font-black uppercase text-slate-500">Expertise</span>
                        </div>
                        <div className="space-y-2">
                           {["React", "Next.js", "AI/ML"].map((skill) => (
                               <div key={skill} className="space-y-1">
                                   <div className="flex justify-between text-[8px] font-bold uppercase">
                                       <span>{skill}</span>
                                       <span>95%</span>
                                   </div>
                                   <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                       <div className="h-full bg-indigo-500 w-[95%]" />
                                   </div>
                               </div>
                           ))}
                        </div>
                    </motion.div>

                    {/* Core Information (Static on paper) */}
                    <div className="relative z-0 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-white italic tracking-tighter leading-none">
                                {data.personalInfo?.firstName} {data.personalInfo?.lastName}
                            </h3>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{data.personalInfo?.jobTitle}</p>
                        </div>
                        <div className="h-px bg-white/10 w-full" />
                        <div className="space-y-2">
                            <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                            <div className="h-2 w-full bg-white/10 rounded-full" />
                            <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                        </div>
                    </div>
                </motion.div>

                <div className="mt-20 flex flex-col items-center gap-6">
                    <Button 
                        onClick={() => setActive(false)}
                        variant="ghost" 
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white"
                    >
                        Exit AR Simulation
                    </Button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ARPopOutViewer;
