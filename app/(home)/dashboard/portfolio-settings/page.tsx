"use client";

import React, { useEffect, useState } from "react";
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
  AlertTriangle,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PortfolioSettings() {
  const { toast } = useToast();

  const [docs, setDocs] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    customDomain: "",
    analyticsId: "",
    template: "modern",
    slug: ""
  });

  // Fetch all documents
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("/api/document/all"); 
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setDocs(json.data);
            if (json.data.length > 0) {
              setSelectedDocId(json.data[0].documentId);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDocs();
  }, []);

  // Update settings state when document selection changes
  useEffect(() => {
    const doc = docs.find(d => d.documentId === selectedDocId);
    if (doc) {
      setSettings({
        customDomain: doc.customDomain || "",
        analyticsId: doc.analyticsId || "",
        template: doc.template || "modern",
        slug: doc.slug || ""
      });
    }
  }, [selectedDocId, docs]);

  const handleSave = async () => {
    if (!selectedDocId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocId,
          ...settings
        })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Settings saved!", description: "Your portfolio has been updated." });
        // Update local state to reflect changes
        setDocs(docs.map(d => d.documentId === selectedDocId ? { ...d, ...settings } : d));
      } else {
        toast({ title: "Error", description: json.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const selectedDoc = docs.find(d => d.documentId === selectedDocId);
  const portfolioUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${settings.slug || selectedDoc?.slug}`;

  return (
    <PremiumPage>
      <PremiumPageHeader
        eyebrow="Publishing"
        title="Portfolio Generator"
        description="Turn your resume branches into stunning, SEO-optimized personal portfolio websites."
        icon={<Globe size={13} />}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          
          <PremiumPanel className="p-6 md:p-8 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <FileText className="text-indigo-500" size={20} /> Select Source Resume
            </h3>
            {loadingDocs ? (
              <div className="h-10 rounded-xl bg-muted/50 animate-pulse" />
            ) : (
              <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                <SelectTrigger className="w-full rounded-xl bg-background border-border/50">
                  <SelectValue placeholder="Choose a resume to publish" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {docs.map(d => (
                    <SelectItem key={d.documentId} value={d.documentId}>
                      {d.title} {d.branchName ? `(${d.branchName})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </PremiumPanel>

          {selectedDocId && (
            <>
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
                        onChange={(e) => setSettings({...settings, slug: e.target.value})}
                        className="rounded-l-none rounded-r-xl"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Your default portfolio URL path.</p>
                  </div>

                  <div className="space-y-2 pt-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custom Domain</label>
                    <Input 
                      value={settings.customDomain} 
                      onChange={(e) => setSettings({...settings, customDomain: e.target.value})}
                      placeholder="e.g. janedoe.com"
                      className="rounded-xl"
                    />
                    <div className="flex items-start gap-2 mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <p>Custom domains require configuring a CNAME record pointing to our servers.</p>
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
                  <Select value={settings.template} onValueChange={(val) => setSettings({...settings, template: val})}>
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
                    onChange={(e) => setSettings({...settings, analyticsId: e.target.value})}
                    placeholder="G-XXXXXXXXXX"
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">Track your own visitors with a GA4 measurement ID.</p>
                </div>
              </PremiumPanel>

              <div className="flex justify-end pb-8">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || !selectedDocId}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8"
                >
                  {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                  Save Settings
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar Status */}
        <div className="space-y-6">
          <PremiumPanel className="p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20">
            <h3 className="font-bold text-sm mb-4">Live Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                <CheckCircle2 size={16} /> Online
              </div>
              <div className="pt-4 border-t border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Public URL</p>
                {selectedDocId ? (
                  <a 
                    href={portfolioUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm font-bold text-indigo-500 hover:underline flex items-center gap-1 break-all"
                  >
                    {portfolioUrl} <ExternalLink size={12} />
                  </a>
                ) : (
                  <p className="text-xs text-muted-foreground">Select a resume first.</p>
                )}
              </div>
            </div>
          </PremiumPanel>
        </div>

      </div>
    </PremiumPage>
  );
}
