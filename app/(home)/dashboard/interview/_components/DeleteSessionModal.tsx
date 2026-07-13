"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteSessionModalProps {
  sessionToDelete: any;
  isDeletingSession: boolean;
  onClose: () => void;
  onConfirm: (sessionId: string) => void;
}

export const DeleteSessionModal = ({
  sessionToDelete,
  isDeletingSession,
  onClose,
  onConfirm,
}: DeleteSessionModalProps) => (
  <AnimatePresence>
    {sessionToDelete && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={() => !isDeletingSession && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-2xl border border-border/50 bg-background shadow-xl p-6 space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle size={20} className="text-destructive" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Delete Interview Session</h3>
              <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the{" "}
            <span className="font-bold text-foreground">{sessionToDelete.targetRole}</span>{" "}
            interview session from{" "}
            {new Date(sessionToDelete.createdAt).toLocaleDateString()}?
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isDeletingSession}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onConfirm(sessionToDelete.id)}
              disabled={isDeletingSession}
              className="rounded-xl gap-2"
            >
              {isDeletingSession ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Delete Session
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
