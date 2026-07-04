import React from "react";
import Image from "next/image";
import { Github, ExternalLink } from "lucide-react";
import { PremiumPanel } from "@/components/ui/premium-page";

export const GitHubResultPanel = ({ data }: { data: any }) => (
  <PremiumPanel className="overflow-hidden p-0">
    {/* Hero banner */}
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)]" />
      <div className="relative flex items-start gap-4">
        {data.profile?.avatarUrl && (
          <Image
            src={data.profile.avatarUrl}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 rounded-2xl ring-2 ring-white/10"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Github size={18} className="text-indigo-300" />
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
              GitHub Snapshot
            </p>
          </div>
          <h2 className="mt-2 text-xl font-black">
            {data.profile?.name || "Developer"}
          </h2>
          {data.profile?.bio && (
            <p className="mt-1 text-sm text-slate-300 line-clamp-2">
              {data.profile.bio}
            </p>
          )}
          {data.profile?.url && (
            <a
              href={data.profile.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              {data.profile.url.replace("https://github.com/", "github.com/")}{" "}
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-3 border-b">
      {[
        { label: "Repos", value: data.profile?.publicRepos || 0 },
        { label: "Followers", value: data.profile?.followers || 0 },
        { label: "Recent Events", value: data.recentPublicContributions || 0 },
      ].map((stat) => (
        <div key={stat.label} className="px-4 py-4 text-center">
          <p className="text-2xl font-black">{stat.value}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            {stat.label}
          </p>
        </div>
      ))}
    </div>

    {/* Contribution grid */}
    {data.contributionGrid?.length > 0 && (
      <div className="border-b px-6 py-5">
        <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Contribution Activity
        </p>
        <div className="flex flex-wrap gap-[3px]">
          {data.contributionGrid.map(
            (day: { date: string; count: number }) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} commits`}
                className="h-[11px] w-[11px] rounded-[2px] transition-all hover:ring-1 hover:ring-indigo-500/60"
                style={{
                  backgroundColor:
                    day.count === 0
                      ? "rgba(99,102,241,0.08)"
                      : day.count < 2
                        ? "rgba(99,102,241,0.3)"
                        : day.count < 4
                          ? "rgba(99,102,241,0.55)"
                          : "rgba(99,102,241,0.9)",
                }}
              />
            ),
          )}
        </div>
      </div>
    )}

    {/* Top repositories */}
    {data.repositories?.length > 0 && (
      <div className="px-6 py-5">
        <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Top Repositories
        </p>
        <div className="space-y-2">
          {data.repositories.map((repo: any) => (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-4 rounded-xl border bg-background/60 p-4 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/[0.03] group"
            >
              <div className="min-w-0">
                <p className="text-sm font-black group-hover:text-indigo-600 transition-colors">
                  {repo.name}
                </p>
                {repo.description && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {repo.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {repo.language && (
                  <span className="flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[10px] font-bold">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                  ★ {repo.stars}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {repo.forks} forks
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    )}
  </PremiumPanel>
);
