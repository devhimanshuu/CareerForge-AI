"use client";

import React from "react";
import AppSidebar from "@/components/sidebar/AppSidebar";
import MobileCustomizer from "@/app/(home)/_components/common/MobileCustomizer";

function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      {/* Main Content Area — flex-1 fills remaining space after sidebar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.32)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.28)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
        <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-indigo-500/[0.06] via-background to-background" />

        <main className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </main>

        <MobileCustomizer />
      </div>
    </div>
  );
}

export default SidebarLayout;
