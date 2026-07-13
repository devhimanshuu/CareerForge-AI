"use client";

import React from "react";
import { Gauge, Trophy, ClipboardCheck, Radio } from "lucide-react";
import { PremiumStatCard } from "@/components/ui/premium-page";

type InterviewMode = "turn-based" | "live";

interface StatsBannerProps {
  evaluation: any;
  interviewMode: InterviewMode;
}

export const StatsBanner = ({ evaluation, interviewMode }: StatsBannerProps) => (
  <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
    <PremiumStatCard
      icon={<Gauge size={18} />}
      label="Delivery Score"
      value={evaluation ? `${evaluation.deliveryScore}%` : "--"}
      detail={evaluation ? "Communication clarity" : "Awaiting session"}
      tone="indigo"
    />
    <PremiumStatCard
      icon={<Trophy size={18} />}
      label="Content Score"
      value={evaluation ? `${evaluation.contentScore}%` : "--"}
      detail={evaluation ? "STAR method structured" : "Not measured"}
      tone="emerald"
    />
    <PremiumStatCard
      icon={<ClipboardCheck size={18} />}
      label="Action Items"
      value={evaluation ? String(evaluation.actionItems.length) : "0"}
      detail={evaluation ? "Recommendations" : "Clean slate"}
      tone="amber"
    />
    <PremiumStatCard
      icon={<Radio size={18} />}
      label="Interview Mode"
      value={interviewMode === "live" ? "Live" : "Turn"}
      detail={interviewMode === "live" ? "Real-time conversation" : "Record & submit"}
      tone="slate"
    />
  </div>
);
