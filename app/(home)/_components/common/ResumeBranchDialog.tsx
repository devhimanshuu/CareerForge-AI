"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GitBranch, Loader } from "lucide-react";
import useBranchDocument from "@/features/document/use-branch-document";

interface PropType {
  documentId: string;
  title: string;
  children: React.ReactNode;
}

const ResumeBranchDialog = ({ documentId, title, children }: PropType) => {
  const [branchName, setBranchName] = useState("");
  const { mutateAsync, isPending } = useBranchDocument(documentId);
  const [open, setOpen] = useState(false);

  const handleBranch = async () => {
    if (!branchName.trim()) return;
    try {
      await mutateAsync({ branchName });
      setOpen(false);
    } catch (error) {
      // toast is handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-500" />
            Branch Resume
          </DialogTitle>
          <DialogDescription>
            Create a targeted version of &quot;{title}&quot; for a specific role or application.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <Input
              id="branchName"
              placeholder="e.g. Frontend Role, Senior Dev, Manager"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBranch()}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={handleBranch}
            disabled={isPending || !branchName.trim()}
          >
            {isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
            Create Branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeBranchDialog;
