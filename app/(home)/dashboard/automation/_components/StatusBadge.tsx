import React from "react";

export const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    drafted: "bg-slate-100 text-slate-700",
    tailored: "bg-indigo-100 text-indigo-700",
    reviewed: "bg-amber-100 text-amber-700",
    applied: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
        colors[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
};
