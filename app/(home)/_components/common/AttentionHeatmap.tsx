"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, Loader2, Sparkles, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeContext } from "@/context/resume-info-provider";
import { toast } from "@/hooks/use-toast";

const AttentionHeatmap = () => {
  const { resumeInfo } = useResumeContext();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  const [zones, setZones] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchHeatmap = async () => {
    if (!resumeInfo) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/mind-reader", {
        method: "POST",
        body: JSON.stringify({ resumeData: resumeInfo }),
      });
      const data = await res.json();
      if (data.hotZones) {
        setZones(data.hotZones);
        setActive(true);
        toast({
          title: "Heatmap Generated!",
          description: "Recruiter attention areas are now visible.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Heatmap Failed",
        description: "Could not generate attention map.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (active && zones.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Heatmap
      zones.forEach((zone) => {
        const x = (zone.x / 100) * canvas.width;
        const y = (zone.y / 100) * canvas.height;
        const radius = 60 * zone.intensity;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(239, 68, 68, ${zone.intensity * 0.4})`);
        gradient.addColorStop(1, "rgba(239, 68, 68, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "10px Inter, sans-serif";
        ctx.fillText(zone.label, x - 20, y);
      });
    }
  }, [active, zones]);

  return (
    <div className="relative group">
      <Button
        onClick={() => (active ? setActive(false) : fetchHeatmap())}
        disabled={loading}
        variant="ghost"
        size="icon"
        className={`w-8 h-8 rounded-lg transition-all ${
          active ? "bg-red-500/20 text-red-500 shadow-inner" : "text-slate-400 hover:text-white"
        }`}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Eye size={16} />
        )}
      </Button>

      {/* Overlay Canvas */}
      {active && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
             <div className="relative w-[850px] aspect-[1/1.414] bg-transparent">
                <canvas 
                    ref={canvasRef}
                    width={850}
                    height={1202}
                    className="w-full h-full"
                />
                <div className="absolute top-4 left-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl pointer-events-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={16} className="text-amber-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Mind-Reader Active</h3>
                    </div>
                    <p className="text-[10px] opacity-70 leading-relaxed max-w-[150px]">
                        Red zones indicate high recruiter saliency. Focus your strongest content here.
                    </p>
                    <Button 
                        onClick={() => setActive(false)}
                        variant="outline" 
                        size="sm" 
                        className="mt-4 w-full h-8 text-[10px] font-bold border-white/20 hover:bg-white/10 text-white"
                    >
                        Close Analysis
                    </Button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default AttentionHeatmap;
