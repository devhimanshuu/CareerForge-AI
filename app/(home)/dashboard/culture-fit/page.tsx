"use client";

import React, { useState } from "react";
import {
  PremiumPage,
  PremiumPageHeader,
  PremiumPanel,
} from "@/components/ui/premium-page";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Newspaper,
  Linkedin,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Signal = { label: string; source: "glassdoor" | "linkedin" | "news" | "blog" | "general" };
type Alignment = {
  dimension:
    | "engineering_culture"
    | "work_life_balance"
    | "career_growth"
    | "compensation"
    | "leadership_trust";
  score: number;
  note: string;
};
type Report = {
  company: string;
  overallScore: number;
  confidence: "low" | "medium" | "high";
  headline: string;
  pros: Signal[];
  cons: Signal[];
  valuesAlignment: Alignment[];
};

const DIMENSION_LABEL: Record<Alignment["dimension"], string> = {
  engineering_culture: "Engineering culture",
  work_life_balance: "Work-life balance",
  career_growth: "Career growth",
  compensation: "Compensation",
  leadership_trust: "Leadership trust",
};

const SourceBadge = ({ source }: { source: Signal["source"] }) => {
  const map: Record<Signal["source"], { label: string; icon: React.ReactNode; cls: string }> = {
    glassdoor: { label: "Glassdoor", icon: <Star size={10} />, cls: "bg-emerald-500/10 text-emerald-600" },
    linkedin: { label: "LinkedIn", icon: <Linkedin size={10} />, cls: "bg-sky-500/10 text-sky-600" },
    news: { label: "News", icon: <Newspaper size={10} />, cls: "bg-amber-500/10 text-amber-600" },
    blog: { label: "Eng blog", icon: <Sparkles size={10} />, cls: "bg-purple-500/10 text-purple-600" },
    general: { label: "Signal", icon: <Building2 size={10} />, cls: "bg-muted text-muted-foreground" },
  };
  const c = map[source];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
        c.cls
      )}
    >
      {c.icon} {c.label}
    </span>
  );
};

export default function CultureFitPage() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [values, setValues] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!company.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/culture-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, values }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setReport(data);
    } catch (e: any) {
      setError(e.message || "Could not analyze company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Culture Fit"
        title="Company Culture Fit Analyzer"
        description="Enter a company and we’ll synthesize Glassdoor sentiment, LinkedIn signals, and recent news into a balanced fit report."
        icon={<Building2 size={11} />}
      />

      <PremiumPanel className="p-5 mb-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Company
            </label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe"
              className="mt-1"
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Target role (optional)
            </label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="mt-1"
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              What matters to you
            </label>
            <Textarea
              value={values}
              onChange={(e) => setValues(e.target.value)}
              placeholder="e.g. autonomy, async work, deep technical mentorship"
              rows={1}
              className="mt-1 min-h-[40px]"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end">
          <Button onClick={analyze} disabled={!company.trim() || loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Culture Fit Report
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="mt-3 text-xs text-rose-500">{error}</p>
        )}
      </PremiumPanel>

      {report && (
        <div className="grid gap-6">
          <PremiumPanel className="p-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  Overall fit · {report.company}
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-5xl font-black text-foreground">
                    {report.overallScore}
                  </span>
                  <span className="text-muted-foreground text-sm">/ 100</span>
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-wider font-bold rounded-full px-2 py-0.5",
                      report.confidence === "high" && "bg-emerald-500/10 text-emerald-600",
                      report.confidence === "medium" && "bg-amber-500/10 text-amber-600",
                      report.confidence === "low" && "bg-rose-500/10 text-rose-600"
                    )}
                  >
                    {report.confidence} confidence
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/90 italic">
                  “{report.headline}”
                </p>
              </div>
            </div>
          </PremiumPanel>

          <div className="grid gap-6 md:grid-cols-2">
            <PremiumPanel className="p-5">
              <div className="flex items-center gap-2 mb-3 text-emerald-600">
                <ThumbsUp size={16} />
                <h3 className="text-sm font-black uppercase tracking-widest">Pros</h3>
              </div>
              <ul className="space-y-3">
                {report.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <div className="text-sm">
                      <div>{p.label}</div>
                      <div className="mt-0.5">
                        <SourceBadge source={p.source} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </PremiumPanel>

            <PremiumPanel className="p-5">
              <div className="flex items-center gap-2 mb-3 text-rose-600">
                <ThumbsDown size={16} />
                <h3 className="text-sm font-black uppercase tracking-widest">Cons</h3>
              </div>
              <ul className="space-y-3">
                {report.cons.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <div className="text-sm">
                      <div>{p.label}</div>
                      <div className="mt-0.5">
                        <SourceBadge source={p.source} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </PremiumPanel>
          </div>

          <PremiumPanel className="p-5">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">
              Values alignment
            </h3>
            <div className="space-y-4">
              {report.valuesAlignment.map((a) => (
                <div key={a.dimension}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold">{DIMENSION_LABEL[a.dimension]}</span>
                    <span className="text-muted-foreground">{a.score} / 5</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        a.score >= 4
                          ? "bg-emerald-500"
                          : a.score >= 3
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      )}
                      style={{ width: `${(a.score / 5) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{a.note}</p>
                </div>
              ))}
            </div>
          </PremiumPanel>
        </div>
      )}
    </PremiumPage>
  );
}
