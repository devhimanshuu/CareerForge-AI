"use client";

import React from "react";

export const ConfigSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-lg border bg-background px-3 text-xs font-bold capitalize"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option.replaceAll("-", " ")}

        </option>
      ))}
    </select>
  </div>
);
