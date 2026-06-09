"use client";

import React, { useMemo, useState } from "react";
import { Github, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useResumeContext } from "@/context/resume-info-provider";
import { toast } from "@/hooks/use-toast";
import useUpdateDocument from "@/features/document/use-update-document";

const GithubSync = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  const [username, setUsername] = useState("");
  const [repoLimit, setRepoLimit] = useState(6);
  const [includeForks, setIncludeForks] = useState(false);
  const [roleTitle, setRoleTitle] = useState("Open Source Developer / Contributor");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);

  const repositories = snapshot?.repositories || [];
  const selectedCount = selectedRepos.length;
  const existingNames = useMemo(
    () => new Set((resumeInfo?.experiences || []).map((experience) => experience.companyName?.toLowerCase())),
    [resumeInfo?.experiences],
  );

  const loadSnapshot = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/automation/developer-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "github", documentId: resumeInfo?.documentId, username, repoLimit, includeForks }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "GitHub profile could not be loaded");
      setSnapshot(data.data);
      setSelectedRepos((data.data.repositories || []).filter((repo: any) => !existingNames.has(repo.name.toLowerCase())).map((repo: any) => repo.name));
    } catch (error: any) {
      toast({ title: "Sync Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const importSelected = async () => {
    if (!resumeInfo || !selectedCount) return;
    setLoading(true);
    try {
      const imported = repositories
        .filter((repo: any) => selectedRepos.includes(repo.name))
        .map((repo: any) => ({
          title: roleTitle,
          companyName: repo.name,
          city: "Remote",
          state: "Open Source",
          startDate: null,
          endDate: null,
          currentlyWorking: true,
          workSummary: `<ul><li>${repo.description || `Built and maintained ${repo.name}`}.</li><li>Primary technology: ${repo.language || "Software Engineering"}; earned ${repo.stars} stars and ${repo.forks} forks.</li><li>Repository: ${repo.url}</li></ul>`,
        }));
      const experiences = [
        ...(resumeInfo.experiences || []).filter((experience) => !selectedRepos.includes(experience.companyName || "")),
        ...imported,
      ];
      onUpdate({ ...resumeInfo, experiences });
      await mutateAsync({ experience: experiences });
      toast({ title: "GitHub Sync Complete", description: `Imported ${imported.length} selected repositories.` });
      setOpen(false);
    } catch {
      toast({ title: "Import Failed", description: "The selected repositories could not be added.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleRepo = (name: string) => {
    setSelectedRepos((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-slate-950 font-bold hover:bg-slate-100"><Github size={16} /> Sync GitHub</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl p-0 shadow-2xl">
        <div className="bg-slate-950 p-8 text-white">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-3 text-2xl font-black"><Github size={24} /> Secure GitHub Portfolio Sync</DialogTitle>
            <DialogDescription className="text-slate-400">Preview and choose exactly which public repositories become resume evidence.</DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 p-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input placeholder="GitHub username" value={username} onChange={(event) => setUsername(event.target.value)} className="sm:col-span-2" />
            <Input type="number" min={1} max={20} value={repoLimit} onChange={(event) => setRepoLimit(Number(event.target.value))} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input placeholder="Imported role title" value={roleTitle} onChange={(event) => setRoleTitle(event.target.value)} />
            <label className="flex items-center gap-2 rounded-md border px-3 text-xs font-semibold text-muted-foreground">
              <input type="checkbox" checked={includeForks} onChange={(event) => setIncludeForks(event.target.checked)} />
              Include forked repositories
            </label>
          </div>
          <Button onClick={loadSnapshot} disabled={loading || !username} className="w-full gap-2 bg-slate-950 text-white hover:bg-slate-800">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Analyze GitHub Profile
          </Button>

          {snapshot && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-sm font-black">{snapshot.profile?.name || username}</p>
                <p className="mt-1 text-xs text-muted-foreground">{snapshot.profile?.bio || "Public GitHub profile"}</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500">{snapshot.profile?.publicRepos} public repos · {snapshot.recentPublicContributions} recent events</p>
              </div>
              <div className="space-y-2">
                {repositories.map((repo: any) => (
                  <label key={repo.name} className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 hover:border-indigo-500/40">
                    <input type="checkbox" checked={selectedRepos.includes(repo.name)} onChange={() => toggleRepo(repo.name)} className="mt-1" />
                    <div className="min-w-0">
                      <p className="text-sm font-black">{repo.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{repo.description || "No description provided."}</p>
                      <p className="mt-2 text-[10px] font-bold text-indigo-500">{repo.language || "Mixed stack"} · {repo.stars} stars · {repo.forks} forks</p>
                    </div>
                  </label>
                ))}
              </div>
              <Button onClick={importSelected} disabled={loading || !selectedCount} className="w-full bg-indigo-600 font-bold text-white hover:bg-indigo-700">Import {selectedCount} Selected Repositories</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GithubSync;
