"use client";

import React, { useEffect, useState } from "react";
import { Code2, Github, Trophy } from "lucide-react";

const DeveloperProof = ({ documentId }: { documentId: string }) => {
  const [snapshots, setSnapshots] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/automation/public-snapshots/${documentId}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setSnapshots(data?.snapshots || []))
      .catch(() => setSnapshots([]));
  }, [documentId]);

  if (!snapshots.length) return null;

  return (
    <section id="developer-proof" className="mt-20 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500"><Code2 size={20} /></div>
        <h2 className="text-sm font-bold uppercase tracking-tight">Live Developer Proof</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {snapshots.map((snapshot) => snapshot.provider === "github"
          ? <GithubSnapshot key={`${snapshot.provider}-${snapshot.username}`} snapshot={snapshot} />
          : <LeetCodeSnapshot key={`${snapshot.provider}-${snapshot.username}`} snapshot={snapshot} />)}
      </div>
    </section>
  );
};

const GithubSnapshot = ({ snapshot }: { snapshot: any }) => (
  <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-5">
    <div className="flex items-center justify-between gap-3">
      <p className="flex items-center gap-2 text-sm font-black"><Github size={16} /> @{snapshot.username}</p>
      <a href={snapshot.data?.profile?.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-indigo-500">View GitHub</a>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-2">
      <ProofStat label="Repos" value={snapshot.data?.profile?.publicRepos || 0} />
      <ProofStat label="Followers" value={snapshot.data?.profile?.followers || 0} />
      <ProofStat label="Recent events" value={snapshot.data?.recentPublicContributions || 0} />
    </div>
    {(snapshot.data?.contributionGrid || []).length > 0 && (
      <div className="mt-4 flex flex-wrap gap-1">
        {snapshot.data.contributionGrid.map((day: { date: string; count: number }) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.count} commits`}
            className="h-3 w-3 rounded-sm"
            style={{
              backgroundColor: day.count === 0
                ? "rgba(99,102,241,0.12)"
                : day.count < 2
                  ? "rgba(99,102,241,0.35)"
                  : day.count < 4
                    ? "rgba(99,102,241,0.6)"
                    : "rgba(99,102,241,0.95)",
            }}
          />
        ))}
      </div>
    )}
    <div className="mt-4 space-y-2">
      {(snapshot.data?.repositories || []).slice(0, 3).map((repo: any) => (
        <a key={repo.name} href={repo.url} target="_blank" rel="noreferrer" className="block rounded-lg border bg-background/60 p-3 transition-colors hover:border-indigo-500/40">
          <p className="text-xs font-black">{repo.name}</p>
          <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">{repo.language || "Mixed stack"} · {repo.stars} stars</p>
        </a>
      ))}
    </div>
  </div>
);

const LeetCodeSnapshot = ({ snapshot }: { snapshot: any }) => {
  const totals = snapshot.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
  return (
    <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-5">
      <p className="flex items-center gap-2 text-sm font-black"><Trophy size={16} className="text-amber-500" /> LeetCode · {snapshot.username}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {totals.slice(0, 4).map((stat: any) => <ProofStat key={stat.difficulty} label={stat.difficulty} value={stat.count} />)}
      </div>
      {snapshot.data?.userContestRanking && <p className="mt-4 text-xs font-bold text-amber-600">Contest rating {Math.round(snapshot.data.userContestRanking.rating || 0)} · Top {snapshot.data.userContestRanking.topPercentage || 0}%</p>}
    </div>
  );
};

const ProofStat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-lg border bg-background/60 p-3 text-center">
    <p className="text-lg font-black">{value}</p>
    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
  </div>
);

export default DeveloperProof;
