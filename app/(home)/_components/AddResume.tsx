"use client";
import useCreateDocument from "@/features/document/use-create-document";
import { FileText, Loader, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";

const AddResume = () => {
  const router = useRouter();
  const { isPending, mutate } = useCreateDocument();
  const onCreate = useCallback(() => {
    mutate(
      {
        title: "Untitled Resume",
      },
      {
        onSuccess: (response) => {
          const documentId = response.data.documentId;
          router.push(`/dashboard/document/${documentId}/edit`);
        },
      }
    );
  }, [mutate, router]);
  return (
    <>
      <div
        role="button"
        className="w-full cursor-pointer group"
        onClick={onCreate}
      >
        <div
          className="
            h-[220px] flex flex-col
            rounded-2xl gap-3 w-full
            items-center justify-center
            border-2 border-dashed border-border/60
            bg-card/30
            hover:border-indigo-500/50
            hover:bg-indigo-500/5
            transition-all duration-300
            dark:bg-card/20
          "
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-all duration-300">
            <Plus size="24px" className="text-indigo-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              New Resume
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Start from scratch
            </p>
          </div>
        </div>
      </div>
      {isPending && (
        <div
          className="fixed inset-0 z-[9999]
            flex flex-col gap-3
            items-center justify-center
            backdrop-blur-sm bg-background/60
          "
        >
          <div className="flex flex-col items-center gap-3 p-8 rounded-2xl glass border border-border/50">
            <Loader size="28px" className="animate-spin text-indigo-500" />
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles size="14px" className="text-indigo-500" />
              Creating your resume...
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddResume;
