"use client";

import React, { useEffect, useState } from "react";
import { PremiumPage, PremiumPageHeader, PremiumPanel } from "@/components/ui/premium-page";
import { ApiKeyBanner } from "@/components/ui/api-key-banner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Linkedin, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  Target, 
  Wand2, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export default function LinkedinOptimizer() {
  const [docs, setDocs] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [loadingDocs, setLoadingDocs] = useState(true);
  
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("/api/document/all"); // Or reuse another doc fetcher
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setDocs(json.data);
            if (json.data.length > 0) setSelectedDoc(json.data[0].documentId);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDocs();
  }, []);

  const handleOptimize = async () => {
    if (!selectedDoc) return;
    setOptimizing(true);
    setResult(null);
    try {
      const res = await fetch("/api/linkedin-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDoc })
      });
      if (res.ok) {
        const json = await res.json();
        setResult(json.data);
      } else {
        const json = await res.json();
        throw new Error(json.error || `Optimization failed (${res.status})`);
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Optimization Failed", description: e.message || "Could not optimize LinkedIn profile. Please try again.", variant: "destructive" });
    } finally {
      setOptimizing(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <PremiumPage>
      <ApiKeyBanner className="mb-6" />
      <PremiumPageHeader
        eyebrow="Profile Growth"
        title="LinkedIn Optimizer"
        description="Convert your static resume into a magnetic LinkedIn profile optimized for recruiter search algorithms."
        icon={<Linkedin size={13} />}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Controls & Score */}
        <div className="space-y-6">
          <PremiumPanel className="p-6">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Wand2 size={16} className="text-blue-500" />
              Select Source Resume
            </h3>
            {loadingDocs ? (
              <div className="h-10 rounded-xl bg-muted/50 animate-pulse" />
            ) : (
              <Select value={selectedDoc} onValueChange={setSelectedDoc}>
                <SelectTrigger className="w-full rounded-xl bg-background border-border/50">
                  <SelectValue placeholder="Choose a resume" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {docs.map(d => (
                    <SelectItem key={d.documentId} value={d.documentId}>
                      {d.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Button 
              onClick={handleOptimize} 
              disabled={optimizing || !selectedDoc}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2"
            >
              {optimizing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {optimizing ? "Analyzing Profile..." : "Optimize Profile"}
            </Button>
          </PremiumPanel>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PremiumPanel className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="32" cy="32" r="28" className="stroke-blue-500/20" strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="32" cy="32" r="28" 
                        className="stroke-blue-600" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray="175" 
                        strokeDashoffset={175 - (175 * result.score) / 100} 
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-blue-700 dark:text-blue-400">
                      {result.score}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Profile Searchability</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Top {100 - result.score}% of candidates</p>
                  </div>
                </div>
                
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
                  <Target size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-200 leading-relaxed">
                    {result.tip}
                  </p>
                </div>
              </PremiumPanel>
            </motion.div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2">
          {!result && !optimizing && (
            <div className="h-full min-h-[400px] rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-center p-8 bg-muted/10">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <Linkedin size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Ready to stand out?</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Select a resume and click optimize. We&apos;ll generate a high-converting headline, an engaging about section, and punchy experience descriptions.
              </p>
            </div>
          )}

          {optimizing && (
            <div className="h-full min-h-[400px] rounded-3xl border border-border/50 flex flex-col items-center justify-center text-center p-8 bg-card shadow-sm">
              <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
              <h3 className="font-bold text-base mb-1">Analyzing Data</h3>
              <p className="text-xs text-muted-foreground">Cross-referencing with recruiter search algorithms...</p>
            </div>
          )}

          {result && !optimizing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Headline */}
              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Optimized Headline</h3>
                  <Button 
                    variant="ghost" size="sm" 
                    onClick={() => copyToClipboard(result.headline, "headline")}
                    className="h-8 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    {copiedSection === "headline" ? <CheckCircle2 size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                    {copiedSection === "headline" ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-base font-medium leading-relaxed">{result.headline}</p>
              </div>

              {/* About */}
              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About Section</h3>
                  <Button 
                    variant="ghost" size="sm" 
                    onClick={() => copyToClipboard(result.about, "about")}
                    className="h-8 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    {copiedSection === "about" ? <CheckCircle2 size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                    {copiedSection === "about" ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {result.about}
                </div>
              </div>

              {/* Experiences */}
              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience Rewrites</h3>
                </div>
                <div className="space-y-6">
                  {result.experiences.map((exp: any, i: number) => (
                    <div key={i} className="relative pl-4 border-l-2 border-blue-500/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm">{exp.role}</h4>
                          <p className="text-xs font-bold text-blue-600 mb-2">{exp.company}</p>
                        </div>
                        <Button 
                          variant="ghost" size="sm" 
                          onClick={() => copyToClipboard(exp.description, `exp-${i}`)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 shrink-0"
                        >
                          {copiedSection === `exp-${i}` ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {exp.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </PremiumPage>
  );
}
