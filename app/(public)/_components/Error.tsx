import { Button } from "@/components/ui/button";
import { FileText, ShieldX } from "lucide-react";
import React from "react";

const Error = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-6 px-5">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <ShieldX size="32px" className="text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          You don&apos;t have permission to view this resume. Please request access from the owner.
        </p>
        <Button className="min-w-48 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
          Request Access
        </Button>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <FileText size="12px" className="text-white" />
        </div>
        <span className="text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Resumify
        </span>
      </div>
    </div>
  );
};

export default Error;
