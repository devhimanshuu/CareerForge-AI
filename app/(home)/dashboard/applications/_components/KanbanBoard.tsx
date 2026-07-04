"use client";

import React from "react";
import {
  MoreVertical,
  Building2,
  ChevronRight,
  FileText,
  Network,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { STATUS_COLUMNS, StatusColumnId } from "./kanbanColumns";

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  documentId: string;
  status: string;
  notes?: string;
  [key: string]: any;
}

interface KanbanBoardProps {
  applications: Application[];
  onStatusUpdate: (id: number, status: string) => void;
  onAppClick: (app: Application) => void;
  onDeleteClick: (app: Application, e: React.MouseEvent) => void;
  onNetworkingClick: (app: Application, e?: React.MouseEvent) => void;
  networkingLoading: number | null;
}

export const KanbanBoard = ({
  applications,
  onStatusUpdate,
  onAppClick,
  onDeleteClick,
  onNetworkingClick,
  networkingLoading,
}: KanbanBoardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {STATUS_COLUMNS.map((column) => (
        <div key={column.id} className="flex flex-col gap-4 min-h-[500px]">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", column.color)} />
              <h3 className="font-bold text-sm uppercase tracking-widest">
                {column.label}
              </h3>
            </div>
            <span className="text-[10px] font-black text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {applications.filter((app) => app.status === column.id).length}
            </span>
          </div>

          <div className="flex-1 space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
            <AnimatePresence mode="popLayout">
              {applications
                .filter((app) => app.status === column.id)
                .map((app) => (
                  <motion.div
                    layout
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -2 }}
                    className="group relative cursor-pointer rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-indigo-500/40"
                    onClick={() => onAppClick(app)}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm leading-tight group-hover:text-indigo-500 transition-colors">
                          {app.jobTitle}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="text-muted-foreground/30 hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
                              <MoreVertical size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={(e) => onNetworkingClick(app, e)}
                              disabled={networkingLoading === app.id}
                            >
                              <Network size={14} />
                              Draft Outreach
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer"
                              onClick={(e) => onDeleteClick(app, e)}
                            >
                              <Trash2 size={14} />
                              Delete Job
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Building2 size={12} className="shrink-0" />
                        <span className="font-medium truncate">
                          {app.company}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase">
                          <FileText size={10} />
                          v{app.documentId.slice(-4)}
                        </div>
                        <div className="flex gap-1">
                          {STATUS_COLUMNS.filter((c) => c.id !== app.status)
                            .slice(0, 2)
                            .map((c) => (
                              <button
                                key={c.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusUpdate(app.id, c.id);
                                }}
                                className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all"
                              >
                                <ChevronRight size={10} />
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
};
