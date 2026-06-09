"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Plus,
  MoreVertical,
  Calendar,
  Building2,
  ArrowRight,
  ChevronRight,
  LayoutGrid,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Loader,
  Loader2,
  Trash2,
  Bot,
  ExternalLink,
  GitBranch,
  Network,
  Save,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import useGetDocuments from "@/features/document/use-get-document";
import DeleteApplicationDialog from "./_components/DeleteApplicationDialog";
import InterviewPrepAssistant from "../../_components/common/InterviewPrepAssistant";
import SkillGapAnalyzer from "../../_components/common/SkillGapAnalyzer";
import { PremiumPage } from "@/components/ui/premium-page";



const STATUS_COLUMNS = [
  {
    id: "wishlist",
    label: "Wishlist",
    color: "bg-slate-500",
    icon: <Clock size={14} />,
  },
  {
    id: "applied",
    label: "Applied",
    color: "bg-blue-500",
    icon: <CheckCircle2 size={14} />,
  },
  {
    id: "interviewing",
    label: "Interviewing",
    color: "bg-amber-500",
    icon: <Calendar size={14} />,
  },
  {
    id: "offer",
    label: "Offer",
    color: "bg-emerald-500",
    icon: <Sparkles size={14} />,
  },
  {
    id: "rejected",
    label: "Rejected",
    color: "bg-rose-500",
    icon: <AlertCircle size={14} />,
  },
];

const JobTrackerPage = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Form State
  const [newJob, setNewJob] = useState({
    jobTitle: "",
    company: "",
    documentId: "",
    status: "wishlist",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<any>(null);
  const [fullResumeInfo, setFullResumeInfo] = useState<any>(null);
  const [isFetchingResume, setIsFetchingResume] = useState(false);

  const [activeResumeDetails, setActiveResumeDetails] = useState<any>(null);
  const [agentJobs, setAgentJobs] = useState<any[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<string | null>(null);
  const [appNotes, setAppNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [networkingLoading, setNetworkingLoading] = useState<number | null>(null);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [approvingJob, setApprovingJob] = useState("");
  const [preferences, setPreferences] = useState({
    targetRole: "",
    region: "Global",
    workMode: "any",
    seniority: "any level",
    maxResults: 5,
  });


  // Resume Data for linking
  const { data: resumeData } = useGetDocuments();
  const resumes = useMemo(() => resumeData?.data || [], [resumeData?.data]);

  useEffect(() => {
    const nextDocumentId = selectedResumeId || resumes[0]?.documentId;
    if (nextDocumentId) {
      if (!selectedResumeId) setSelectedResumeId(nextDocumentId);
      const fetchResume = async () => {
        try {
          const res = await fetch(`/api/document/${nextDocumentId}`);
          const json = await res.json();
          if (json.success) {
            setActiveResumeDetails(json.data);
          }
        } catch (error) {
          console.error("Failed to load active resume for agent search:", error);
        }
      };
      fetchResume();
    }
  }, [resumes, selectedResumeId]);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/application/all");
      const json = await res.json();
      if (json.success) setApplications(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (selectedApp?.documentId) {
      fetchFullResume(selectedApp.documentId);
    }
    setAppNotes(selectedApp?.notes || "");
  }, [selectedApp]);

  const fetchFullResume = async (docId: string) => {
    setIsFetchingResume(true);
    try {
      const res = await fetch(`/api/document/${docId}`);
      const json = await res.json();
      if (json.success) setFullResumeInfo(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingResume(false);
    }
  };

  const runJobAgent = async () => {
    setAgentLoading(true);
    setIsAgentOpen(true);
    try {
      const response = await fetch("/api/ai/job-hunter-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: activeResumeDetails || {},
          preferences,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Agent search failed");
      setAgentJobs(json.jobs || []);
    } catch (err: any) {
      console.error(err);
      setAgentJobs([]);
      toast({
        title: "Agent Search Failed",
        description: err.message || "No live job listings were found. Try broadening your search preferences.",
        variant: "destructive",
      });
    } finally {
      setAgentLoading(false);
    }
  };

  const saveApplicationNotes = async () => {
    if (!selectedApp) return;
    setSavingNotes(true);
    try {
      const response = await fetch(`/api/application/update/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: appNotes }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Failed to save notes");
      setApplications((current) => current.map((app) => app.id === selectedApp.id ? { ...app, notes: appNotes } : app));
      setSelectedApp((current: any) => current ? { ...current, notes: appNotes } : current);
      toast({ title: "Notes Saved", description: "Application notes were updated." });
    } catch (error: any) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    } finally {
      setSavingNotes(false);
    }
  };

  const draftNetworkingOutreach = async (app: any, event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (!app.documentId || !app.company) return;
    setNetworkingLoading(app.id);
    try {
      const response = await fetch("/api/automation/networking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: app.documentId,
          company: app.company,
          targetRole: app.jobTitle,
          tone: "warm",
          goal: "recruiter_intro",
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Networking agent failed");
      toast({
        title: "Outreach Kit Ready",
        description: `LinkedIn and email drafts for ${app.company} are in your Agent Hub.`,
      });
      window.location.href = "/dashboard/automation";
    } catch (error: any) {
      toast({ title: "Networking Failed", description: error.message, variant: "destructive" });
    } finally {
      setNetworkingLoading(null);
    }
  };

  const saveAgentJob = async (job: any) => {
    if (!activeResumeDetails?.documentId) return;
    try {
      const response = await fetch("/api/application/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: activeResumeDetails.documentId,
          jobTitle: job.title,
          company: job.company,
          status: "wishlist",
          notes: `${job.description}\n\nSource: ${job.url || "Agent discovery"}\nMatch score: ${job.score}%`,
        }),
      });
      const json = await response.json();
      if (json.success) {
        fetchApplications();
        toast({ title: "Saved to Tracker", description: `${job.title} at ${job.company} added to your pipeline.` });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const approveAgentJob = async (job: any) => {
    if (!activeResumeDetails?.documentId) return;
    const key = `${job.company}-${job.title}`;
    setApprovingJob(key);
    try {
      const branchResponse = await fetch(`/api/document/branch/${activeResumeDetails.documentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchName: `${job.company} - ${job.title}`.slice(0, 100) }),
      });
      const branchData = await branchResponse.json();
      if (!branchResponse.ok || !branchData.data?.documentId) throw new Error(branchData.error || "Could not create tailored resume branch");

      const applicationResponse = await fetch("/api/application/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: branchData.data.documentId,
          jobTitle: job.title,
          company: job.company,
          status: "wishlist",
          notes: `${job.description}\n\nSource: ${job.url || "Agent discovery"}\nMatch score: ${job.score}%`,
        }),
      });
      const applicationJson = await applicationResponse.json();
      if (!applicationResponse.ok || !applicationJson.success) throw new Error(applicationJson.message || "Could not create application approval record");
      fetchApplications();
      toast({ title: "Application Package Approved", description: "Created a job-specific resume branch and added the role to your approval pipeline." });
    } catch (error: any) {
      toast({ title: "Approval Failed", description: error.message || "Unable to approve package.", variant: "destructive" });
    } finally {
      setApprovingJob("");
    }
  };

  const handleCreate = async () => {
    if (!newJob.jobTitle || !newJob.company || !newJob.documentId) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/application/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: "Success",
          description: "Application added to pipeline",
        });
        setIsAddModalOpen(false);
        setNewJob({
          jobTitle: "",
          company: "",
          documentId: "",
          status: "wishlist",
        });
        fetchApplications();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/application/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        fetchApplications();
        toast({ title: "Status Updated", description: `Moved to ${status}` });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClick = (app: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setAppToDelete(app);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!appToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/application/delete/${appToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setApplications(apps => apps.filter(a => a.id !== appToDelete.id));
        toast({ title: "Deleted", description: "Application removed from board" });
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };



  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader className="animate-spin text-indigo-500 w-10 h-10" />
      </div>
    );
  }

  return (
    <PremiumPage>
      <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Briefcase size={12} />
            Application Pipeline
          </div>
          <h1 className="text-4xl font-black tracking-tight">Job Tracker</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Manage your interview pipeline and track which resume versions are
            getting you the best results.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Dialog open={isAgentOpen} onOpenChange={setIsAgentOpen}>
            <Button
              onClick={() => setIsAgentOpen(true)}
              disabled={agentLoading}
              className="h-11 gap-2 rounded-md bg-blue-600 px-5 font-bold text-white shadow-sm transition-all hover:bg-blue-700"
            >
              <Sparkles size={18} />
              Search Live Roles
            </Button>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Bot className="w-5 h-5 text-indigo-500" />
                  AI Opportunity Search
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-3 rounded-xl border bg-muted/20 p-4 md:grid-cols-2">
                <select
                  value={selectedResumeId}
                  onChange={(event) => setSelectedResumeId(event.target.value)}
                  className="h-10 rounded-md border bg-background px-3 text-xs font-bold"
                >
                  {resumes.map((document: any) => (
                    <option key={document.documentId} value={document.documentId}>
                      {document.title}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Target role override"
                  value={preferences.targetRole}
                  onChange={(event) => setPreferences({ ...preferences, targetRole: event.target.value })}
                />
                <Input
                  placeholder="Region or city"
                  value={preferences.region}
                  onChange={(event) => setPreferences({ ...preferences, region: event.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={preferences.workMode}
                    onChange={(event) => setPreferences({ ...preferences, workMode: event.target.value })}
                    className="h-10 rounded-md border bg-background px-3 text-xs font-bold"
                  >
                    <option value="any">Any work mode</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                  <select
                    value={preferences.seniority}
                    onChange={(event) => setPreferences({ ...preferences, seniority: event.target.value })}
                    className="h-10 rounded-md border bg-background px-3 text-xs font-bold"
                  >
                    <option value="any level">Any level</option>
                    <option value="junior">Junior</option>
                    <option value="mid-level">Mid-level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <label className="flex-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Results: {preferences.maxResults}
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={preferences.maxResults}
                      onChange={(event) => setPreferences({ ...preferences, maxResults: Number(event.target.value) })}
                      className="mt-2 block w-full accent-indigo-500"
                    />
                  </label>
                  <Button
                    onClick={runJobAgent}
                    disabled={agentLoading}
                    className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {agentLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Scan roles
                  </Button>
                </div>
              </div>

              {agentLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                  <p className="text-sm font-bold text-foreground animate-pulse">Active Agent Scanning...</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    The agent is searching live web listings matching your resume experiences and skills.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 mt-4">
                  <p className="text-xs text-muted-foreground font-semibold">
                    Matched active postings found on the web based on your active profile: <strong className="text-foreground">{activeResumeDetails?.personalInfo?.jobTitle || "Software Engineer"}</strong>.
                  </p>
                  <div className="space-y-4">
                    {agentJobs.map((job, idx) => (
                      <div key={idx} className="p-5 border border-border/50 bg-card/25 rounded-2xl flex flex-col gap-3 group relative overflow-hidden transition-all hover:border-indigo-500/20 hover:bg-card/45">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-md text-foreground flex items-center gap-2">
                              {job.title}
                              <span className="text-[10px] text-muted-foreground bg-muted border border-border font-bold px-1.5 py-0.5 rounded">
                                {job.company}
                              </span>
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-2">{job.description}</p>
                            {job.matchEvidence?.length > 0 && <p className="mt-2 text-[10px] font-semibold text-emerald-500">{job.matchEvidence.join(" | ")}</p>}
                            {job.risk && <p className="mt-1 text-[10px] font-semibold text-amber-500">Risk: {job.risk}</p>}
                          </div>
                          <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 rounded-md shrink-0">
                            {job.score}% Match
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Button
                            onClick={() => approveAgentJob(job)}
                            disabled={approvingJob === `${job.company}-${job.title}`}
                            size="sm"
                            className="text-xs h-9 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 gap-1.5"
                          >
                            {approvingJob === `${job.company}-${job.title}` ? <Loader2 size={13} className="animate-spin" /> : <GitBranch size={13} />}
                            Approve Package
                          </Button>
                          <Button
                            onClick={() => saveAgentJob(job)}
                            size="sm"
                            className="text-xs h-9 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4"
                          >
                            Save Only
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedCoverLetter(job.coverLetter);
                              setIsCoverLetterOpen(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="text-xs h-9 font-bold border-indigo-500/20 text-foreground hover:bg-indigo-500/5 rounded-lg px-4 flex items-center gap-1.5"
                          >
                            <FileText size={13} />
                            Cover Letter
                          </Button>
                          {job.url && (
                            <a href={job.url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 ml-auto">
                              View Original <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 gap-2 rounded-md bg-foreground px-5 font-bold text-background shadow-sm transition-all hover:bg-foreground/90">
                <Plus size={20} />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">
                  Add New Job
                </DialogTitle>
                <DialogDescription>
                  Track a new job opportunity in your pipeline.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="jobTitle"
                    className="font-bold text-xs uppercase text-muted-foreground"
                  >
                    Job Title *
                  </Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g. Senior Frontend Engineer"
                    className="h-11 rounded-md"
                    value={newJob.jobTitle}
                    onChange={(e) =>
                      setNewJob({ ...newJob, jobTitle: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="company"
                    className="font-bold text-xs uppercase text-muted-foreground"
                  >
                    Company *
                  </Label>
                  <Input
                    id="company"
                    placeholder="e.g. Google, Stripe"
                    className="h-11 rounded-md"
                    value={newJob.company}
                    onChange={(e) =>
                      setNewJob({ ...newJob, company: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-xs uppercase text-muted-foreground">
                    Link Resume Version *
                  </Label>
                  <Select
                    value={newJob.documentId}
                    onValueChange={(v) => setNewJob({ ...newJob, documentId: v })}
                  >
                    <SelectTrigger className="h-11 rounded-md">
                      <SelectValue placeholder="Select resume version" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {resumes.map((resume: any) => (
                        <SelectItem
                          key={resume.documentId}
                          value={resume.documentId}
                        >
                          {resume.title}{" "}
                          {resume.branchName ? `(${resume.branchName})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-xs uppercase text-muted-foreground">
                    Initial Status
                  </Label>
                  <Select
                    value={newJob.status}
                    onValueChange={(v) => setNewJob({ ...newJob, status: v })}
                  >
                    <SelectTrigger className="h-11 rounded-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {STATUS_COLUMNS.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="h-11 w-full rounded-md bg-foreground font-bold text-background hover:bg-foreground/90"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating && (
                    <Loader size={16} className="animate-spin mr-2" />
                  )}
                  Add to Tracker
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isCoverLetterOpen} onOpenChange={setIsCoverLetterOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-indigo-500" />
                Tailored Cover Letter Draft
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 p-6 bg-muted/20 border border-border/50 rounded-2xl whitespace-pre-line text-sm leading-relaxed font-semibold font-sans text-slate-800 dark:text-slate-100 select-all">
              {selectedCoverLetter}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setIsCoverLetterOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 rounded-xl">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {STATUS_COLUMNS.map((column) => (
          <div key={column.id} className="flex flex-col gap-4 min-h-[500px]">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", column.color)} />
                <h3 className="font-bold text-sm uppercase tracking-widest">
                  {column.label}
                </h3>
              </div>
              <span className="text-[10px] font-black text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                {applications.filter((app) => app.status === column.id).length}
              </span>
            </div>

            <div className="flex-1 space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
              <AnimatePresence mode="popLayout">
                {applications
                  .filter((app) => app.status === column.id)
                  .map((app) => (
                    <motion.div
                      layout
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -2 }}
                      className="group relative cursor-pointer rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-indigo-500/40"
                      onClick={() => {
                        setSelectedApp(app);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-sm leading-tight group-hover:text-indigo-500 transition-colors">
                            {app.jobTitle}
                          </h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <button className="text-muted-foreground/30 hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
                                <MoreVertical size={14} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer"
                                onClick={(e) => draftNetworkingOutreach(app, e)}
                                disabled={networkingLoading === app.id}
                              >
                                {networkingLoading === app.id ? <Loader2 size={14} className="animate-spin" /> : <Network size={14} />}
                                Draft Outreach
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer"
                                onClick={(e) => handleDeleteClick(app, e)}
                              >
                                <Trash2 size={14} />
                                Delete Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building2 size={12} className="shrink-0" />
                          <span className="font-medium truncate">
                            {app.company}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase">
                            <FileText size={10} />v{app.documentId.slice(-4)}
                          </div>
                          <div className="flex gap-1">
                            {STATUS_COLUMNS.filter((c) => c.id !== app.status)
                              .slice(0, 2)
                              .map((c) => (
                                <button
                                  key={c.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(app.id, c.id);
                                  }}
                                  className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all"
                                >
                                  <ChevronRight size={10} />
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal / Cover Letter Generator */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[700px] overflow-hidden rounded-lg p-0">
          {selectedApp && (
            <div className="flex flex-col h-full max-h-[90vh]">
              <div className="p-8 border-b bg-muted/20">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-500 text-[10px] font-bold uppercase tracking-widest">
                      <Building2 size={12} />
                      {selectedApp.company}
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">
                      {selectedApp.jobTitle}
                    </h2>
                  </div>
                  <div
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-lg",
                      STATUS_COLUMNS.find((c) => c.id === selectedApp.status)
                        ?.color,
                    )}
                  >
                    {selectedApp.status}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-1 items-center gap-3 rounded-lg border bg-background p-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        Linked Resume
                      </p>
                      <p className="text-sm font-bold truncate">
                        {resumes.find(
                          (r: any) => r.documentId === selectedApp.documentId,
                        )?.title || "Version 1"}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <InterviewPrepAssistant initialResumeInfo={fullResumeInfo} />
                      <SkillGapAnalyzer initialResumeInfo={fullResumeInfo} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl"
                        asChild
                      >
                        <a
                          href={`/dashboard/document/${selectedApp.documentId}/edit`}
                          target="_blank"
                        >
                          <ArrowRight size={16} />
                        </a>
                      </Button>
                    </div>
                  </div>

                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Cover Letter Section */}
                <CoverLetterSection app={selectedApp} />

                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <LayoutGrid size={16} />
                    Application Notes
                  </h3>
                  <textarea
                    className="h-32 w-full resize-none rounded-lg border bg-muted/30 p-4 text-sm focus:ring-2 ring-indigo-500/20"
                    placeholder="Interview questions, salary expectations, next steps..."
                    value={appNotes}
                    onChange={(event) => setAppNotes(event.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={saveApplicationNotes}
                      disabled={savingNotes}
                      size="sm"
                      className="gap-2"
                    >
                      {savingNotes ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Notes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteApplicationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        jobTitle={appToDelete?.jobTitle || ""}
      />
    </PremiumPage>
  );
};


const CoverLetterSection = ({ app }: { app: any }) => {
  const [jd, setJd] = useState("");
  const [tone, setTone] = useState("Confident");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");

  const handleGenerate = async () => {
    if (!jd.trim()) {
      toast({
        title: "Job Description Required",
        description: "Paste the JD to tailor your letter.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/application/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: app.documentId,
          jobDescription: jd,
          tone,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedLetter(json.content);
        toast({
          title: "Letter Generated!",
          description: "Tailored to your resume and the job.",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" />
          AI Cover Letter Generator
        </h3>
        <div className="flex gap-2">
          {["Confident", "Enthusiastic", "Formal", "Direct"].map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={cn(
                "px-2 py-1 rounded-md text-[10px] font-bold border transition-all",
                tone === t
                  ? "bg-indigo-500 border-indigo-500 text-white"
                  : "border-border hover:bg-muted",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {!generatedLetter ? (
        <div className="space-y-4">
          <textarea
            className="w-full h-40 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 focus:ring-2 ring-indigo-500/20 text-sm resize-none"
            placeholder="Paste the job description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
          <Button
            className="w-full h-12 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 gap-2"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            Generate Tailored Cover Letter
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-sm leading-relaxed whitespace-pre-wrap font-serif">
            {generatedLetter}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl font-bold"
              onClick={() => setGeneratedLetter("")}
            >
              Start Over
            </Button>
            <Button
              className="flex-1 h-11 rounded-xl font-bold bg-indigo-600"
              onClick={() => {
                navigator.clipboard.writeText(generatedLetter);
                toast({
                  title: "Copied!",
                  description: "Letter copied to clipboard.",
                });
              }}
            >
              Copy to Clipboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTrackerPage;
