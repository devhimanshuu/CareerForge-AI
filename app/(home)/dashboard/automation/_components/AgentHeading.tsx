import React from "react";

export const AgentHeading = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
      {icon}
    </div>
    <div>
      <h2 className="font-black">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);
