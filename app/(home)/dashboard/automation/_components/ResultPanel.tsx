import React from "react";
import { ExternalLink } from "lucide-react";
import { PremiumPanel } from "@/components/ui/premium-page";
import { GitHubResultPanel } from "./GitHubResultPanel";
import { LeetCodeResultPanel } from "./LeetCodeResultPanel";
import { NetworkResultPanel } from "./NetworkResultPanel";

export const ResultPanel = ({
  title,
  data,
}: {
  title: string;
  data: any;
}) => {
  if (data?.profile && data?.repositories)
    return <GitHubResultPanel data={data} />;
  if (data?.matchedUser) return <LeetCodeResultPanel data={data} />;
  if (data?.companyBrief) return <NetworkResultPanel data={data} />;
  return (
    <PremiumPanel className="p-6">
      <h2 className="mb-4 flex items-center gap-2 font-black">
        <ExternalLink size={16} className="text-indigo-500" /> {title}
      </h2>
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-[11px] leading-relaxed text-slate-200">
        {JSON.stringify(data, null, 2)}
      </pre>
    </PremiumPanel>
  );
};
