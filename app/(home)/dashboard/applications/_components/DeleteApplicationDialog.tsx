"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader } from "lucide-react";

interface PropType {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  jobTitle: string;
}

const DeleteApplicationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting, 
  jobTitle 
}: PropType) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl p-8 border-none bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
            <AlertTriangle size={28} />
          </div>
          <div className="text-center space-y-2">
            <DialogTitle className="text-2xl font-black tracking-tight">Remove Application?</DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Are you sure you want to remove <span className="text-foreground font-bold italic">&quot;{jobTitle}&quot;</span>? This action cannot be undone.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button
            variant="destructive"
            className="w-full h-12 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 gap-2"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
            Yes, Remove from Pipeline
          </Button>
          <Button
            variant="ghost"
            className="w-full h-12 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteApplicationDialog;
