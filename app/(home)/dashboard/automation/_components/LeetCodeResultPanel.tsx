import React from "react";
import { Trophy } from "lucide-react";
import { PremiumPanel } from "@/components/ui/premium-page";

export const LeetCodeResultPanel = ({ data }: { data: any }) => {
  const profile = data.matchedUser?.profile;
  const stats = data.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
  const contest = data.userContestRanking;
  const difficultyColors: Record<string, string> = {
    All: "bg-slate-500",
    Easy: "bg-emerald-500",
    Medium: "bg-amber-500",
    Hard: "bg-rose-500",
  };

  return (
    <PremiumPanel className="overflow-hidden p-0">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 px-6 py-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(245,158,11,0.15),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-300" />
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
              LeetCode Snapshot
            </p>
          </div>
          <h2 className="mt-2 text-xl font-black">
            {profile?.realName || "Developer"}
          </h2>
          {profile?.aboutMe && (
            <p className="mt-1 text-sm text-slate-300 line-clamp-2">
              {profile.aboutMe}
            </p>
          )}
          {contest && (
            <div className="mt-4 flex items-center gap-4">
              <div className="rounded-xl bg-white/10 px-4 py-2">
                <p className="text-2xl font-black text-amber-300">
                  {Math.round(contest.rating || 0)}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Contest Rating
                </p>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-2">
                <p className="text-2xl font-black text-white">
                  Top {contest.topPercentage || 0}%
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Global Ranking
                </p>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-2">
                <p className="text-2xl font-black text-white">
                  {contest.attendedContestsCount || 0}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Contests
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Difficulty breakdown */}
      <div className="px-6 py-5">
        <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Problems Solved
        </p>
        <div className="space-y-3">
          {stats.map((stat: any) => {
            const total = stats[0]?.count || 1;
            const pct = total > 0 ? Math.round((stat.count / total) * 100) : 0;
            return (
              <div key={stat.difficulty} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">
                    {stat.difficulty}
                  </span>
                  <span className="text-xs font-black">
                    {stat.count.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
                  <div
                    className={`h-full rounded-full transition-all ${
                      difficultyColors[stat.difficulty] || "bg-slate-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PremiumPanel>
  );
};
