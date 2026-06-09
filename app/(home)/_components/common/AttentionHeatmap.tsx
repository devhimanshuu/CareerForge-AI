"use client";

import React, { useEffect, useRef, useState } from "react";
import { Eye, Loader2, RefreshCcw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeContext } from "@/context/resume-info-provider";
import { toast } from "@/hooks/use-toast";

type HeatmapZone = {
  x: number;
  y: number;
  intensity: number;
  label: string;
};

const AttentionHeatmap = () => {
  const { resumeInfo } = useResumeContext();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  const [zones, setZones] = useState<HeatmapZone[]>([]);
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null);
  const [settings, setSettings] = useState({
    opacity: 0.55,
    radius: 1,
    color: "#ef4444",
    showLabels: true,
    dimBackground: 0.35,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchHeatmap = async () => {
    if (!resumeInfo) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/mind-reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: resumeInfo }),
      });
      const data = await res.json();
      if (!res.ok || !data.hotZones) throw new Error(data.error || "Could not generate attention map");
      setZones(data.hotZones);
      setActive(true);
      toast({ title: "Recruiter Heatmap Ready", description: "The overlay is aligned to your live resume canvas." });
    } catch (error: any) {
      toast({ title: "Heatmap Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!active) return;
    const updateRect = () => {
      const preview = document.getElementById("resume-preview-id");
      if (preview) setPreviewRect(preview.getBoundingClientRect());
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!active || !previewRect || !canvas) return;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(previewRect.width * pixelRatio);
    canvas.height = Math.round(previewRect.height * pixelRatio);
    canvas.style.width = `${previewRect.width}px`;
    canvas.style.height = `${previewRect.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, previewRect.width, previewRect.height);

    const [red, green, blue] = hexToRgb(settings.color);
    zones.forEach((zone) => {
      const x = (zone.x / 100) * previewRect.width;
      const y = (zone.y / 100) * previewRect.height;
      const radius = Math.max(38, previewRect.width * 0.12) * settings.radius * Math.max(0.5, zone.intensity);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${settings.opacity * zone.intensity})`);
      gradient.addColorStop(0.5, `rgba(${red}, ${green}, ${blue}, ${settings.opacity * zone.intensity * 0.45})`);
      gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (settings.showLabels) {
        ctx.font = "600 11px Inter, sans-serif";
        const labelWidth = ctx.measureText(zone.label).width + 14;
        ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
        ctx.fillRect(x - 4, y - 20, labelWidth, 18);
        ctx.fillStyle = "white";
        ctx.fillText(zone.label, x + 3, y - 7);
      }
    });
  }, [active, previewRect, settings, zones]);

  return (
    <div className="relative group">
      <Button
        onClick={() => (active ? setActive(false) : fetchHeatmap())}
        disabled={loading}
        variant="ghost"
        size="icon"
        className={`w-8 h-8 rounded-lg transition-all ${active ? "bg-red-500/20 text-red-500 shadow-inner" : "text-slate-400 hover:text-white"}`}
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Eye size={16} />}
      </Button>

      {active && previewRect && (
        <div className="fixed inset-0 z-[100] pointer-events-none" style={{ backgroundColor: `rgba(2, 6, 23, ${settings.dimBackground})` }}>
          <canvas
            ref={canvasRef}
            className="fixed pointer-events-none ring-2 ring-white/20 shadow-2xl"
            style={{ left: previewRect.left, top: previewRect.top }}
          />
          <div className="pointer-events-auto fixed right-5 top-20 w-72 space-y-4 rounded-2xl border border-white/15 bg-slate-950/95 p-5 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-black"><Sparkles size={15} className="text-amber-400" /> Recruiter Mind-Reader</h3>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-400">Simulated saliency aligned to the live resume preview.</p>
              </div>
              <Button onClick={() => setActive(false)} variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10"><X size={14} /></Button>
            </div>

            <Control label="Heat intensity" value={settings.opacity} min={0.15} max={1} step={0.05} onChange={(opacity) => setSettings({ ...settings, opacity })} />
            <Control label="Zone radius" value={settings.radius} min={0.5} max={2} step={0.1} onChange={(radius) => setSettings({ ...settings, radius })} />
            <Control label="Background dim" value={settings.dimBackground} min={0} max={0.75} step={0.05} onChange={(dimBackground) => setSettings({ ...settings, dimBackground })} />

            <div className="flex items-center justify-between gap-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Heat color</label>
              <input type="color" value={settings.color} onChange={(event) => setSettings({ ...settings, color: event.target.value })} className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent" />
            </div>
            <label className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Show labels
              <input type="checkbox" checked={settings.showLabels} onChange={(event) => setSettings({ ...settings, showLabels: event.target.checked })} />
            </label>

            <Button onClick={fetchHeatmap} disabled={loading} variant="outline" className="w-full gap-2 border-white/15 bg-white/5 text-xs font-bold text-white hover:bg-white/10 hover:text-white">
              {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCcw size={13} />}
              Re-analyze Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const Control = ({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) => (
  <label className="block space-y-2">
    <span className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400"><span>{label}</span><span className="text-white">{value.toFixed(2)}</span></span>
    <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-red-500" />
  </label>
);

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

export default AttentionHeatmap;
