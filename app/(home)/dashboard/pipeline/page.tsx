"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Workflow,
  Settings,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Bot,
  RefreshCw,
  Loader2,
  CheckCircle2,
  X,
  Mail,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumPage, PremiumPageHeader, PremiumPanel } from "@/components/ui/premium-page";
import { ApiKeyBanner } from "@/components/ui/api-key-banner";
import useGetDocuments from "@/features/document/use-get-document";
import { toast } from "@/hooks/use-toast";

type PackageStatus = "scraped" | "tailored" | "reviewed" | "applied" | "follow_up" | "rejected";

interface ApplicationPackage {
  id: number;
  company: string;
  jobTitle: string;
  jobUrl?: string;
  status: PackageStatus;
  matchScore?: number;
  tailoredSummary?: string;
}

const PIPELINE_STAGES: { id: PackageStatus; label: string; icon: any; color: string }[] = [
  { id: "scraped", label: "Scraped (Inbox)", icon: Search, color: "text-slate-500" },
  { id: "tailored", label: "Tailored (Review)", icon: Bot, color: "text-indigo-500" },
  { id: "reviewed", label: "Reviewed (Ready)", icon: CheckCircle2, color: "text-emerald-500" },
  { id: "applied", label: "Applied", icon: Mail, color: "text-blue-500" },
  { id: "follow_up", label: "Follow-up", icon: RefreshCw, color: "text-violet-500" },
];

export default function PipelineDashboard() {
  const { data: documentsResponse } = useGetDocuments();
  const documents = useMemo(() => documentsResponse?.data || [], [documentsResponse?.data]);
  const [documentId, setDocumentId] = useState("");

  const [packages, setPackages] = useState<ApplicationPackage[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  
  const [pipelineConfig, setPipelineConfig] = useState({
    query: "",
    location: "",
    source: "indeed",
    cadence: "daily" as "daily" | "weekly",
  });

  const activePipelineConfig = useMemo(() => configs.find((c) => c.type === "pipeline"), [configs]);

  useEffect(() => {
    if (!documentId && documents[0]?.documentId) setDocumentId(documents[0].documentId);
  }, [documents, documentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [packagesRes, configsRes] = await Promise.all([
        fetch("/api/automation/application-packages"),
        fetch("/api/automation/configs"),
      ]);
      if (packagesRes.ok) {
        const data = await packagesRes.json();
        setPackages(data.packages || []);
      }
      if (configsRes.ok) {
        const data = await configsRes.json();
        setConfigs(data.configs || []);
        const active = data.configs.find((c: any) => c.type === "pipeline");
        if (active && active.config) {
          const parsed = typeof active.config === "string" ? JSON.parse(active.config) : active.config;
          setPipelineConfig({
            query: parsed.query || "",
            location: parsed.location || "",
            source: parsed.source || "indeed",
            cadence: parsed.cadence || "daily",
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: number, status: PackageStatus) => {
    const response = await fetch(`/api/automation/application-packages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      setPackages((curr) => curr.map((p) => p.id === id ? { ...p, status } : p));
      toast({ title: "Moved", description: `Job moved to ${status}` });
    }
  };

  const handleSaveConfig = async () => {
    if (!documentId || !pipelineConfig.query) {
      toast({ title: "Missing Fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/automation/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, ...pipelineConfig }),
      });
      if (response.ok) {
        toast({ title: "Pipeline Activated", description: "Your automated job pipeline is running." });
        setSetupMode(false);
        await loadData();
      } else {
        const data = await response.json();
        toast({ title: "Setup Failed", description: data.error, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
    const cols: Record<PackageStatus, ApplicationPackage[]> = {
      scraped: [], tailored: [], reviewed: [], applied: [], follow_up: [], rejected: []
    };
    packages.forEach(pkg => {
      if (cols[pkg.status]) cols[pkg.status].push(pkg);
    });
    return cols;
  }, [packages]);

  return (
    <PremiumPage>
      <ApiKeyBanner className="mb-6" />
      <PremiumPageHeader
        eyebrow="Set & Forget"
        title="Job Pipeline"
        description="A fully automated pipeline that discovers, tailors, and stages job applications for you."
        icon={<Workflow size={13} />}
        action={
          <div className="flex gap-2">
            {activePipelineConfig && (
              <Button onClick={() => setSetupMode(!setupMode)} variant="outline" className="gap-2">
                <Settings size={14} /> Configure
              </Button>
            )}
            <Button onClick={loadData} variant="outline" size="icon" disabled={loading}>
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        }
      />

      {(!activePipelineConfig || setupMode) && (
        <PremiumPanel className="mb-8 p-6 bg-indigo-500/5 border-indigo-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-600">
              <Bot size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold">Pipeline Setup</h2>
              <p className="text-xs text-muted-foreground">Define your criteria once, and the system handles the rest.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Resume</span>
              <select value={documentId} onChange={(e) => setDocumentId(e.target.value)} className="h-10 w-full rounded-lg border bg-background px-3 text-xs font-semibold">
                <option value="">Select a Resume</option>
                {documents.map((doc: any) => <option key={doc.documentId} value={doc.documentId}>{doc.title}</option>)}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Job Search Query</span>
              <Input placeholder="e.g. React Developer" value={pipelineConfig.query} onChange={(e) => setPipelineConfig({ ...pipelineConfig, query: e.target.value })} className="h-10 text-xs" />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location (Optional)</span>
              <Input placeholder="e.g. Remote, New York" value={pipelineConfig.location} onChange={(e) => setPipelineConfig({ ...pipelineConfig, location: e.target.value })} className="h-10 text-xs" />
            </label>
            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source</span>
              <select value={pipelineConfig.source} onChange={(e) => setPipelineConfig({ ...pipelineConfig, source: e.target.value })} className="h-10 w-full rounded-lg border bg-background px-3 text-xs font-semibold">
                <option value="indeed">Indeed</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveConfig} disabled={loading || !pipelineConfig.query || !documentId} className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {activePipelineConfig ? "Save Configuration" : "Activate Pipeline"}
            </Button>
            {setupMode && activePipelineConfig && (
              <Button onClick={() => setSetupMode(false)} variant="ghost" className="text-xs">Cancel</Button>
            )}
          </div>
        </PremiumPanel>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-250px)] min-h-[500px]">
        {PIPELINE_STAGES.map((stage, index) => {
          const StageIcon = stage.icon;
          const stagePackages = columns[stage.id] || [];
          const nextStage = PIPELINE_STAGES[index + 1]?.id;
          const prevStage = PIPELINE_STAGES[index - 1]?.id;

          return (
            <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-border/50">
              <div className="p-4 border-b border-border/50 flex items-center justify-between sticky top-0 bg-inherit rounded-t-2xl z-10">
                <div className="flex items-center gap-2">
                  <StageIcon size={16} className={stage.color} />
                  <h3 className="text-sm font-black">{stage.label}</h3>
                </div>
                <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full">{stagePackages.length}</span>
              </div>
              
              <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {stagePackages.length === 0 && (
                  <div className="text-center p-6 text-xs font-medium text-muted-foreground border-2 border-dashed rounded-xl">
                    No jobs here
                  </div>
                )}
                {stagePackages.map((pkg) => (
                  <div key={pkg.id} className="bg-background rounded-xl p-4 shadow-sm border border-border/50 hover:border-indigo-500/30 transition-all group">
                    <div className="mb-2 flex items-start justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 truncate pr-2">{pkg.company}</p>
                      {pkg.matchScore && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 ${pkg.matchScore >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {pkg.matchScore}%
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold leading-tight mb-2 line-clamp-2">{pkg.jobTitle}</h4>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                      {pkg.jobUrl ? (
                        <a href={pkg.jobUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] flex items-center gap-1 font-bold text-muted-foreground hover:text-indigo-500 transition-colors">
                          <ExternalLink size={12} /> View Job
                        </a>
                      ) : (
                        <span />
                      )}
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {prevStage && (
                          <button onClick={() => handleUpdateStatus(pkg.id, prevStage)} className="w-6 h-6 flex items-center justify-center rounded bg-muted hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground transition-colors" title={`Move to ${prevStage}`}>
                            <ChevronLeft size={12} />
                          </button>
                        )}
                        {nextStage && (
                          <button onClick={() => handleUpdateStatus(pkg.id, nextStage)} className="w-6 h-6 flex items-center justify-center rounded bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-colors" title={`Move to ${nextStage}`}>
                            <ChevronRight size={12} />
                          </button>
                        )}
                        <button onClick={() => handleUpdateStatus(pkg.id, "rejected")} className="w-6 h-6 flex items-center justify-center rounded hover:bg-rose-100 dark:hover:bg-rose-500/10 text-rose-500 transition-colors" title="Reject">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PremiumPage>
  );
}
