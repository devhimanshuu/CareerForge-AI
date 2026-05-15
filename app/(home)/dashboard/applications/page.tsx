"use client";

import React, { useEffect, useState } from "react";
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
  Trash2,
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


  // Resume Data for linking
  const { data: resumeData } = useGetDocuments();
  const resumes = resumeData?.data || [];

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
    <div className="w-full max-w-7xl mx-auto px-5 py-8 space-y-8">
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

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 font-bold transition-all">
              <Plus size={20} />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
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
                  className="rounded-xl h-11"
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
                  className="rounded-xl h-11"
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
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select resume version" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
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
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
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
                className="w-full h-12 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700"
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

            <div className="flex-1 rounded-3xl bg-muted/30 border border-border/40 p-3 space-y-3">
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
                      className="bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
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
        <DialogContent className="sm:max-w-[700px] rounded-3xl p-0 overflow-hidden">
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
                  <div className="flex-1 p-3 rounded-2xl bg-background border flex items-center gap-3">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto rounded-xl"
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

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Cover Letter Section */}
                <CoverLetterSection app={selectedApp} />

                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <LayoutGrid size={16} />
                    Application Notes
                  </h3>
                  <textarea
                    className="w-full h-32 p-4 rounded-2xl bg-muted/30 border-none focus:ring-2 ring-indigo-500/20 text-sm resize-none"
                    placeholder="Interview questions, salary expectations, next steps..."
                    defaultValue={selectedApp.notes || ""}
                  />
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
    </div>
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
