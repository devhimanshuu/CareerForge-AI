"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  PremiumPage,
  PremiumPageHeader,
  PremiumPanel,
  PremiumStatCard,
} from "@/components/ui/premium-page";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Crown,
  Loader2,
  TrendingUp,
  Users,
  Beaker,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Feature = {
  featureId: string;
  events: number;
  users: number;
  avgDurationMs: number;
};
type AbFunnel = Record<
  string,
  Record<string, { exposure: number; conversion: number; users: number }>
>;
type ProStep = { step: string; users: number };
type Summary = {
  days: number;
  scope: "self" | "all";
  featureLeaderboard: Feature[];
  abFunnel: AbFunnel;
  proConversion: ProStep[];
};

const RANGE_OPTIONS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

const STEP_LABELS: Record<string, string> = {
  view_pricing: "Viewed pricing",
  click_upgrade: "Clicked upgrade",
  complete_payment: "Completed payment",
};

export default function UsageMetricsPage() {
  const [days, setDays] = useState(30);
  const [scope, setScope] = useState<"self" | "all">("all");
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/usage/summary?days=${days}&scope=${scope}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.success) setData(j.data);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [days, scope]);

  const totals = useMemo(() => {
    if (!data) return { events: 0, users: 0, topFeature: "—" };
    const events = data.featureLeaderboard.reduce((a, f) => a + f.events, 0);
    const users = data.featureLeaderboard.reduce(
      (a, f) => Math.max(a, f.users),
      0
    );
    const topFeature = data.featureLeaderboard[0]?.featureId || "—";
    return { events, users, topFeature };
  }, [data]);

  const maxEvents = useMemo(
    () => data?.featureLeaderboard[0]?.events || 1,
    [data]
  );

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Product Analytics"
        title="Usage Metrics"
        description="Feature engagement, A/B funnel performance, and Pro conversion — designed to find what's working and what isn't."
        icon={<Activity size={11} />}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/40 rounded-md p-0.5 border border-border/60">
              {RANGE_OPTIONS.map((r) => (
                <button
                  key={r.days}
                  onClick={() => setDays(r.days)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded",
                    days === r.days
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="flex items-center bg-muted/40 rounded-md p-0.5 border border-border/60">
              {(["all", "self"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded",
                    scope === s
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground"
                  )}
                >
                  {s === "all" ? "All users" : "Me"}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading metrics…
        </div>
      ) : !data ? (
        <p className="text-center text-muted-foreground py-12">No data yet.</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <PremiumStatCard
              icon={<Activity size={16} />}
              label="Total events"
              value={totals.events.toLocaleString()}
              detail={`Last ${days} days`}
              tone="indigo"
            />
            <PremiumStatCard
              icon={<Users size={16} />}
              label="Active users"
              value={totals.users.toLocaleString()}
              detail={scope === "self" ? "You" : "Distinct"}
              tone="emerald"
            />
            <PremiumStatCard
              icon={<TrendingUp size={16} />}
              label="Top feature"
              value={totals.topFeature}
              detail="Highest event count"
              tone="amber"
            />
          </div>

          <PremiumPanel className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest">
                Feature engagement
              </h3>
              <span className="text-[10px] text-muted-foreground">
                Ranked by event count
              </span>
            </div>
            {data.featureLeaderboard.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No feature events tracked yet. Wire <code>useTrackUsage</code> into UI handlers.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data.featureLeaderboard.map((f) => {
                  const pct = (f.events / maxEvents) * 100;
                  return (
                    <div key={f.featureId} className="grid grid-cols-12 items-center gap-3">
                      <div className="col-span-3 truncate text-xs font-bold">
                        {f.featureId}
                      </div>
                      <div className="col-span-6">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="col-span-3 text-right text-xs tabular-nums">
                        <span className="font-bold">{f.events.toLocaleString()}</span>
                        <span className="text-muted-foreground"> evts</span>
                        <span className="ml-2 text-muted-foreground">
                          {f.users.toLocaleString()}u
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PremiumPanel>

          <div className="grid gap-6 md:grid-cols-2">
            <PremiumPanel className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Beaker size={14} className="text-indigo-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">
                  A/B test funnels
                </h3>
              </div>
              {Object.keys(data.abFunnel).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No A/B exposure events tracked yet. Track with{" "}
                  <code>{`{ funnel, variant, action: 'exposure' }`}</code>.
                </p>
              ) : (
                <div className="space-y-5">
                  {Object.entries(data.abFunnel).map(([funnelName, variants]) => {
                    const entries = Object.entries(variants);
                    const winner = entries
                      .map(([v, b]) => ({
                        v,
                        rate: b.exposure > 0 ? b.conversion / b.exposure : 0,
                      }))
                      .sort((a, b) => b.rate - a.rate)[0];
                    return (
                      <div key={funnelName}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            {funnelName}
                          </span>
                          {winner && winner.rate > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 rounded-full px-2 py-0.5">
                              Winner: {winner.v} ({(winner.rate * 100).toFixed(1)}%)
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {entries.map(([variant, b]) => {
                            const rate = b.exposure > 0 ? (b.conversion / b.exposure) * 100 : 0;
                            return (
                              <div
                                key={variant}
                                className="rounded-lg border border-border/60 p-3"
                              >
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="font-bold">{variant}</span>
                                  <span className="tabular-nums">
                                    {b.conversion}/{b.exposure}{" "}
                                    <span className="text-muted-foreground">
                                      ({rate.toFixed(1)}%)
                                    </span>
                                  </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${Math.min(100, rate)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </PremiumPanel>

            <PremiumPanel className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Crown size={14} className="text-amber-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">
                  Pro conversion funnel
                </h3>
              </div>
              {!data.proConversion.length || data.proConversion[0].users === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No pricing-page exposure tracked yet. Track with{" "}
                  <code>{`{ funnel: 'pro', action: 'view_pricing' }`}</code>.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.proConversion.map((step, i) => {
                    const top = data.proConversion[0].users || 1;
                    const pct = (step.users / top) * 100;
                    const prev = i > 0 ? data.proConversion[i - 1].users : null;
                    const dropoff =
                      prev && prev > 0
                        ? ((prev - step.users) / prev) * 100
                        : null;
                    return (
                      <div key={step.step}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold">
                            {STEP_LABELS[step.step] || step.step}
                          </span>
                          <span className="tabular-nums">
                            {step.users.toLocaleString()} users{" "}
                            <span className="text-muted-foreground">
                              ({pct.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-3 rounded-md bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {dropoff !== null && dropoff > 0 && (
                          <div className="text-[10px] text-rose-500 mt-1">
                            −{dropoff.toFixed(1)}% drop-off from previous step
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </PremiumPanel>
          </div>
        </div>
      )}
    </PremiumPage>
  );
}
