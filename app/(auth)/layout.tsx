import { FallingPattern } from "@/components/ui/falling-pattern";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <FallingPattern
          className="opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
          color="hsl(var(--primary))"
        />
      </div>

      <div className="absolute top-20 left-[15%] w-72 h-72 bg-indigo-500/10 rounded-full blur-[120px] animate-float z-0" />
      <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-float z-0" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 w-full flex items-center justify-center py-12 px-5">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
