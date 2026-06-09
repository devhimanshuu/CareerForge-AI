"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Highlighter, Loader2, MessageSquarePlus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const sections = [
  { value: "summary", label: "Professional summary" },
  { value: "experience", label: "Experience" },
  { value: "skills", label: "Skills" },
  { value: "education", label: "Education" },
  { value: "portfolio", label: "Overall portfolio" },
] as const;

const ReviewPanel = ({ documentId }: { documentId: string }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [form, setForm] = useState({
    reviewerName: "",
    reviewerEmail: "",
    sectionId: "portfolio",
    selectedText: "",
    content: "",
  });

  const openCount = useMemo(() => comments.filter((comment) => comment.status === "open").length, [comments]);

  const loadComments = useCallback(async () => {
    const response = await fetch(`/api/collaboration/public/${documentId}`);
    if (!response.ok) return;
    const data = await response.json();
    setComments(data.comments || []);
  }, [documentId]);

  useEffect(() => {
    loadComments();
    const interval = window.setInterval(loadComments, 15000);
    return () => window.clearInterval(interval);
  }, [loadComments]);

  const captureSelection = () => {
    const selectedText = window.getSelection()?.toString().trim().slice(0, 1000) || "";
    setForm((current) => ({ ...current, selectedText }));
  };

  const submit = async () => {
    if (!form.reviewerName.trim() || !form.content.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/collaboration/public/${documentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Feedback could not be submitted");
      setForm((current) => ({ ...current, content: "", selectedText: "" }));
      await loadComments();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {open && (
        <div className="mb-4 flex h-[560px] w-[min(390px,calc(100vw-3rem))] flex-col overflow-hidden rounded-3xl border border-indigo-500/20 bg-background shadow-2xl shadow-indigo-500/10">
          <div className="flex items-center justify-between bg-slate-950 p-4 text-white">
            <div>
              <p className="text-sm font-black">Collaborative Review</p>
              <p className="text-[10px] text-slate-400">Leave section-level feedback for the candidate.</p>
            </div>
            <Button onClick={() => setOpen(false)} size="icon" variant="ghost" className="text-white hover:bg-white/10">
              <X size={16} />
            </Button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="space-y-3 rounded-2xl border bg-muted/20 p-4">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Your name" value={form.reviewerName} onChange={(event) => setForm({ ...form, reviewerName: event.target.value })} className="h-9 text-xs" />
                <Input placeholder="Email (optional)" type="email" value={form.reviewerEmail} onChange={(event) => setForm({ ...form, reviewerEmail: event.target.value })} className="h-9 text-xs" />
              </div>
              <select value={form.sectionId} onChange={(event) => setForm({ ...form, sectionId: event.target.value })} className="h-9 w-full rounded-md border bg-background px-3 text-xs font-semibold">
                {sections.map((section) => <option key={section.value} value={section.value}>{section.label}</option>)}
              </select>
              <Button onClick={captureSelection} variant="outline" size="sm" className="w-full gap-2 text-[10px] font-bold">
                <Highlighter size={13} />
                Attach highlighted page text
              </Button>
              {form.selectedText && <p className="line-clamp-3 rounded-lg bg-indigo-500/5 p-2 text-[10px] italic text-muted-foreground">&quot;{form.selectedText}&quot;</p>}
              <Textarea placeholder="Share specific, actionable feedback..." value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className="min-h-24 resize-none text-xs" />
              <Button onClick={submit} disabled={loading || !form.reviewerName.trim() || !form.content.trim()} className="w-full gap-2 bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send private feedback
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Shared review thread</p>
              {comments.length === 0 && <p className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">No feedback yet. Start the review.</p>}
              {comments.map((comment) => (
                <button
                  type="button"
                  key={comment.id}
                  onClick={() => document.getElementById(comment.sectionId)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  className={cn("w-full rounded-xl border p-3 text-left transition-colors hover:border-indigo-500/40", comment.status !== "open" && "opacity-60")}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-black">{comment.reviewerName}</p>
                    <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-indigo-500">{comment.sectionId}</span>
                  </div>
                  {comment.selectedText && <p className="mb-2 line-clamp-2 border-l-2 border-indigo-500 pl-2 text-[10px] italic text-muted-foreground">{comment.selectedText}</p>}
                  <p className="text-xs leading-relaxed">{comment.content}</p>
                  {comment.ownerReply && (
                    <p className="mt-2 rounded-lg bg-emerald-500/5 p-2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      Candidate reply: {comment.ownerReply}
                    </p>
                  )}
                  {comment.status === "resolved" && <p className="mt-2 flex items-center gap-1 text-[9px] font-bold uppercase text-emerald-500"><CheckCircle2 size={10} /> Resolved</p>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Button onClick={() => setOpen(!open)} className="relative h-14 rounded-full bg-slate-950 px-5 font-bold text-white shadow-2xl hover:bg-slate-800">
        <MessageSquarePlus size={18} className="mr-2" />
        Review
        {openCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1 text-[9px]">{openCount}</span>}
      </Button>
    </div>
  );
};

export default ReviewPanel;
