import React from "react";
import { cn } from "@/lib/utils";

type PremiumPageProps = {
  children: React.ReactNode;
  className?: string;
};

type PremiumPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

type PremiumStatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  detail?: string;
  tone?: "indigo" | "emerald" | "amber" | "rose" | "slate";
};

const toneMap = {
  indigo: "bg-indigo-500/10 text-indigo-500 ring-indigo-500/15",
  emerald: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/15",
  amber: "bg-amber-500/10 text-amber-500 ring-amber-500/15",
  rose: "bg-rose-500/10 text-rose-500 ring-rose-500/15",
  slate: "bg-slate-500/10 text-slate-500 ring-slate-500/15",
};

export const PremiumPage = ({ children, className }: PremiumPageProps) => {
  return (
    <div className={cn("w-full min-h-full", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
};

export const PremiumPageHeader = ({
  eyebrow,
  title,
  description,
  icon,
  action,
}: PremiumPageHeaderProps) => {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-border/60 pb-7 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-border/70 bg-background/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground shadow-sm">
          {icon}
          {eyebrow}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
};

export const PremiumPanel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={cn(
        "rounded-lg border border-border/70 bg-card/85 shadow-sm shadow-black/[0.02]",
        className
      )}
    >
      {children}
    </section>
  );
};

export const PremiumStatCard = ({
  icon,
  label,
  value,
  detail,
  tone = "indigo",
}: PremiumStatCardProps) => {
  return (
    <PremiumPanel className="p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-md ring-1",
            toneMap[tone]
          )}
        >
          {icon}
        </div>
        {detail ? (
          <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {detail}
          </span>
        ) : null}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-2xl font-black tracking-tight text-foreground">
        {value}
      </div>
    </PremiumPanel>
  );
};
