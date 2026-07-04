import React from "react";

export const EmptyState = ({ text }: { text: string }) => (
  <p className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
    {text}
  </p>
);
