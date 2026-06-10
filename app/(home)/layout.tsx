import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ResumeInfoProvider } from "@/context/resume-info-provider";
import { SidebarProvider } from "@/context/sidebar-context";
import SidebarLayout from "@/components/sidebar/SidebarLayout";

const MainLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <ResumeInfoProvider>
      <SidebarProvider>
        <SidebarLayout>{children}</SidebarLayout>
      </SidebarProvider>
    </ResumeInfoProvider>
  );
};

export default MainLayout;
