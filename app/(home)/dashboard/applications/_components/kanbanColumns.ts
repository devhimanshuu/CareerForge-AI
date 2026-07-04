import React from "react";
import { Clock, CheckCircle2, Calendar, Sparkles, AlertCircle } from "lucide-react";

export const STATUS_COLUMNS = [
  {
    id: "wishlist",
    label: "Wishlist",
    color: "bg-slate-500",
    icon: React.createElement(Clock, { size: 14 }),
  },
  {
    id: "applied",
    label: "Applied",
    color: "bg-blue-500",
    icon: React.createElement(CheckCircle2, { size: 14 }),
  },
  {
    id: "interviewing",
    label: "Interviewing",
    color: "bg-amber-500",
    icon: React.createElement(Calendar, { size: 14 }),
  },
  {
    id: "offer",
    label: "Offer",
    color: "bg-emerald-500",
    icon: React.createElement(Sparkles, { size: 14 }),
  },
  {
    id: "rejected",
    label: "Rejected",
    color: "bg-rose-500",
    icon: React.createElement(AlertCircle, { size: 14 }),
  },
] as const;

export type StatusColumnId = (typeof STATUS_COLUMNS)[number]["id"];
