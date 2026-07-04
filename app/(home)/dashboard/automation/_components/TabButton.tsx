import React from "react";

export const TabButton = ({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
      active
        ? "bg-indigo-600 text-white"
        : "bg-background border text-muted-foreground hover:text-foreground"
    }`}
  >
    {icon}
    {label}
    {count !== undefined && count > 0 && (
      <span
        className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
          active
            ? "bg-white text-indigo-600"
            : "bg-indigo-100 text-indigo-600"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);
