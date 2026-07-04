"use client";

import React, { useMemo, useState } from "react";
import {
  PremiumPage,
  PremiumPageHeader,
  PremiumPanel,
} from "@/components/ui/premium-page";
import { ApiKeyBanner } from "@/components/ui/api-key-banner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Offer = {
  id: string;
  company: string;
  role: string;
  baseSalary: number;
  signOnBonus: number;
  annualBonusPct: number;
  equityTotal: number;
  vestYears: number;
  benefitsValue: number;
  commuteCostMonthly: number;
  notes: string;
};

type Recommendation = {
  recommendedOfferId: string;
  reasoning: string;
  tradeoffs: string[];
  riskFlags: string[];
};

// crypto.randomUUID is missing on Safari < 15.4 — fall back to a random string.
const safeUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const emptyOffer = (): Offer => ({
  id: safeUUID(),
  company: "",
  role: "",
  baseSalary: 0,
  signOnBonus: 0,
  annualBonusPct: 0,
  equityTotal: 0,
  vestYears: 4,
  benefitsValue: 0,
  commuteCostMonthly: 0,
  notes: "",
});

const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

// Year-1 TC: base + signOn + annualBonus + (equity / vestYears) + benefits − annual commute.
const computeTotal = (o: Offer) => {
  const equityPerYear = o.vestYears > 0 ? o.equityTotal / o.vestYears : 0;
  const annualBonus = (o.baseSalary * o.annualBonusPct) / 100;
  const annualCommute = o.commuteCostMonthly * 12;
  return (
    o.baseSalary +
    o.signOnBonus +
    annualBonus +
    equityPerYear +
    o.benefitsValue -
    annualCommute
  );
};

const NumberInput = ({
  value,
  onChange,
  prefix,
  suffix,
}: {
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
}) => (
  <div className="relative">
    {prefix && (
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        {prefix}
      </span>
    )}
    <Input
      type="number"
      inputMode="numeric"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={cn(prefix && "pl-6", suffix && "pr-8")}
    />
    {suffix && (
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        {suffix}
      </span>
    )}
  </div>
);

export default function OfferComparePage() {
  const [offers, setOffers] = useState<Offer[]>([emptyOffer(), emptyOffer()]);
  const [priorities, setPriorities] = useState("");
  const [loading, setLoading] = useState(false);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateOffer = (id: string, patch: Partial<Offer>) =>
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  const removeOffer = (id: string) =>
    setOffers((prev) => (prev.length > 2 ? prev.filter((o) => o.id !== id) : prev));

  const totals = useMemo(
    () => offers.map((o) => ({ id: o.id, total: computeTotal(o) })),
    [offers]
  );

  const bestByTC = useMemo(
    () => [...totals].sort((a, b) => b.total - a.total)[0]?.id,
    [totals]
  );

  const requestRecommendation = async () => {
    if (offers.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const payload = offers.map((o) => ({
        id: o.id,
        company: o.company || "Unnamed",
        role: o.role || "Unnamed",
        totalCompensationYear1: computeTotal(o),
        baseSalary: o.baseSalary,
        signOnBonus: o.signOnBonus,
        annualBonusPct: o.annualBonusPct,
        equityTotal: o.equityTotal,
        vestYears: o.vestYears,
        benefitsValue: o.benefitsValue,
        commuteCostAnnual: o.commuteCostMonthly * 12,
        notes: o.notes,
      }));
      const res = await fetch("/api/ai/offer-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offers: payload, priorities }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setRec(data);
    } catch (e: any) {
      setError(e.message || "Could not get recommendation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumPage>
      <ApiKeyBanner className="mb-6" />
      <PremiumPageHeader
        eyebrow="Decision Tool"
        title="Job Offer Comparison"
        description="Stack offers side-by-side. We’ll compute year-1 total compensation and let AI pick the best fit for your priorities."
        icon={<Scale size={11} />}
      />

      <PremiumPanel className="p-5 mb-6">
        <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
          What matters most to you
        </label>
        <Textarea
          value={priorities}
          onChange={(e) => setPriorities(e.target.value)}
          placeholder="e.g. equity upside, remote-first, short commute, strong mentorship"
          rows={2}
          className="mt-1"
        />
      </PremiumPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {offers.map((o, i) => {
          const total = totals.find((t) => t.id === o.id)?.total || 0;
          const isBestTC = o.id === bestByTC;
          const isRecommended = rec?.recommendedOfferId === o.id;
          return (
            <PremiumPanel
              key={o.id}
              className={cn(
                "p-5 relative",
                isRecommended && "ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20"
              )}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                  <Crown size={10} /> AI Pick
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  Offer {i + 1}
                </span>
                {offers.length > 2 && (
                  <button
                    onClick={() => removeOffer(o.id)}
                    className="text-muted-foreground hover:text-rose-500"
                    aria-label="Remove offer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <Input
                  value={o.company}
                  onChange={(e) => updateOffer(o.id, { company: e.target.value })}
                  placeholder="Company"
                  className="font-bold"
                />
                <Input
                  value={o.role}
                  onChange={(e) => updateOffer(o.id, { role: e.target.value })}
                  placeholder="Role"
                />

                <Field label="Base salary">
                  <NumberInput
                    value={o.baseSalary}
                    onChange={(n) => updateOffer(o.id, { baseSalary: n })}
                    prefix="$"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Sign-on">
                    <NumberInput
                      value={o.signOnBonus}
                      onChange={(n) => updateOffer(o.id, { signOnBonus: n })}
                      prefix="$"
                    />
                  </Field>
                  <Field label="Annual bonus">
                    <NumberInput
                      value={o.annualBonusPct}
                      onChange={(n) => updateOffer(o.id, { annualBonusPct: n })}
                      suffix="%"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Equity (total)">
                    <NumberInput
                      value={o.equityTotal}
                      onChange={(n) => updateOffer(o.id, { equityTotal: n })}
                      prefix="$"
                    />
                  </Field>
                  <Field label="Vest years">
                    <NumberInput
                      value={o.vestYears}
                      onChange={(n) => updateOffer(o.id, { vestYears: n })}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Benefits value/yr">
                    <NumberInput
                      value={o.benefitsValue}
                      onChange={(n) => updateOffer(o.id, { benefitsValue: n })}
                      prefix="$"
                    />
                  </Field>
                  <Field label="Commute / mo">
                    <NumberInput
                      value={o.commuteCostMonthly}
                      onChange={(n) =>
                        updateOffer(o.id, { commuteCostMonthly: n })
                      }
                      prefix="$"
                    />
                  </Field>
                </div>
                <Field label="Notes">
                  <Textarea
                    value={o.notes}
                    onChange={(e) => updateOffer(o.id, { notes: e.target.value })}
                    placeholder="WFH 3 days/wk, strong tech mentorship, etc."
                    rows={2}
                  />
                </Field>
              </div>

              <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-3">
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  Year-1 total comp
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black">{formatUSD(total)}</span>
                  {isBestTC && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 rounded-full px-2 py-0.5">
                      Highest TC
                    </span>
                  )}
                </div>
              </div>
            </PremiumPanel>
          );
        })}

        {offers.length < 5 && (
          <button
            onClick={() => setOffers((prev) => [...prev, emptyOffer()])}
            className="flex items-center justify-center gap-2 min-h-[200px] rounded-lg border-2 border-dashed border-border hover:border-indigo-500 hover:bg-indigo-500/5 text-muted-foreground hover:text-indigo-500 transition-colors font-bold text-sm"
          >
            <Plus size={18} /> Add another offer
          </button>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {error && <p className="text-xs text-rose-500 mr-auto">{error}</p>}
        <Button
          onClick={requestRecommendation}
          disabled={loading || offers.length < 2}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Thinking…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> Get AI recommendation
            </>
          )}
        </Button>
      </div>

      {rec && (
        <PremiumPanel className="mt-6 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="text-indigo-500" size={18} />
            <h3 className="text-sm font-black uppercase tracking-widest">
              AI Recommendation
            </h3>
          </div>
          <p className="text-sm leading-6 text-foreground/90">{rec.reasoning}</p>

          {rec.tradeoffs.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Trade-offs
              </div>
              <ul className="space-y-1.5">
                {rec.tradeoffs.map((t, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rec.riskFlags.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
                <AlertTriangle size={12} /> Verify before accepting
              </div>
              <ul className="space-y-1.5">
                {rec.riskFlags.map((r, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </PremiumPanel>
      )}
    </PremiumPage>
  );
}

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
      {label}
    </label>
    <div className="mt-1">{children}</div>
  </div>
);
