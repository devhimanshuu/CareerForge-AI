"use client";

import React, { useMemo, useState } from "react";
import { Loader2, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useResumeContext } from "@/context/resume-info-provider";
import { toast } from "@/hooks/use-toast";
import useUpdateDocument from "@/features/document/use-update-document";

const LeetCodeSync = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [importSkills, setImportSkills] = useState(true);
  const [importSummary, setImportSummary] = useState(true);

  const totals = snapshot?.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
  const totalSolved = totals.reduce((sum: number, stat: any) => sum + (stat.count || 0), 0);
  const existingSkillNames = useMemo(
    () => new Set((resumeInfo?.skills || []).map((skill) => skill.name?.toLowerCase())),
    [resumeInfo?.skills],
  );

  const loadSnapshot = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/automation/developer-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "leetcode", documentId: resumeInfo?.documentId, username }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "LeetCode profile could not be loaded");
      setSnapshot(data.data);
    } catch (error: any) {
      toast({ title: "Sync Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const importToResume = async () => {
    if (!resumeInfo || !snapshot) return;
    setLoading(true);
    try {
      const ranking = snapshot.matchedUser?.profile?.ranking;
      const contest = snapshot.userContestRanking;
      const summaryLine = `Competitive programmer with ${totalSolved} LeetCode problems solved${ranking ? ` (global rank ${ranking})` : ""}${contest?.rating ? ` and contest rating ${Math.round(contest.rating)}` : ""}.`;
      const nextSkills = importSkills
        ? [
            ...(resumeInfo.skills || []),
            ...["Problem Solving", "Data Structures", "Algorithms", "Competitive Programming"]
              .filter((name) => !existingSkillNames.has(name.toLowerCase()))
              .map((name) => ({ name, rating: 4 })),
          ]
        : resumeInfo.skills;

      const nextSummary = importSummary
        ? [resumeInfo.summary, summaryLine].filter(Boolean).join(" ").trim()
        : resumeInfo.summary;

      const skills = nextSkills || [];
      onUpdate({ ...resumeInfo, summary: nextSummary, skills });
      await mutateAsync({ summary: nextSummary, skills });
      toast({ title: "LeetCode Sync Complete", description: "Imported solve stats into your resume." });
      setOpen(false);
    } catch {
      toast({ title: "Import Failed", description: "LeetCode data could not be added to the resume.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-amber-500/30 font-bold hover:bg-amber-50">
          <Trophy size={16} className="text-amber-500" /> Sync LeetCode
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-3xl p-0 shadow-2xl">
        <div className="bg-amber-500 p-8 text-white">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-3 text-2xl font-black"><Trophy size={24} /> LeetCode Profile Sync</DialogTitle>
            <DialogDescription className="text-amber-50/80">Import solve counts and competitive programming proof into your resume.</DialogDescription>
          </DialogHeader>
        </div>
        <div className="space-y-5 p-8">
          <Input placeholder="LeetCode username" value={username} onChange={(event) => setUsername(event.target.value)} />
          <Button onClick={loadSnapshot} disabled={loading || !username} className="w-full gap-2 bg-amber-500 text-white hover:bg-amber-600">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Analyze LeetCode Profile
          </Button>
          {snapshot && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-sm font-black">{snapshot.matchedUser?.profile?.realName || username}</p>
                <p className="mt-2 text-xs text-muted-foreground">{totalSolved} total problems solved</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {totals.slice(0, 4).map((stat: any) => (
                    <div key={stat.difficulty} className="rounded-lg border bg-background p-3 text-center">
                      <p className="text-lg font-black">{stat.count}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{stat.difficulty}</p>
                    </div>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input type="checkbox" checked={importSummary} onChange={(event) => setImportSummary(event.target.checked)} />
                Add solve stats to professional summary
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input type="checkbox" checked={importSkills} onChange={(event) => setImportSkills(event.target.checked)} />
                Add algorithm skills block
              </label>
              <Button onClick={importToResume} disabled={loading} className="w-full bg-amber-500 text-white hover:bg-amber-600">
                Import to Resume
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeetCodeSync;
