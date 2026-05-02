import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "./_components/common/Header";

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
    <div
      className="w-full h-auto min-h-screen
     !bg-[#f8f8f8] dark:!bg-background"
    >
      <Header />
      <div>{children}</div>
    </div>
  );
};

export default MainLayout;
