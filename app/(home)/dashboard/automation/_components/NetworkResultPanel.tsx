import React from "react";
import { Network } from "lucide-react";
import { PremiumPanel } from "@/components/ui/premium-page";

export const NetworkResultPanel = ({ data }: { data: any }) => (
  <PremiumPanel className="overflow-hidden p-0">
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950 px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_60%)]" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Network size={18} className="text-violet-300" />
          <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
            Outreach Kit
          </p>
        </div>
        {data.companyBrief && (
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {data.companyBrief}
          </p>
        )}
      </div>
    </div>
    <div className="space-y-4 px-6 py-5">
      {data.linkedinMessage && (
        <div>
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            LinkedIn Message
          </p>
          <div className="rounded-xl bg-slate-950 p-4 text-[11px] leading-relaxed text-slate-200 whitespace-pre-wrap">
            {data.linkedinMessage}
          </div>
        </div>
      )}
      {data.emailMessage && (
        <div>
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Email Draft
          </p>
          <div className="rounded-xl bg-slate-950 p-4 text-[11px] leading-relaxed text-slate-200 whitespace-pre-wrap">
            {data.emailMessage}
          </div>
        </div>
      )}
      {data.followUps?.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Follow-up Sequence
          </p>
          <div className="space-y-2">
            {data.followUps.map((msg: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border p-3"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-black text-violet-700">
                  {idx + 1}
                </span>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {msg}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </PremiumPanel>
);
