import React, { useCallback, useEffect, useState } from "react";
import { Loader, Sparkles, Upload, User, Camera, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useResumeContext } from "@/context/resume-info-provider";
import { PersonalInfoType } from "@/types/resume.type";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PersonalInfoSkeletonLoader from "@/components/skeleton-loader/personal-info-loader";
import { generateThumbnail } from "@/lib/helper";
import useUpdateDocument from "@/features/document/use-update-document";
import { toast } from "@/hooks/use-toast";
import AIPhotoGenerator from "../common/AIPhotoGenerator";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const initialState = {
  id: undefined,
  firstName: "",
  lastName: "",
  jobTitle: "",
  address: "",
  phone: "",
  email: "",
  userImage: "",
};

const PersonalInfoForm = (props: { handleNext: () => void }) => {
  const { handleNext } = props;
  const { resumeInfo, isLoading, onUpdate } = useResumeContext();
  const { mutateAsync, isPending } = useUpdateDocument();
  const { user } = useUser();
  const [showPhotoSection, setShowPhotoSection] = useState(true);

  const handleFetchGoogleImage = useCallback(() => {
    if (!user?.imageUrl) return;

    setPersonalInfo((prev) => ({ ...prev, userImage: user.imageUrl }));
    if (!resumeInfo) return;
    onUpdate({
      ...resumeInfo,
      personalInfo: {
        ...resumeInfo.personalInfo,
        userImage: user.imageUrl,
      },
    });
    toast({
      title: "Success",
      description: "Google profile image fetched!",
    });
  }, [user, resumeInfo, onUpdate]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPersonalInfo((prev) => ({ ...prev, userImage: base64String }));
        if (!resumeInfo) return;
        onUpdate({
          ...resumeInfo,
          personalInfo: {
            ...resumeInfo.personalInfo,
            userImage: base64String,
          },
        });
        toast({
          title: "Success",
          description: "Photo uploaded!",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const [personalInfo, setPersonalInfo] =
    React.useState<PersonalInfoType>(initialState);

  useEffect(() => {
    if (!resumeInfo) {
      return;
    }
    if (resumeInfo?.personalInfo) {
      setPersonalInfo({
        ...(resumeInfo?.personalInfo || initialState),
      });
    }
  }, [resumeInfo, resumeInfo?.personalInfo]);

  const handleChange = useCallback(
    (e: { target: { name: string; value: string } }) => {
      const { name, value } = e.target;

      setPersonalInfo((prev) => ({ ...prev, [name]: value }));
      if (!resumeInfo) return;
      onUpdate({
        ...resumeInfo,
        personalInfo: {
          ...resumeInfo.personalInfo,
          [name]: value,
        },
      });
    },
    [resumeInfo, onUpdate]
  );

  const handleSubmit = useCallback(
    async (e: { preventDefault: () => void }) => {
      e.preventDefault();

      const thumbnail = await generateThumbnail();
      const currentNo = resumeInfo?.currentPosition
        ? resumeInfo?.currentPosition + 1
        : 1;
      await mutateAsync(
        {
          currentPosition: currentNo,
          thumbnail: thumbnail,
          personalInfo: personalInfo,
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "PersonalInfo updated successfully",
            });
            handleNext();
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update personal information",
              variant: "destructive",
            });
          },
        }
      );
    },
    [resumeInfo, personalInfo, handleNext, mutateAsync]
  );

  // Field completion tracking
  const fieldsCompleted = [
    personalInfo.firstName,
    personalInfo.lastName,
    personalInfo.jobTitle,
    personalInfo.email,
    personalInfo.phone,
  ].filter(Boolean).length;
  const totalFields = 5;
  const completionPct = Math.round((fieldsCompleted / totalFields) * 100);

  if (isLoading) {
    return <PersonalInfoSkeletonLoader />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div>
        <h2 className="font-bold text-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <User size={16} className="text-indigo-500" />
          </div>
          Personal Information
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Get started with your personal details
        </p>
      </div>

      {/* Completion Indicator */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/30 border border-border/40">
        <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-[10px] font-black text-muted-foreground tabular-nums">
          {fieldsCompleted}/{totalFields}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Section - Collapsible */}
        <div className="section-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPhotoSection(!showPhotoSection)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Camera size={14} className="text-muted-foreground" />
              <span className="text-sm font-bold">Profile Photo</span>
              {personalInfo?.userImage && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Check size={8} /> Added
                </span>
              )}
            </div>
            {showPhotoSection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <AnimatePresence>
            {showPhotoSection && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border/50 flex items-center justify-center transition-all duration-300 group-hover:border-indigo-500/50">
                      {personalInfo?.userImage ? (
                        <img
                          src={personalInfo.userImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest text-center px-2">
                          No Photo
                        </span>
                      )}
                    </div>
                    {personalInfo?.userImage && (
                      <button
                        type="button"
                        onClick={() =>
                          handleChange({
                            target: { name: "userImage", value: "" },
                          } as any)
                        }
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-bold">Add a professional photo</h3>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      A good photo increases recruiter engagement by 40%.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-8 gap-1.5 border-border/50 hover:bg-muted transition-all hover:scale-105 active:scale-95"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={12} />
                        Upload Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-8 gap-1.5 border-indigo-500/30 hover:bg-indigo-500/5 transition-all hover:scale-105 active:scale-95"
                        onClick={handleFetchGoogleImage}
                      >
                        <Sparkles size={12} className="text-indigo-500" />
                        Fetch Google Photo
                      </Button>
                      <AIPhotoGenerator />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Basic Info Fields - Card Based */}
        <div className="section-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Basic Information
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">First Name</Label>
              <Input
                name="firstName"
                required
                autoComplete="off"
                placeholder="John"
                value={personalInfo?.firstName || ""}
                onChange={handleChange}
                className="h-10 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 focus-visible:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Last Name</Label>
              <Input
                name="lastName"
                required
                autoComplete="off"
                placeholder="Doe"
                value={personalInfo?.lastName || ""}
                onChange={handleChange}
                className="h-10 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 focus-visible:border-indigo-500 transition-all"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Job Title</Label>
              <Input
                name="jobTitle"
                required
                autoComplete="off"
                placeholder="Senior Software Engineer"
                value={personalInfo?.jobTitle || ""}
                onChange={handleChange}
                className="h-10 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 focus-visible:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Contact Info Fields */}
        <div className="section-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Contact Details
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Address</Label>
              <Input
                name="address"
                required
                autoComplete="off"
                placeholder="San Francisco, CA"
                value={personalInfo?.address || ""}
                onChange={handleChange}
                className="h-10 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 focus-visible:border-indigo-500 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Phone</Label>
                <Input
                  name="phone"
                  required
                  autoComplete="off"
                  placeholder="+1 (555) 000-0000"
                  value={personalInfo?.phone || ""}
                  onChange={handleChange}
                  className="h-10 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 focus-visible:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Email</Label>
                <Input
                  name="email"
                  required
                  autoComplete="off"
                  type="email"
                  placeholder="john@example.com"
                  value={personalInfo?.email || ""}
                  onChange={handleChange}
                  className="h-10 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 focus-visible:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          className="w-full h-11 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/10"
          type="submit"
          disabled={isPending || resumeInfo?.status === "archived"}
        >
          {isPending ? (
            <Loader size="15px" className="animate-spin" />
          ) : (
            <>
              Save & Continue
              <span className="ml-1 text-xs opacity-70">→</span>
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default PersonalInfoForm;
