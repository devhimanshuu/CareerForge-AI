"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { GitBranch, GitMerge, History, Loader, ArrowRight } from "lucide-react";
import useGetBranches from "@/features/document/use-get-branches";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface PropType {
  documentId: string;
  children: React.ReactNode;
}

type BranchExperience = { id: number; title: string | null; companyName: string | null; workSummary: string | null };
type Branch = {
  documentId: string;
  title: string;
  branchName: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  isRoot: boolean;
  isCurrent: boolean;
  experiences: BranchExperience[];
  skills: { id: number; name: string | null; rating: number }[];
};

// Normalize a bullet list out of a workSummary string (one per line, trimmed).
const toBullets = (s: string | null | undefined) =>
  (s || "")
    .split(/\r?\n|•|·|- /)
    .map((b) => b.trim())
    .filter(Boolean);

// Build a per-bullet diff between the baseline and target branches.
const diffBranches = (base: Branch | undefined, target: Branch) => {
  const baseBullets = new Set<string>();
  base?.experiences.forEach((e) => toBullets(e.workSummary).forEach((b) => baseBullets.add(b)));
  const targetBullets = new Set<string>();
  target.experiences.forEach((e) => toBullets(e.workSummary).forEach((b) => targetBullets.add(b)));

  const added: { bullet: string; role: string }[] = [];
  const removed: { bullet: string; role: string }[] = [];

  target.experiences.forEach((e) => {
    toBullets(e.workSummary).forEach((b) => {
      if (!baseBullets.has(b)) {
        added.push({ bullet: b, role: `${e.title || "Role"} @ ${e.companyName || "—"}` });
      }
    });
  });
  base?.experiences.forEach((e) => {
    toBullets(e.workSummary).forEach((b) => {
      if (!targetBullets.has(b)) {
        removed.push({ bullet: b, role: `${e.title || "Role"} @ ${e.companyName || "—"}` });
      }
    });
  });
  return { added, removed };
};

const ResumeVersionControl = ({ documentId, children }: PropType) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetBranches(documentId, open);

  const branches = (data?.branches as Branch[] | undefined) || [];
  const sorted = useMemo(
    () => [...branches].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [branches]
  );

  const [sliderIdx, setSliderIdx] = useState<number>(0);
  const [compareWithRoot, setCompareWithRoot] = useState(true);

  const selected = sorted[Math.min(sliderIdx, Math.max(sorted.length - 1, 0))];
  const root = sorted.find((b) => b.isRoot);
  const baseline = compareWithRoot ? root : sorted[Math.max(sliderIdx - 1, 0)];
  const diff = selected ? diffBranches(baseline?.documentId === selected.documentId ? undefined : baseline, selected) : null;

  // Reset slider to current branch whenever data arrives.
  React.useEffect(() => {
    if (!sorted.length) return;
    const currentIdx = sorted.findIndex((b) => b.isCurrent);
    setSliderIdx(currentIdx >= 0 ? currentIdx : sorted.length - 1);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            Version History &amp; Diff
          </DialogTitle>
          <DialogDescription>
            Scrub the timeline to see how your resume evolved across branches.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader className="w-5 h-5 animate-spin mr-2" /> Loading branches…
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No version data yet. Create a branch to start tracking changes.
          </div>
        ) : (
          <>
            {/* Branch tree */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center gap-2">
                {sorted.map((b, i) => (
                  <React.Fragment key={b.documentId}>
                    <button
                      type="button"
                      onClick={() => setSliderIdx(i)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition",
                        i === sliderIdx
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                          : "border-border hover:bg-accent",
                        b.isCurrent && "ring-1 ring-indigo-400"
                      )}
                    >
                      {b.isRoot ? <GitMerge className="w-3 h-3" /> : <GitBranch className="w-3 h-3" />}
                      <span className="font-medium">{b.branchName || (b.isRoot ? "main" : "branch")}</span>
                      {b.isCurrent && <span className="text-[10px] uppercase opacity-70">current</span>}
                    </button>
                    {i < sorted.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Timeline slider */}
            <div className="space-y-2 px-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Timeline</span>
                <span>
                  {selected && (
                    <>
                      {selected.title} ·{" "}
                      {formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true })}
                    </>
                  )}
                </span>
              </div>
              <Slider
                min={0}
                max={Math.max(sorted.length - 1, 0)}
                step={1}
                value={[sliderIdx]}
                onValueChange={(v) => setSliderIdx(v[0] ?? 0)}
              />
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant={compareWithRoot ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCompareWithRoot(true)}
                >
                  Compare vs main
                </Button>
                <Button
                  variant={!compareWithRoot ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCompareWithRoot(false)}
                >
                  Compare vs previous
                </Button>
              </div>
            </div>

            {/* Diff view */}
            {selected && diff && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-2">
                    + Added ({diff.added.length})
                  </div>
                  {diff.added.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No new bullets vs baseline.</p>
                  ) : (
                    <ul className="space-y-2">
                      {diff.added.map((a, i) => (
                        <li key={i} className="text-xs">
                          <div className="text-emerald-700 dark:text-emerald-300">{a.bullet}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {a.role} · added{" "}
                            {formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true })}
                            {selected.branchName ? ` for the ${selected.branchName} application` : ""}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400 mb-2">
                    − Removed ({diff.removed.length})
                  </div>
                  {diff.removed.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nothing removed vs baseline.</p>
                  ) : (
                    <ul className="space-y-2">
                      {diff.removed.map((r, i) => (
                        <li key={i} className="text-xs">
                          <div className="text-rose-700 dark:text-rose-300 line-through">{r.bullet}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{r.role}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResumeVersionControl;
