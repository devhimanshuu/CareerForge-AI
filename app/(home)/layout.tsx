import React from "react"; // Rebuild trigger
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "./_components/common/Header";
import MobileCustomizer from "./_components/common/MobileCustomizer";
import { ResumeInfoProvider } from "@/context/resume-info-provider";

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
      <div className="w-full h-auto min-h-screen bg-background">
        <Header />
        <main>{children}</main>
        <MobileCustomizer />
      </div>
    </ResumeInfoProvider>
  );
};

export default MainLayout;
