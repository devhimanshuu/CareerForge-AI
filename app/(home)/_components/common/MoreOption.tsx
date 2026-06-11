import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResumeContext } from "@/context/resume-info-provider";
import useUpdateDocument from "@/features/document/use-update-document";
import { toast } from "@/hooks/use-toast";
import { GitBranch, Loader, MoreHorizontal, Redo, Trash2 } from "lucide-react";
import { StatusType } from "@/types/resume.type";
import ResumeBranchDialog from "./ResumeBranchDialog";


const MoreOption = () => {
  const router = useRouter();
  const { resumeInfo, isLoading, onUpdate } = useResumeContext();

  const { mutateAsync, isPending } = useUpdateDocument();

  const handleClick = useCallback(
    async (status: StatusType) => {
      if (!resumeInfo) return;
      await mutateAsync(
        {
          status: status,
        },
        {
          onSuccess: () => {
            onUpdate({
              ...resumeInfo,
              status: status,
            });
            router.replace(`/dashboard/`);
            toast({
              title: "Success",
              description: `Moved to trash successfully`,
            });
          },
          onError() {
            toast({
              title: "Error",
              description: "Failed to update status",
              variant: "destructive",
            });
          },
        }
      );
    },
    [mutateAsync, onUpdate, resumeInfo, router]
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white border
             dark:bg-gray-800"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => handleClick(resumeInfo?.status === "archived" ? "private" : "archived")}
            disabled={isPending}
            className="gap-2 cursor-pointer"
          >
            {resumeInfo?.status === "archived" ? (
              <>
                <Redo size="15px" />
                Restore resume
              </>
            ) : (
              <>
                <Trash2 size="15px" />
                Move to Trash
              </>
            )}
            {isPending && <Loader size="15px" className="animate-spin ml-auto" />}
          </DropdownMenuItem>

          <ResumeBranchDialog
            documentId={resumeInfo?.documentId || ""}
            title={resumeInfo?.title || ""}
          >
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="gap-2 cursor-pointer"
            >
              <GitBranch size="15px" />
              Branch Version
            </DropdownMenuItem>
          </ResumeBranchDialog>
        </DropdownMenuContent>

      </DropdownMenu>
    </>
  );
};

export default MoreOption;
