"use client";

import React, { useState } from "react";
import { Github, Loader2, Sparkles, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useResumeContext } from "@/context/resume-info-provider";
import { toast } from "@/hooks/use-toast";
import useUpdateDocument from "@/features/document/use-update-document";

const GithubSync = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync } = useUpdateDocument();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSync = async () => {
    if (!username.trim()) return;
    setLoading(true);

    try {
      // 1. Fetch repos from GitHub
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
      const repos = await res.json();

      if (!Array.isArray(repos)) {
        throw new Error("User not found or API limit reached");
      }

      // 2. Map repos to Experience format
      const newExperiences = repos.map((repo: any) => ({
        title: "Lead Developer / Contributor",
        companyName: repo.name,
        city: "Remote (GitHub)",
        state: "OSS",
        startDate: new Date(repo.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        endDate: "Present",
        currentlyWorking: true,
        workSummary: repo.description || `Active contributor to ${repo.name}. Technologies: ${repo.language || 'Software Development'}. Star count: ${repo.stargazers_count}.`,
      }));

      // 3. Update local state and DB
      if (resumeInfo) {
        const updatedInfo = {
          ...resumeInfo,
          experiences: [...(resumeInfo.experiences || []), ...newExperiences]
        };
        onUpdate(updatedInfo);
        
        await mutateAsync({
            experience: updatedInfo.experiences
        });

        toast({
          title: "GitHub Sync Success!",
          description: `Imported ${newExperiences.length} top repositories into your experience section.`,
        });
        setOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Sync Failed",
        description: "Could not fetch GitHub data. Please check the username.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-slate-950 hover:bg-slate-100 transition-all font-bold">
          <Github size={16} />
          Sync GitHub
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-none shadow-2xl overflow-hidden p-0 max-w-md">
        <div className="bg-slate-950 p-8 text-white">
          <DialogHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Github size={24} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-white">GitHub Portfolio Sync</DialogTitle>
                <DialogDescription className="text-slate-400 font-medium">
                  Automatically turn your repos into professional experience.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6 bg-background">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">GitHub Username</label>
            <div className="relative">
                <Input 
                    placeholder="e.g. torvalds" 
                    className="h-12 rounded-xl bg-muted/50 border-none px-4 font-bold focus:ring-2 ring-slate-950/20"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
          </div>

          <Button 
            onClick={handleSync} 
            disabled={loading || !username}
            className="w-full h-12 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold gap-2 shadow-xl shadow-slate-950/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            Import Repositories
          </Button>

          <p className="text-[10px] text-muted-foreground text-center italic">
            This will pull your 5 most recently updated public repositories and add them to your experience section.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GithubSync;
