"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResumeContext } from "@/context/resume-info-provider";
import useUpdateDocument from "@/features/document/use-update-document";
import useOrigin from "@/hooks/use-origin";
import { toast } from "@/hooks/use-toast";
import { StatusType } from "@/types/resume.type";
import {
  Check,
  ChevronDown,
  Copy,
  Globe,
  Loader,
  ShareIcon,
  Settings2,
  ExternalLink,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useState } from "react";

const Share = () => {
  const param = useParams();
  const documentId = (param?.documentId as string) || "";

  const { resumeInfo, onUpdate, isLoading } = useResumeContext();
  const { mutateAsync, isPending } = useUpdateDocument();

  const origin = useOrigin();

  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState(resumeInfo?.slug || "");
  const [template, setTemplate] = useState(resumeInfo?.template || "modern");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with dynamic resume context once loaded
  React.useEffect(() => {
    if (resumeInfo) {
      setSlug(resumeInfo.slug || "");
      setTemplate(resumeInfo.template || "modern");
    }
  }, [resumeInfo]);

  // Fallback to internal preview link if no slug is set, otherwise use the public portfolio link
  const publicUrl = resumeInfo?.slug
    ? `${origin}/p/${resumeInfo.slug}`
    : `${origin}/preview/${documentId}/resume`;

  const onCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const handleStatusUpdate = useCallback(
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
            toast({
              title: "Success",
              description: `Status set to ${status} successfully`,
            });
          },
        },
      );
    },
    [mutateAsync, onUpdate, resumeInfo],
  );

  const handleSettingsUpdate = async () => {
    if (!resumeInfo) return;
    setIsSaving(true);
    try {
      await mutateAsync(
        {
          slug: slug.toLowerCase().replace(/\s+/g, "-"),
          template: template as any,
        },
        {
          onSuccess: () => {
            onUpdate({
              ...resumeInfo,
              slug: slug.toLowerCase().replace(/\s+/g, "-"),
              template: template as any,
            });
            toast({
              title: "Settings Updated",
              description: "Your portfolio link and template have been saved.",
            });
          },
        },
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger disabled={resumeInfo?.status === "archived"} asChild>
        <Button
          disabled={isLoading || resumeInfo?.status === "archived"}
          variant="secondary"
          className="bg-white border gap-1 dark:bg-gray-800 !p-2 lg:w-auto lg:p-4"
        >
          <div className="flex items-center gap-1">
            <ShareIcon size="17px" />
            <span className="hidden lg:inline">Share Portfolio</span>
          </div>
          <ChevronDown size="14px" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-background w-[320px] p-4"
        align="end"
        alignOffset={0}
      >
        {resumeInfo?.status === "public" ? (
          <div className="space-y-4">
            <div className="flex gap-x-2 items-center">
              <Globe size="16px" className="text-emerald-500 animate-pulse" />
              <p className="font-bold text-xs text-emerald-500 uppercase tracking-wider">
                Portfolio is Live
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 px-3 py-1.5 text-xs border rounded-lg bg-muted/50 truncate focus:outline-none"
                  readOnly
                  value={publicUrl}
                />
                <Button
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={onCopy}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shrink-0"
                  asChild
                >
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} />
                  </a>
                </Button>
              </div>
            </div>

            <hr className="border-border/50" />

            {/* Customization Settings */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <Settings2 size={14} className="text-muted-foreground" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Portfolio Settings
                </h4>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="slug"
                  className="text-[10px] font-bold uppercase"
                >
                  Custom Slug
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">/p/</span>
                  <Input
                    id="slug"
                    placeholder="your-name"
                    className="h-8 text-xs"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase">
                  Web Template
                </Label>
                <Select value={template} onValueChange={(v) => setTemplate(v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern Professional</SelectItem>
                    <SelectItem value="dark">Sleek Dark Mode</SelectItem>
                    <SelectItem value="glassmorphic">
                      Glassmorphic Glow
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="sm"
                className="w-full h-8 text-xs font-bold"
                onClick={handleSettingsUpdate}
                disabled={isSaving || isPending}
              >
                {(isSaving || isPending) && (
                  <Loader size={14} className="animate-spin mr-2" />
                )}
                Save Portfolio Settings
              </Button>
            </div>

            <hr className="border-border/50" />

            <Button
              size="sm"
              variant="ghost"
              className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors"
              onClick={() => handleStatusUpdate("private")}
              disabled={isPending}
            >
              Unpublish Portfolio
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-center justify-center py-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Globe size={24} />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-sm">Launch Your Portfolio</h5>
              <p className="text-xs text-muted-foreground px-2">
                Create a stunning, interactive personal website from your resume
                in one click.
              </p>
            </div>
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              onClick={() => handleStatusUpdate("public")}
              disabled={isPending}
            >
              {isPending && (
                <Loader size="14px" className="animate-spin mr-2" />
              )}
              Publish Now
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default Share;
