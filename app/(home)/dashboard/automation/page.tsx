"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  Code2,
  ExternalLink,
  Github,
  Lightbulb,
  Loader2,
  MessageSquare,
  Network,
  RefreshCw,
  Sparkles,
  Target,
  X,
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

  useEffect(() => {
    if (!documentId && documents[0]?.documentId) setDocumentId(documents[0].documentId);
  }, [documents, documentId]);

  const loadWorkspace = async () => {
    const [insightResponse, commentResponse, snapshotResponse, configResponse] = await Promise.all([
      fetch("/api/automation/insights"),
      fetch("/api/collaboration/all"),
      fetch("/api/automation/snapshots"),
      fetch("/api/automation/configs"),
    ]);
    if (insightResponse.ok) setInsights((await insightResponse.json()).insights || []);
    if (commentResponse.ok) setComments((await commentResponse.json()).comments || []);
    if (snapshotResponse.ok) setSnapshots((await snapshotResponse.json()).snapshots || []);
    if (configResponse.ok) setConfigs((await configResponse.json()).configs || []);
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

  const openInsights = useMemo(() => insights.filter((item) => item.status === "new").length, [insights]);
  const openComments = useMemo(() => comments.filter((item) => item.status === "open").length, [comments]);

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

      {(networkingKit || syncResult) && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {networkingKit && <ResultPanel title="Latest Outreach Kit" data={networkingKit} />}
          {syncResult && <ResultPanel title={`${syncResult.provider} Snapshot`} data={syncResult.data} />}
        </div>
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

export default AutomationHub;
