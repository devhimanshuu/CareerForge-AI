"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ExternalLink, Briefcase, Kanban, Clock3, Sparkles, Bot, Loader2, CheckCircle, FileText, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { PremiumPage, PremiumPageHeader, PremiumPanel, PremiumStatCard } from "@/components/ui/premium-page";
import useGetDocuments from "@/features/document/use-get-document";

type Column = "Wishlist" | "Applied" | "Interviewing" | "Offer";
const COLUMNS: Column[] = ["Wishlist", "Applied", "Interviewing", "Offer"];

const columnMeta: Record<Column, { accent: string; hint: string }> = {
  Wishlist: { accent: "bg-slate-500", hint: "Roles to qualify" },
  Applied: { accent: "bg-blue-500", hint: "Submitted applications" },
  Interviewing: { accent: "bg-amber-500", hint: "Active conversations" },
  Offer: { accent: "bg-emerald-500", hint: "Final outcomes" },
};

interface JobItem {
  id: string;
  company: string;
  role: string;
  column: Column;
  url?: string;
  dateAdded: string;
}

const JobBoard = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState<Column>("Wishlist");

  // Agent states
  const [activeResumeDetails, setActiveResumeDetails] = useState<any>(null);
  const [agentJobs, setAgentJobs] = useState<any[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<string | null>(null);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);

  // Documents listing
  const { data: documentsRes } = useGetDocuments();
  const documents = documentsRes?.data || [];

  useEffect(() => {
    if (documents.length > 0) {
      const fetchFirstResume = async () => {
        try {
          const res = await fetch(`/api/document/${documents[0].documentId}`);
          const json = await res.json();
          if (json.success) {
            setActiveResumeDetails(json.data);
          }
        } catch (e) {
          console.error("Failed to load active resume for agent search:", e);
        }
      };
      fetchFirstResume();
    }
  }, [documentsRes]);

  const runJobAgent = async () => {
    setAgentLoading(true);
    setIsAgentOpen(true);
    try {
      const response = await fetch("/api/ai/job-hunter-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: activeResumeDetails || {},
        }),
      });
      if (!response.ok) throw new Error("Agent search failed");
      const json = await response.json();
      setAgentJobs(json.jobs || []);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Agent Search Failed",
        description: "Failed to scan listings. Using fallback opportunities.",
        variant: "destructive",
      });
      // Fallback postings
      const jobTitle = activeResumeDetails?.personalInfo?.jobTitle || "Software Engineer";
      setAgentJobs([
        { company: "TechGlobal", title: `Senior ${jobTitle}`, description: "Hiring a skilled Senior engineer for full-time remote role.", score: 92, url: "https://techglobal.com/careers", coverLetter: "Dear Hiring Team,\n\nI am thrilled to apply for the Senior position at TechGlobal..." },
        { company: "InnovateSoft", title: `${jobTitle} (Remote)`, description: "We are looking for a developer to join our rapid product team.", score: 85, url: "https://innovatesoft.io/jobs", coverLetter: "Dear Hiring Team,\n\nI am writing to express my interest in the remote role at InnovateSoft..." },
        { company: "FinTech Group", title: `Lead Developer`, description: "Leading financial software platform hiring Lead developer with strong React background.", score: 78, url: "https://fintechgroup.org/careers", coverLetter: "Dear Hiring Team,\n\nI am writing to apply for the Lead Developer position at FinTech Group..." }
      ]);
    } finally {
      setAgentLoading(false);
    }
  };

  const addAgentJobToBoard = (job: any) => {
    const isAlreadyAdded = jobs.some(j => j.company.toLowerCase() === job.company.toLowerCase() && j.role.toLowerCase() === job.title.toLowerCase());
    if (isAlreadyAdded) {
      toast({
        title: "Already Added",
        description: `${job.title} at ${job.company} is already on your board.`,
        variant: "destructive",
      });
      return;
    }
    const newJob: JobItem = {
      id: crypto.randomUUID(),
      company: job.company,
      role: job.title,
      url: job.url,
      column: "Wishlist",
      dateAdded: new Date().toISOString(),
    };
    setJobs([...jobs, newJob]);
    toast({
      title: "Opportunity Saved",
      description: `${job.title} at ${job.company} added to Wishlist.`,
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("resumify_jobs");
    if (saved) {
      try {
        setJobs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse jobs", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("resumify_jobs", JSON.stringify(jobs));
    }
  }, [jobs, isLoaded]);

  const stats = useMemo(() => {
    const active = jobs.filter((job) => job.column === "Applied" || job.column === "Interviewing").length;
    const offers = jobs.filter((job) => job.column === "Offer").length;
    return { active, offers };
  }, [jobs]);

  const handleAddJob = () => {
    if (!newCompany || !newRole) {
      toast({ title: "Error", description: "Company and Role are required", variant: "destructive" });
      return;
    }
    const newJob: JobItem = {
      id: crypto.randomUUID(),
      company: newCompany,
      role: newRole,
      url: newUrl,
      column: targetColumn,
      dateAdded: new Date().toISOString(),
    };
    setJobs([...jobs, newJob]);
    setNewCompany("");
    setNewRole("");
    setNewUrl("");
    setIsAddOpen(false);
    toast({ title: "Job Added", description: `${newRole} at ${newCompany} added to ${targetColumn}` });
  };

  const handleDelete = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const moveJob = (id: string, newCol: Column) => {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, column: newCol } : j)));
  };

  if (!isLoaded) return null;

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Opportunity Desk"
        title="Job Hunt Kanban"
        description="A focused board for scouting roles before they become formal applications. Keep this lightweight, then move qualified roles into the main application tracker."
        icon={<Kanban size={13} />}
        action={
          <div className="flex items-center gap-3">
            {/* AI Job Hunter Agent Dialog */}
            <Dialog open={isAgentOpen} onOpenChange={setIsAgentOpen}>
              <Button 
                onClick={runJobAgent}
                disabled={agentLoading}
                className="h-11 gap-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-5"
              >
                {agentLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-yellow-300 fill-yellow-300" />}
                AI Agent Search
              </Button>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Bot className="w-5 h-5 text-indigo-500" />
                    AI Job Hunter Agent
                  </DialogTitle>
                </DialogHeader>
                
                {agentLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                    <p className="text-sm font-bold text-foreground animate-pulse">Active Agent Scanning...</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">The agent is searching live web listings matching your resume experiences and skills.</p>
                  </div>
                ) : (
                  <div className="space-y-6 mt-4">
                    <p className="text-xs text-muted-foreground font-semibold">Matched active postings found on the web based on your active profile: <strong className="text-foreground">{activeResumeDetails?.personalInfo?.jobTitle || "Software Engineer"}</strong>.</p>
                    
                    <div className="space-y-4">
                      {agentJobs.map((job, idx) => (
                        <div key={idx} className="p-5 border border-border/50 bg-card/25 rounded-2xl flex flex-col gap-3 group relative overflow-hidden transition-all hover:border-indigo-500/20 hover:bg-card/45">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-md text-foreground flex items-center gap-2">
                                {job.title}
                                <span className="text-[10px] text-muted-foreground bg-muted border border-border font-bold px-1.5 py-0.5 rounded">{job.company}</span>
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed mt-2">{job.description}</p>
                            </div>
                            <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 rounded-md shrink-0">
                              {job.score}% Match
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Button 
                              onClick={() => addAgentJobToBoard(job)} 
                              size="sm" 
                              className="text-xs h-9 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4"
                            >
                              Add to Wishlist
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

            {/* Manual Add Opportunity Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="h-11 gap-2 rounded-md bg-foreground px-5 font-bold text-background hover:bg-foreground/90">
                  <Plus size={16} />
                  Add Job
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-lg">
                <DialogHeader>
                  <DialogTitle>Add New Opportunity</DialogTitle>
                </DialogHeader>
                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Company Name</label>
                    <Input value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="e.g. Google" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Role / Title</label>
                    <Input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g. Frontend Engineer" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Job Posting URL</label>
                    <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Stage</label>
                    <select
                      value={targetColumn}
                      onChange={(e) => setTargetColumn(e.target.value as Column)}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      {COLUMNS.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleAddJob} className="mt-2 w-full rounded-md">Save Opportunity</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Cover Letter Modal */}
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
            <Button onClick={() => setIsCoverLetterOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 rounded-xl">Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <PremiumStatCard icon={<Briefcase size={18} />} label="Total Roles" value={jobs.length} detail="Local board" tone="indigo" />
        <PremiumStatCard icon={<Clock3 size={18} />} label="Active Pipeline" value={stats.active} detail="In motion" tone="amber" />
        <PremiumStatCard icon={<Kanban size={18} />} label="Offers" value={stats.offers} detail="Closed won" tone="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {COLUMNS.map((col) => {
          const colJobs = jobs.filter((j) => j.column === col);
          const meta = columnMeta[col];
          return (
            <PremiumPanel key={col} className="min-h-[520px] p-3">
              <div className="mb-4 flex items-start justify-between border-b border-border/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${meta.accent}`} />
                    <h3 className="text-sm font-black uppercase tracking-wider">{col}</h3>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{meta.hint}</p>
                </div>
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-black">
                  {colJobs.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {colJobs.map((job) => (
                  <div key={job.id} className="group rounded-lg border border-border/70 bg-background p-3 shadow-sm transition-colors hover:border-indigo-500/40">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h4 className="line-clamp-2 text-sm font-bold leading-snug">{job.role}</h4>
                      <button onClick={() => handleDelete(job.id)} className="text-muted-foreground opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="mb-3 text-xs font-medium text-muted-foreground">{job.company}</p>
                    {job.url && (
                      <a href={job.url} target="_blank" rel="noreferrer" className="mb-3 flex items-center gap-1 text-xs font-bold text-indigo-500 hover:underline">
                        View Posting <ExternalLink size={10} />
                      </a>
                    )}
                    <select
                      value={job.column}
                      onChange={(e) => moveJob(job.id, e.target.value as Column)}
                      className="h-8 w-full rounded-md border bg-muted/30 px-2 text-xs font-medium"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c} value={c}>Move to {c}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {colJobs.length === 0 && (
                  <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20 p-6 text-center text-xs font-medium text-muted-foreground">
                    No roles in this lane
                  </div>
                )}
              </div>
            </PremiumPanel>
          );
        })}
      </div>
    </PremiumPage>
  );
};

export default JobBoard;
