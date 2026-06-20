"use client";

import React, { useEffect, useState } from "react";
import {
  PremiumPage,
  PremiumPageHeader,
  PremiumPanel,
} from "@/components/ui/premium-page";
import { Button } from "@/components/ui/button";
import { Check, Crown, Loader2, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTrackUsage } from "@/hooks/use-track-usage";
import { toast } from "@/hooks/use-toast";

type Tier = {
  id: "starter" | "pro" | "executive";
  name: string;
  monthly: number;
  yearly: number;
  highlight?: boolean;
  badge?: string;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 0,
    yearly: 0,
    features: [
      "1 active resume",
      "5 AI generations / day",
      "Basic templates",
      "PDF export",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 19,
    yearly: 190,
    highlight: true,
    badge: "Most popular",
    features: [
      "Unlimited resumes & branches",
      "Unlimited AI generations",
      "All premium templates",
      "ATS matcher + auto-tailor",
      "Real-time collaboration",
      "Culture Fit + Offer Compare",
    ],
  },
  {
    id: "executive",
    name: "Executive",
    monthly: 49,
    yearly: 490,
    features: [
      "Everything in Pro",
      "Job scraper agent",
      "Mock interview WebRTC",
      "Custom portfolio domain",
      "Priority support",
    ],
  },
];

export default function PricingPage() {
  const { track } = useTrackUsage();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [processing, setProcessing] = useState<string | null>(null);

  // Fire view_pricing exposure when the page mounts.
  useEffect(() => {
    track({ funnel: "pro", action: "view_pricing", featureId: "pricing-page" });
  }, [track]);

  const handleUpgrade = async (tier: Tier) => {
    if (tier.id === "starter") return;
    track({
      funnel: "pro",
      action: "click_upgrade",
      featureId: "pricing-page",
      variant: tier.id,
      metadata: { billing, price: billing === "monthly" ? tier.monthly : tier.yearly },
    });

    setProcessing(tier.id);
    // Stub checkout — replace with Stripe/LemonSqueezy in production.
    await new Promise((r) => setTimeout(r, 900));
    setProcessing(null);

    toast({
      title: `Checkout for ${tier.name}`,
      description: "Wire this button to your payment provider — tracking is live.",
    });
    // In production, only fire complete_payment after the webhook confirms.
    // Here we fire it on success-stub so the dashboard funnel populates.
    track({
      funnel: "pro",
      action: "complete_payment",
      featureId: "pricing-page",
      variant: tier.id,
      metadata: { billing, price: billing === "monthly" ? tier.monthly : tier.yearly },
    });
  };

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Upgrade"
        title="Pricing"
        description="Unlock unlimited AI, premium templates, and live collaboration."
        icon={<Crown size={11} />}
        action={
          <div className="flex items-center bg-muted/40 rounded-md p-0.5 border border-border/60">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={cn(
                  "px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded",
                  billing === b
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground"
                )}
              >
                {b === "monthly" ? "Monthly" : "Yearly · save 17%"}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        {TIERS.map((tier) => {
          const price = billing === "monthly" ? tier.monthly : tier.yearly;
          return (
            <PremiumPanel
              key={tier.id}
              className={cn(
                "p-6 relative flex flex-col",
                tier.highlight && "ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20"
              )}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                  <Sparkles size={10} /> {tier.badge}
                </div>
              )}

              <h3 className="text-sm font-black uppercase tracking-widest">{tier.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black">${price}</span>
                <span className="text-xs text-muted-foreground">
                  /{billing === "monthly" ? "mo" : "yr"}
                </span>
              </div>

              <ul className="mt-5 space-y-2 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="mt-0.5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "mt-6 w-full",
                  tier.highlight && "bg-indigo-600 hover:bg-indigo-700"
                )}
                variant={tier.highlight ? "default" : "outline"}
                onClick={() => handleUpgrade(tier)}
                disabled={processing === tier.id || tier.id === "starter"}
              >
                {processing === tier.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…
                  </>
                ) : tier.id === "starter" ? (
                  "Current plan"
                ) : (
                  <>
                    <Zap size={14} className="mr-2" /> Upgrade to {tier.name}
                  </>
                )}
              </Button>
            </PremiumPanel>
          );
        })}
      </div>

      <p className="mt-6 text-[11px] text-center text-muted-foreground">
        Tracking is wired:{" "}
        <code>view_pricing</code> → <code>click_upgrade</code> → <code>complete_payment</code> events
        land in <a href="/dashboard/usage-metrics" className="underline">Usage Metrics</a>.
      </p>
    </PremiumPage>
  );
}
