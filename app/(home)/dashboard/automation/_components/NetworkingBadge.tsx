import React from "react";

export const stageBadgeColor = (stage?: string) => {
  const map: Record<string, string> = {
    applied:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    interviewing:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    offer:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    rejected:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  };
  return (
    map[stage || ""] || "bg-slate-100 text-slate-700"
  );
};

export const NetworkingReviewBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    approved:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    used:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
        map[status] || map.pending
      }`}
    >
      {status}
    </span>
  );
};
