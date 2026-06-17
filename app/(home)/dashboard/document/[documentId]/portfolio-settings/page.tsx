"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PremiumPage, PremiumPageHeader, PremiumPanel } from "@/components/ui/premium-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Globe,
  BarChart,
  Palette,
  Save,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function PortfolioSettings() {
  const { documentId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doc, setDoc] = useState<any>(null);

  const [settings, setSettings] = useState({
    customDomain: "",
    analyticsId: "",
    template: "modern",
    slug: ""
  });

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`/api/document/${documentId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setDoc(json.data);
          setSettings({
            customDomain: json.data.customDomain || "",
            analyticsId: json.data.analyticsId || "",
            template: json.data.template || "modern",
            slug: json.data.slug || ""
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (documentId) fetchDoc();
  }, [documentId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          ...settings
        })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Settings saved!", description: "Your portfolio has been updated." });
      } else {
        toast({ title: "Error", description: json.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PremiumPage>
        <div className="h-64 rounded-3xl bg-muted/30 animate-pulse border border-border/50" />
      </PremiumPage>
    );
  }

  const portfolioUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${settings.slug || doc?.slug}`;

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Publishing"
        title="Portfolio Settings"
        description="Configure your custom domain, SEO, analytics, and visual theme."
        icon={<Globe size={13} />}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">
          <PremiumPanel className="p-6 md:p-8">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Globe className="text-indigo-500" size={20} /> Domain Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Portfolio Slug</label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                    /p/
                  </span>
                  <Input
                    value={settings.slug}
                    onChange={(e) => setSettings({ ...settings, slug: e.target.value })}
                    className="rounded-l-none rounded-r-xl"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Your default portfolio URL.</p>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custom Domain</label>
                <Input
                  value={settings.customDomain}
                  onChange={(e) => setSettings({ ...settings, customDomain: e.target.value })}
                  placeholder="e.g. janedoe.com"
                  className="rounded-xl"
                />
                <div className="flex items-start gap-2 mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <p>Custom domains require configuring a CNAME record pointing to our servers. Full DNS integration may require Vercel Domains API configuration.</p>
                </div>
              </div>
            </div>
          </PremiumPanel>

          <PremiumPanel className="p-6 md:p-8">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Palette className="text-pink-500" size={20} /> Visual Theme
            </h3>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Theme</label>
              <Select value={settings.template} onValueChange={(val) => setSettings({ ...settings, template: val })}>
                <SelectTrigger className="w-full rounded-xl bg-background border-border/50">
                  <SelectValue placeholder="Choose a theme" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="modern">Modern Light</SelectItem>
                  <SelectItem value="dark">Developer Dark</SelectItem>
                  <SelectItem value="glassmorphic">Creative Glassmorphic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PremiumPanel>

          <PremiumPanel className="p-6 md:p-8">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <BarChart className="text-emerald-500" size={20} /> Analytics & Tracking
            </h3>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Google Analytics ID</label>
              <Input
                value={settings.analyticsId}
                onChange={(e) => setSettings({ ...settings, analyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">Track your own visitors with a GA4 measurement ID.</p>
            </div>
          </PremiumPanel>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8"
            >
              {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
              Save Settings
            </Button>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="space-y-6">
          <PremiumPanel className="p-6 bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/20">
            <h3 className="font-bold text-sm mb-4">Live Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                <CheckCircle2 size={16} /> Online
              </div>
              <div className="pt-4 border-t border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Public URL</p>
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-indigo-500 hover:underline flex items-center gap-1 break-all"
                >
                  {portfolioUrl} <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </PremiumPanel>
        </div>

      </div>
    </PremiumPage>
  );
}
