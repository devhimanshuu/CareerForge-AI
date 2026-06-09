"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  ClipboardCopy,
  Code2,
  Download,
  ExternalLink,
  Github,
  Lightbulb,
  Loader2,
  MessageSquare,
  Network,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  Briefcase,
  Clock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumPage, PremiumPageHeader, PremiumPanel, PremiumStatCard } from "@/components/ui/premium-page";
import useGetDocuments from "@/features/document/use-get-document";
import { toast } from "@/hooks/use-toast";

type Insight = {
  id: number;
  documentId?: string;
  type: string;
  title: string;
  summary: string;
  payload: any;
  status: string;
  createdAt: string;
};

const AutomationHub = () => {
  const { data: documentsResponse } = useGetDocuments();
  const documents = useMemo(() => documentsResponse?.data || [], [documentsResponse?.data]);
  const [documentId, setDocumentId] = useState("");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState("");
  const [optimizer, setOptimizer] = useState({ region: "Global", targetRole: "", cadence: "weekly", focus: "balanced" });
  const [networking, setNetworking] = useState({ company: "", targetRole: "", tone: "warm", goal: "recruiter_intro" });
  const [sync, setSync] = useState({ provider: "github", username: "", repoLimit: 6, includeForks: false });
  const [networkingKit, setNetworkingKit] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});

  const [netSchedule, setNetSchedule] = useState({ stages: ["applied", "interviewing", "offer", "rejected"] as string[], cadence: "daily" as "hourly" | "daily", enabled: false });
  const [netScheduleConfig, setNetScheduleConfig] = useState<any>(null);
  const [networkingOutputs, setNetworkingOutputs] = useState<any[]>([]);
  const [expandedNetworking, setExpandedNetworking] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<"agents" | "scraper" | "packages">("agents");
  const [scraper, setScraper] = useState({ source: "indeed", query: "", location: "", maxPages: 3 });
  const [scrapedJobs, setScrapedJobs] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [expandedPackage, setExpandedPackage] = useState<number | null>(null);

  useEffect(() => {
    if (!documentId && documents[0]?.documentId) setDocumentId(documents[0].documentId);
  }, [documents, documentId]);

  const loadWorkspace = async () => {
    const [insightResponse, commentResponse, snapshotResponse, configResponse, packagesResponse] = await Promise.all([
      fetch("/api/automation/insights"),
      fetch("/api/collaboration/all"),
      fetch("/api/automation/snapshots"),
      fetch("/api/automation/configs"),
      fetch("/api/automation/application-packages"),
    ]);
    if (insightResponse.ok) setInsights((await insightResponse.json()).insights || []);
    if (commentResponse.ok) setComments((await commentResponse.json()).comments || []);
    if (snapshotResponse.ok) setSnapshots((await snapshotResponse.json()).snapshots || []);
    if (configResponse.ok) {
      const configData = (await configResponse.json()).configs || [];
      setConfigs(configData);
      // Sync networking schedule state from existing config
      const netConfig = configData.find((c: any) => c.type === "networking");
      if (netConfig) {
        setNetScheduleConfig(netConfig);
        setNetSchedule({
          stages: netConfig.config?.stages || ["applied", "interviewing", "offer", "rejected"],
          cadence: netConfig.config?.cadence || "daily",
          enabled: netConfig.enabled !== false,
        });
      }
    }
    if (packagesResponse.ok) setPackages((await packagesResponse.json()).packages || []);
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  const runOptimizer = async () => {
    if (!documentId) return;
    setLoading("optimizer");
    try {
      const response = await fetch("/api/automation/optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, ...optimizer }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Optimizer failed");
      setInsights((current) => [...data.insights, ...current]);
      await loadWorkspace();
      toast({ title: "Optimizer Run Complete", description: data.marketSignal });
    } catch (error: any) {
      toast({ title: "Optimizer Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const buildNetworkingKit = async () => {
    if (!documentId || !networking.company || !networking.targetRole) return;
    setLoading("networking");
    try {
      const response = await fetch("/api/automation/networking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, ...networking }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Networking agent failed");
      setNetworkingKit(data.kit);
      setInsights((current) => [data.insight, ...current]);
    } catch (error: any) {
      toast({ title: "Networking Agent Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const runDeveloperSync = async () => {
    if (!sync.username) return;
    setLoading("sync");
    try {
      const response = await fetch("/api/automation/developer-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sync, documentId: documentId || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sync failed");
      setSyncResult(data);
      await loadWorkspace();
    } catch (error: any) {
      toast({ title: "Developer Sync Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const updateInsight = async (id: number, status: string) => {
    const response = await fetch(`/api/automation/insights/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) setInsights((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  };

  const applyInsight = async (id: number) => {
    const response = await fetch(`/api/automation/insights/${id}/apply`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      toast({ title: "Apply Failed", description: data.error || "This recommendation could not be applied.", variant: "destructive" });
      return;
    }
    setInsights((current) => current.map((item) => item.id === id ? { ...item, status: "completed" } : item));
    toast({ title: "Resume Updated", description: "The approved recommendation was applied safely." });
  };

  const updateComment = async (id: number, status: string) => {
    const response = await fetch(`/api/collaboration/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) setComments((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  };

  const replyToComment = async (id: number) => {
    const ownerReply = replyDrafts[id]?.trim();
    if (!ownerReply) return;
    const response = await fetch(`/api/collaboration/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerReply, status: "resolved" }),
    });
    if (response.ok) {
      const data = await response.json();
      setComments((current) => current.map((item) => item.id === id ? { ...item, ...data.comment } : item));
      setReplyDrafts((current) => ({ ...current, [id]: "" }));
    }
  };

  const deleteComment = async (id: number) => {
    const response = await fetch(`/api/collaboration/${id}`, { method: "DELETE" });
    if (response.ok) setComments((current) => current.filter((item) => item.id !== id));
  };

  const toggleConfig = async (id: number, enabled: boolean) => {
    const response = await fetch(`/api/automation/configs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    if (response.ok) setConfigs((current) => current.map((config) => config.id === id ? { ...config, enabled } : config));
  };

  const deleteConfig = async (id: number) => {
    const response = await fetch(`/api/automation/configs/${id}`, { method: "DELETE" });
    if (response.ok) setConfigs((current) => current.filter((config) => config.id !== id));
  };

  const runScraper = async () => {
    if (!scraper.query) return;
    setLoading("scraper");
    try {
      const response = await fetch("/api/automation/scrape-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scraper),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Scraper failed");
      setScrapedJobs(data.jobs || []);
      toast({ title: "Scan Complete", description: `Found ${data.jobs?.length || 0} jobs` });
    } catch (error: any) {
      toast({ title: "Scraper Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const generatePackage = async (job: any) => {
    if (!documentId) {
      toast({ title: "Select a resume first", variant: "destructive" });
      return;
    }
    setLoading(`package-${job.url}`);
    try {
      const response = await fetch("/api/automation/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeDocumentId: documentId,
          jobDescription: job.description,
          jobTitle: job.title,
          company: job.company,
          jobUrl: job.url,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Auto-apply failed");
      setPackages((current) => [data.package, ...current]);
      toast({ title: "Package Generated", description: `Match score: ${data.package.matchScore}%` });
    } catch (error: any) {
      toast({ title: "Package Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const updatePackageStatus = async (id: number, status: string) => {
    const response = await fetch(`/api/automation/application-packages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      setPackages((current) => current.map((pkg) => pkg.id === id ? { ...pkg, status } : pkg));
    }
  };

  const openInsights = useMemo(() => insights.filter((item) => item.status === "new").length, [insights]);
  const openComments = useMemo(() => comments.filter((item) => item.status === "open").length, [comments]);

  // Derive auto-generated networking outputs from insights
  useEffect(() => {
    setNetworkingOutputs(
      insights
        .filter((i) => i.type === "networking" && i.payload?.scheduled)
        .map((i) => ({ ...i, reviewStatus: i.payload?.reviewStatus || "pending" }))
    );
  }, [insights]);

  const toggleNetworkingSchedule = async () => {
    if (!documentId) return;
    setLoading("networking-schedule");
    try {
      const response = await fetch("/api/automation/networking-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, stages: netSchedule.stages, cadence: netSchedule.cadence }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to configure networking schedule");
      setNetSchedule((prev) => ({ ...prev, enabled: true }));
      await loadWorkspace();
      toast({ title: "Auto-Networking Enabled", description: `Will check ${netSchedule.cadence} for stage changes.` });
    } catch (error: any) {
      toast({ title: "Schedule Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const handleManualNetworkingGenerate = async (company: string, role: string, stage: string) => {
    setLoading("networking-generate");
    try {
      const response = await fetch("/api/automation/networking-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, stage, resumeContext: undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate networking outreach");
      setInsights((current) => [data.insight, ...current]);
      toast({ title: "Networking Generated", description: `Outreach for ${company} — ${stage}` });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const updateNetworkingReviewStatus = async (insightId: number, reviewStatus: string) => {
    // We update the insight payload to include the reviewStatus
    const insight = insights.find((i) => i.id === insightId);
    if (!insight) return;
    const updatedPayload = { ...insight.payload, reviewStatus };
    // Use the insight update endpoint — store reviewStatus in payload via a PATCH won't work directly,
    // so we mark the insight status to reflect review
    if (reviewStatus === "approved") {
      await updateInsight(insightId, "accepted");
    } else if (reviewStatus === "used") {
      await updateInsight(insightId, "completed");
    }
    setNetworkingOutputs((current) =>
      current.map((o) => o.id === insightId ? { ...o, reviewStatus } : o)
    );
  };

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Agent Operations"
        title="Automation Hub"
        description="Configure your proactive career agents, inspect their evidence, and approve only the actions you want."
        icon={<Bot size={13} />}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline" className="gap-2"><Link href="/dashboard/applications"><Target size={14} /> Job Tracker</Link></Button>
            <Button onClick={loadWorkspace} variant="outline" size="icon"><RefreshCw size={15} /></Button>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <PremiumStatCard icon={<Lightbulb size={18} />} label="New Agent Insights" value={openInsights} detail="Awaiting approval" tone="indigo" />
        <PremiumStatCard icon={<MessageSquare size={18} />} label="Open Review Notes" value={openComments} detail="From shared portfolios" tone="amber" />
        <PremiumStatCard icon={<Code2 size={18} />} label="Live Integrations" value={snapshots.length} detail="Saved profile snapshots" tone="emerald" />
      </div>

      <PremiumPanel className="mb-6 p-5">
        <label className="block max-w-xl space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active resume context</span>
          <select value={documentId} onChange={(event) => setDocumentId(event.target.value)} className="h-11 w-full rounded-lg border bg-background px-3 text-sm font-bold">
            <option value="">Choose a resume</option>
            {documents.map((document: any) => <option key={document.documentId} value={document.documentId}>{document.title}</option>)}
          </select>
        </label>
      </PremiumPanel>

      <div className="mb-6 flex gap-2">
        <TabButton active={activeTab === "agents"} onClick={() => setActiveTab("agents")} icon={<Bot size={14} />} label="Agents" />
        <TabButton active={activeTab === "scraper"} onClick={() => setActiveTab("scraper")} icon={<Search size={14} />} label="Job Scraper" />
        <TabButton active={activeTab === "packages"} onClick={() => setActiveTab("packages")} icon={<Briefcase size={14} />} label="Auto-Apply Packages" count={packages.length} />
      </div>

      {activeTab === "agents" && (
      <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <PremiumPanel className="space-y-5 p-6">
          <AgentHeading icon={<Sparkles size={18} />} title="Background Optimizer" description="Generate market-aware update proposals without changing facts." />
          <Input placeholder="Target role override (optional)" value={optimizer.targetRole} onChange={(event) => setOptimizer({ ...optimizer, targetRole: event.target.value })} />
          <Input placeholder="Market region" value={optimizer.region} onChange={(event) => setOptimizer({ ...optimizer, region: event.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField value={optimizer.focus} onChange={(focus) => setOptimizer({ ...optimizer, focus })} options={["balanced", "ats", "impact", "skills"]} />
            <SelectField value={optimizer.cadence} onChange={(cadence) => setOptimizer({ ...optimizer, cadence })} options={["manual", "weekly", "monthly"]} />
          </div>
          <Button onClick={runOptimizer} disabled={loading === "optimizer" || !documentId} className="w-full gap-2 bg-indigo-600 text-white hover:bg-indigo-700">
            {loading === "optimizer" ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} Run Optimizer
          </Button>
        </PremiumPanel>

        <PremiumPanel className="space-y-5 p-6">
          <AgentHeading icon={<Network size={18} />} title="Networking Agent" description="Research a company and draft personalized, honest outreach." />
          <Input placeholder="Target company" value={networking.company} onChange={(event) => setNetworking({ ...networking, company: event.target.value })} />
          <Input placeholder="Target role" value={networking.targetRole} onChange={(event) => setNetworking({ ...networking, targetRole: event.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField value={networking.tone} onChange={(tone) => setNetworking({ ...networking, tone })} options={["warm", "direct", "executive", "curious"]} />
            <SelectField value={networking.goal} onChange={(goal) => setNetworking({ ...networking, goal })} options={["recruiter_intro", "referral", "informational", "follow_up"]} />
          </div>
          <Button onClick={buildNetworkingKit} disabled={loading === "networking" || !documentId} className="w-full gap-2 bg-violet-600 text-white hover:bg-violet-700">
            {loading === "networking" ? <Loader2 size={15} className="animate-spin" /> : <Network size={15} />} Build Outreach Kit
          </Button>
        </PremiumPanel>

        <PremiumPanel className="space-y-5 p-6">
          <AgentHeading icon={<Github size={18} />} title="Live Developer Sync" description="Create a server-side snapshot from GitHub or LeetCode." />
          <div className="grid grid-cols-2 gap-3">
            <SelectField value={sync.provider} onChange={(provider) => setSync({ ...sync, provider })} options={["github", "leetcode"]} />
            <Input type="number" min={1} max={20} disabled={sync.provider !== "github"} value={sync.repoLimit} onChange={(event) => setSync({ ...sync, repoLimit: Number(event.target.value) })} />
          </div>
          <Input placeholder={`${sync.provider} username`} value={sync.username} onChange={(event) => setSync({ ...sync, username: event.target.value })} />
          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input type="checkbox" checked={sync.includeForks} disabled={sync.provider !== "github"} onChange={(event) => setSync({ ...sync, includeForks: event.target.checked })} />
            Include forked repositories
          </label>
          <Button onClick={runDeveloperSync} disabled={loading === "sync" || !sync.username} className="w-full gap-2 bg-slate-950 text-white hover:bg-slate-800">
            {loading === "sync" ? <Loader2 size={15} className="animate-spin" /> : <Code2 size={15} />} Sync Profile
          </Button>
        </PremiumPanel>
      </div>

      {/* Networking Schedule */}
      <PremiumPanel className="mt-6 p-6">
        <AgentHeading icon={<Clock size={18} />} title="Auto-Networking Schedule" description="Configure which application stages automatically trigger networking outreach." />
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stage Triggers</p>
            {["applied", "interviewing", "offer", "rejected"].map((stage) => (
              <label key={stage} className="flex items-center gap-3 text-sm font-semibold capitalize">
                <input
                  type="checkbox"
                  checked={netSchedule.stages.includes(stage)}
                  onChange={(e) => {
                    setNetSchedule((prev) => ({
                      ...prev,
                      stages: e.target.checked
                        ? [...prev.stages, stage]
                        : prev.stages.filter((s) => s !== stage),
                    }));
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                {stage}
              </label>
            ))}
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Check Cadence</p>
            <SelectField value={netSchedule.cadence} onChange={(cadence) => setNetSchedule((prev) => ({ ...prev, cadence: cadence as "hourly" | "daily" }))} options={["hourly", "daily"]} />
            <div className="mt-4 space-y-2">
              <Button
                onClick={toggleNetworkingSchedule}
                disabled={loading === "networking-schedule" || !documentId || netSchedule.stages.length === 0}
                className="w-full gap-2 bg-violet-600 text-white hover:bg-violet-700"
              >
                {loading === "networking-schedule" ? <Loader2 size={15} className="animate-spin" /> : <Network size={15} />}
                {netSchedule.enabled ? "Update Schedule" : "Enable Auto-Networking"}
              </Button>
              {netSchedule.enabled && netScheduleConfig && (
                <Button onClick={() => toggleConfig(netScheduleConfig.id, false)} variant="outline" size="sm" className="w-full gap-2 text-[10px] font-bold">
                  <X size={12} /> Disable
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Schedule Status</p>
            {netScheduleConfig ? (
              <div className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${netSchedule.enabled ? "bg-emerald-500" : "bg-slate-400"}`} />
                  <span className="text-xs font-bold">{netSchedule.enabled ? "Active" : "Paused"}</span>
                </div>
                {netScheduleConfig.lastRunAt && (
                  <p className="text-[10px] text-muted-foreground">
                    Last run: {new Date(netScheduleConfig.lastRunAt).toLocaleString()}
                  </p>
                )}
                {netScheduleConfig.nextRunAt && (
                  <p className="text-[10px] text-muted-foreground">
                    Next run: {new Date(netScheduleConfig.nextRunAt).toLocaleString()}
                  </p>
                )}
                <p className="text-[10px] font-semibold text-violet-600">
                  Stages: {netSchedule.stages.join(", ")}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                Not configured yet. Enable auto-networking to start.
              </div>
            )}
          </div>
        </div>
      </PremiumPanel>

      {(networkingKit || syncResult) && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {networkingKit && <ResultPanel title="Latest Outreach Kit" data={networkingKit} />}
          {syncResult && <ResultPanel title={`${syncResult.provider} Snapshot`} data={syncResult.data} />}
        </div>
      )}

      {/* Auto-Generated Networking Outputs */}
      {networkingOutputs.length > 0 && (
        <PremiumPanel className="mt-6 p-6">
          <AgentHeading icon={<Mail size={18} />} title="Auto-Generated Networking" description="Outreach messages generated automatically from cron runs based on application stage changes." />
          <div className="mt-5 space-y-3">
            {networkingOutputs.map((output) => (
              <div key={output.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[9px] font-black uppercase tracking-widest text-violet-500">networking</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${stageBadgeColor(output.payload?.stage)}`}>
                        {output.payload?.stage}
                      </span>
                      <NetworkingReviewBadge status={output.reviewStatus} />
                    </div>
                    <h3 className="mt-1 text-sm font-black">{output.payload?.company} — {output.payload?.role}</h3>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button onClick={() => setExpandedNetworking(expandedNetworking === output.id ? null : output.id)} variant="outline" size="icon" className="h-8 w-8">
                      {expandedNetworking === output.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </Button>
                  </div>
                </div>

                {expandedNetworking === output.id && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    {output.payload?.messages?.map((msg: any, idx: number) => (
                      <div key={idx} className="rounded-lg bg-slate-950 p-4 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-black uppercase tracking-widest text-violet-400">{msg.type?.replaceAll("_", " ")}</span>
                          <span className="text-[9px] font-bold text-slate-400">via {msg.channel}</span>
                          {msg.subject && <span className="text-[10px] font-semibold text-indigo-300">— {msg.subject}</span>}
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-200 whitespace-pre-wrap">{msg.body}</p>
                        <p className="text-[9px] font-bold text-amber-400">⏱ {msg.timing}</p>
                        <Button
                          onClick={() => { navigator.clipboard.writeText(msg.body); toast({ title: "Copied" }); }}
                          size="sm" variant="outline"
                          className="gap-1 text-[10px] font-bold text-slate-300"
                        >
                          <ClipboardCopy size={12} /> Copy
                        </Button>
                      </div>
                    ))}

                    {output.payload?.recruiterTargets?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Recruiter Search Strategies</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {output.payload.recruiterTargets.map((target: string, i: number) => (
                            <li key={i} className="text-[11px] text-muted-foreground">{target}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {output.payload?.tips?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Tips</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {output.payload.tips.map((tip: string, i: number) => (
                            <li key={i} className="text-[11px] text-muted-foreground">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {output.reviewStatus === "pending" && (
                        <Button onClick={() => updateNetworkingReviewStatus(output.id, "approved")} size="sm" className="gap-1 text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700">
                          <Check size={12} /> Approve
                        </Button>
                      )}
                      {output.reviewStatus === "approved" && (
                        <Button onClick={() => updateNetworkingReviewStatus(output.id, "used")} size="sm" className="gap-1 text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700">
                          <Check size={12} /> Mark Used
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </PremiumPanel>
      )}

      {configs.length > 0 && (
        <PremiumPanel className="mt-6 p-6">
          <AgentHeading icon={<RefreshCw size={18} />} title="Active Background Schedules" description="Pause or remove recurring optimizer runs at any time." />
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {configs.map((config) => (
              <div key={config.id} className="flex items-center justify-between gap-4 rounded-xl border p-4">
                <div>
                  <p className="text-sm font-black capitalize">{config.type} · {config.config?.cadence}</p>
                  <p className="mt-1 text-[10px] font-semibold text-muted-foreground">Next run: {new Date(config.nextRunAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => toggleConfig(config.id, !config.enabled)} size="sm" variant="outline" className="text-[10px] font-bold">{config.enabled ? "Pause" : "Resume"}</Button>
                  <Button onClick={() => deleteConfig(config.id)} size="icon" variant="outline" className="h-8 w-8 text-rose-500"><X size={13} /></Button>
                </div>
              </div>
            ))}
          </div>
        </PremiumPanel>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PremiumPanel className="p-6">
          <AgentHeading icon={<Lightbulb size={18} />} title="Agentic Insights" description="Approve, dismiss, or complete generated recommendations." />
          <div className="mt-5 space-y-3">
            {insights.length === 0 && <EmptyState text="Run an optimizer or networking agent to create insights." />}
            {insights.slice(0, 12).map((insight) => (
              <div key={insight.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{insight.type} · {insight.status}</p>
                    <h3 className="mt-1 text-sm font-black">{insight.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{insight.summary}</p>
                    {insight.payload?.suggestedUpdate && <p className="mt-3 rounded-lg bg-indigo-500/5 p-3 text-xs font-semibold">{insight.payload.suggestedUpdate}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button onClick={() => insight.payload?.patch && insight.payload.patch.kind !== "none" ? applyInsight(insight.id) : updateInsight(insight.id, "accepted")} variant="outline" size="icon" className="h-8 w-8 text-emerald-500"><Check size={13} /></Button>
                    <Button onClick={() => updateInsight(insight.id, "dismissed")} variant="outline" size="icon" className="h-8 w-8 text-rose-500"><X size={13} /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PremiumPanel>

        <PremiumPanel className="p-6">
          <AgentHeading icon={<MessageSquare size={18} />} title="Recruiter Review Inbox" description="Resolve inline feedback from public review links." />
          <div className="mt-5 space-y-3">
            {comments.length === 0 && <EmptyState text="Publish a portfolio link and ask a reviewer to leave feedback." />}
            {comments.slice(0, 12).map((comment) => (
              <div key={comment.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-violet-500">{comment.documentTitle} · {comment.sectionId}</p>
                    <h3 className="mt-1 text-sm font-black">{comment.reviewerName}</h3>
                    {comment.selectedText && <p className="mt-2 border-l-2 border-violet-500 pl-2 text-[10px] italic text-muted-foreground">{comment.selectedText}</p>}
                    <p className="mt-2 text-xs leading-relaxed">{comment.content}</p>
                    {comment.ownerReply && (
                      <p className="mt-3 rounded-lg bg-emerald-500/5 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        Your reply: {comment.ownerReply}
                      </p>
                    )}
                    {comment.status === "open" && (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <Input
                          value={replyDrafts[comment.id] || ""}
                          onChange={(event) => setReplyDrafts((current) => ({ ...current, [comment.id]: event.target.value }))}
                          placeholder="Reply to reviewer..."
                          className="text-xs"
                        />
                        <Button onClick={() => replyToComment(comment.id)} variant="outline" size="sm" className="gap-1 text-[10px] font-bold text-emerald-500">
                          <Check size={12} /> Reply
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {comment.status === "open" && <Button onClick={() => updateComment(comment.id, "resolved")} variant="outline" size="sm" className="gap-1 text-[10px] font-bold text-emerald-500"><Check size={12} /> Resolve</Button>}
                    <Button onClick={() => deleteComment(comment.id)} variant="outline" size="sm" className="gap-1 text-[10px] font-bold text-rose-500"><X size={12} /> Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PremiumPanel>
      </div>
      </>
      )}

      {activeTab === "scraper" && (
        <div className="space-y-6">
          <PremiumPanel className="p-6">
            <AgentHeading icon={<Search size={18} />} title="Job Scraper" description="Scan job boards and discover opportunities matching your criteria." />
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              <Input placeholder="Search query (e.g. React Developer)" value={scraper.query} onChange={(e) => setScraper({ ...scraper, query: e.target.value })} />
              <Input placeholder="Location (optional)" value={scraper.location} onChange={(e) => setScraper({ ...scraper, location: e.target.value })} />
              <SelectField value={scraper.source} onChange={(source) => setScraper({ ...scraper, source })} options={["indeed", "linkedin", "custom"]} />
              <Input type="number" min={1} max={20} value={scraper.maxPages} onChange={(e) => setScraper({ ...scraper, maxPages: Number(e.target.value) })} />
            </div>
            <Button onClick={runScraper} disabled={loading === "scraper" || !scraper.query} className="mt-4 w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
              {loading === "scraper" ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Scan Now
            </Button>
          </PremiumPanel>

          {scrapedJobs.length > 0 && (
            <PremiumPanel className="p-6">
              <AgentHeading icon={<Globe size={18} />} title="Scan Results" description={`Found ${scrapedJobs.length} jobs`} />
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                {scrapedJobs.map((job, idx) => (
                  <div key={idx} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{job.source}</p>
                        <h3 className="mt-1 text-sm font-black">{job.title}</h3>
                        <p className="text-xs font-semibold text-muted-foreground">{job.company} · {job.location}</p>
                        {job.salary && <p className="text-[10px] text-emerald-600 font-bold">{job.salary}</p>}
                        <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">{job.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => generatePackage(job)} disabled={loading === `package-${job.url}` || !documentId} size="sm" className="gap-1 text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700">
                        {loading === `package-${job.url}` ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Generate Package
                      </Button>
                      <Button asChild size="sm" variant="outline" className="gap-1 text-[10px] font-bold">
                        <a href={job.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} /> View</a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumPanel>
          )}
        </div>
      )}

      {activeTab === "packages" && (
        <div className="space-y-6">
          <PremiumPanel className="p-6">
            <AgentHeading icon={<Briefcase size={18} />} title="Auto-Apply Packages" description="Review and manage your tailored application packages." />
            <div className="mt-5 space-y-3">
              {packages.length === 0 && <EmptyState text="No packages yet. Use the Job Scraper to generate application packages." />}
              {packages.map((pkg) => (
                <div key={pkg.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{pkg.company}</p>
                        <StatusBadge status={pkg.status} />
                        {pkg.matchScore !== null && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pkg.matchScore >= 70 ? "bg-emerald-100 text-emerald-700" : pkg.matchScore >= 40 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                            {pkg.matchScore}% match
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 text-sm font-black">{pkg.jobTitle}</h3>
                      <p className="mt-1 text-[10px] text-muted-foreground">{pkg.jobUrl && <a href={pkg.jobUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{pkg.jobUrl}</a>}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button onClick={() => setExpandedPackage(expandedPackage === pkg.id ? null : pkg.id)} variant="outline" size="icon" className="h-8 w-8">
                        {expandedPackage === pkg.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </Button>
                    </div>
                  </div>

                  {expandedPackage === pkg.id && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      {pkg.tailoredSummary && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Tailored Summary</p>
                          <p className="text-xs leading-relaxed">{pkg.tailoredSummary}</p>
                        </div>
                      )}
                      {pkg.coverLetter && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Cover Letter</p>
                          <div className="rounded-lg bg-slate-950 p-4 text-[11px] leading-relaxed text-slate-200 whitespace-pre-wrap">{pkg.coverLetter}</div>
                          <div className="mt-2 flex gap-2">
                            <Button onClick={() => { navigator.clipboard.writeText(pkg.coverLetter); toast({ title: "Copied" }); }} size="sm" variant="outline" className="gap-1 text-[10px] font-bold">
                              <ClipboardCopy size={12} /> Copy
                            </Button>
                            <Button onClick={() => {
                              const blob = new Blob([`Job: ${pkg.jobTitle}\nCompany: ${pkg.company}\nMatch: ${pkg.matchScore}%\n\nSummary:\n${pkg.tailoredSummary || ""}\n\nCover Letter:\n${pkg.coverLetter}\n\nCommon Answers:\n${(pkg.commonAnswers || []).map((a: any) => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n")}\n\nGaps:\n${(pkg.gaps || []).join("\n")}`], { type: "text/plain" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a"); a.href = url; a.download = `${pkg.company}-${pkg.jobTitle}-package.txt`.replace(/\s+/g, "-"); a.click(); URL.revokeObjectURL(url);
                            }} size="sm" variant="outline" className="gap-1 text-[10px] font-bold">
                              <Download size={12} /> Download
                            </Button>
                          </div>
                        </div>
                      )}
                      {pkg.commonAnswers && pkg.commonAnswers.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Common Answers</p>
                          <div className="space-y-2">
                            {pkg.commonAnswers.map((a: any, i: number) => (
                              <div key={i} className="rounded-lg bg-indigo-500/5 p-3">
                                <p className="text-[10px] font-bold text-indigo-600">{a.question}</p>
                                <p className="mt-1 text-[11px] leading-relaxed">{a.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {pkg.gaps && pkg.gaps.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Identified Gaps</p>
                          <ul className="list-disc pl-4 text-[11px] text-muted-foreground">
                            {pkg.gaps.map((gap: string, i: number) => <li key={i}>{gap}</li>)}
                          </ul>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {pkg.status === "drafted" && <Button onClick={() => updatePackageStatus(pkg.id, "reviewed")} size="sm" className="gap-1 text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700"><Check size={12} /> Mark Reviewed</Button>}
                        {pkg.status === "reviewed" && <Button onClick={() => updatePackageStatus(pkg.id, "applied")} size="sm" className="gap-1 text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700"><Check size={12} /> Mark Applied</Button>}
                        {pkg.status !== "rejected" && <Button onClick={() => updatePackageStatus(pkg.id, "rejected")} size="sm" variant="outline" className="gap-1 text-[10px] font-bold text-rose-500"><X size={12} /> Reject</Button>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </PremiumPanel>
        </div>
      )}
    </PremiumPage>
  );
};

const AgentHeading = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex items-start gap-3">
    <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">{icon}</div>
    <div><h2 className="font-black">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>
  </div>
);

const SelectField = ({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) => (
  <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-xs font-bold capitalize">
    {options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}
  </select>
);

const ResultPanel = ({ title, data }: { title: string; data: any }) => (
  <PremiumPanel className="p-6">
    <h2 className="mb-4 flex items-center gap-2 font-black"><ExternalLink size={16} className="text-indigo-500" /> {title}</h2>
    <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-[11px] leading-relaxed text-slate-200">{JSON.stringify(data, null, 2)}</pre>
  </PremiumPanel>
);

const EmptyState = ({ text }: { text: string }) => <p className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">{text}</p>;

const TabButton = ({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
      active ? "bg-indigo-600 text-white" : "bg-background border text-muted-foreground hover:text-foreground"
    }`}
  >
    {icon}
    {label}
    {count !== undefined && count > 0 && (
      <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? "bg-white text-indigo-600" : "bg-indigo-100 text-indigo-600"}`}>
        {count}
      </span>
    )}
  </button>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    drafted: "bg-slate-100 text-slate-700",
    reviewed: "bg-amber-100 text-amber-700",
    applied: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${colors[status] || "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
};

const stageBadgeColor = (stage?: string) => {
  const map: Record<string, string> = {
    applied: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    interviewing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    offer: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  };
  return map[stage || ""] || "bg-slate-100 text-slate-700";
};

const NetworkingReviewBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    used: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${map[status] || map.pending}`}>
      {status}
    </span>
  );
};

export default AutomationHub;
