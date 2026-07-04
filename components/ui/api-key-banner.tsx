"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type MissingKey = {
  key: string;
  label: string;
  docsUrl?: string;
};

const CHECKS: MissingKey[] = [
  { key: "TAVILY_API_KEY", label: "Live market search & job scraping", docsUrl: "https://tavily.com" },
  { key: "ELEVENLABS_API_KEY", label: "Audio synthesis & transcription", docsUrl: "https://elevenlabs.io" },
  { key: "GROQ_API_KEY", label: "AI transcription fallback", docsUrl: "https://console.groq.com" },
];

export function ApiKeyBanner({ className }: { className?: string }) {
  const [missing, setMissing] = useState<MissingKey[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/usage/status");
        if (res.ok) {
          const { missingKeys } = await res.json();
          setMissing(missingKeys || []);
        }
      } catch {
        // Silently fail — banner is non-critical
      }
    };
    check();
  }, []);

  if (missing.length === 0 || dismissed) return null;

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 pr-10 text-sm",
        className,
      )}
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-amber-600 hover:text-amber-700 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="space-y-1">
          <p className="font-bold text-amber-800 dark:text-amber-300">
            Some AI features are limited
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Add the following to your <code className="font-bold">.env</code> file to unlock full functionality:
          </p>
          <ul className="mt-2 space-y-0.5 text-xs">
            {CHECKS.filter((c) => missing.some((m) => m.key === c.key)).map((c) => (
              <li key={c.key} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <code className="font-mono font-bold text-amber-700 dark:text-amber-400">{c.key}</code>
                <span className="text-amber-600/80">— {c.label}</span>
                {c.docsUrl && (
                  <a
                    href={c.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-[10px] font-bold text-amber-600 underline hover:text-amber-700"
                  >
                    Get key
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
