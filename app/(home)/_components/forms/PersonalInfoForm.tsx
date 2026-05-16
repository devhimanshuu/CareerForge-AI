import React, { useCallback, useEffect } from "react";
import { Loader, Sparkles } from "lucide-react";
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

  if (isLoading) {
    return <PersonalInfoSkeletonLoader />;
  }

  return (
    <div>
      <div className="w-full">
        <h2 className="font-bold text-lg">Personal Information</h2>
        <p className="text-sm">Get Started with the personal information</p>
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <div
            className="flex flex-col sm:flex-row items-center gap-6 mt-6 p-4 rounded-2xl bg-muted/30 border border-border/50"
          >
            <div className="relative group">
               <div className="w-24 h-24 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border/50 flex items-center justify-center">
                 {personalInfo?.userImage ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img 
                    src={personalInfo.userImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                   />
                 ) : (
                   <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest text-center px-2">No Photo</span>
                 )}
               </div>
               {personalInfo?.userImage && (
                 <button 
                  type="button"
                  onClick={() => handleChange({ target: { name: "userImage", value: "" } } as any)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   ×
                 </button>
               )}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold">Profile Photo</h3>
              <p className="text-xs text-muted-foreground max-w-[200px]">Add a professional photo to your resume for better visibility.</p>
              <div className="flex flex-wrap gap-2 mt-1">
                 <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="text-[10px] h-8 gap-1.5 border-indigo-500/30 hover:bg-indigo-500/5"
                  onClick={handleFetchGoogleImage}
                 >
                   <Sparkles size={12} className="text-indigo-500" />
                   Fetch Google Photo
                 </Button>
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-2 
          mt-5 gap-3"
          >
            <div>
              <Label className="text-sm">First Name</Label>
              <Input
                name="firstName"
                required
                autoComplete="off"
                placeholder=""
                value={personalInfo?.firstName || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="text-sm">Last Name</Label>
              <Input
                name="lastName"
                required
                autoComplete="off"
                placeholder=""
                value={personalInfo?.lastName || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-sm">Job Title</Label>
              <Input
                name="jobTitle"
                required
                autoComplete="off"
                placeholder=""
                value={personalInfo?.jobTitle || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-sm">Address</Label>
              <Input
                name="address"
                required
                autoComplete="off"
                placeholder=""
                value={personalInfo?.address || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-sm">Phone number</Label>
              <Input
                name="phone"
                required
                autoComplete="off"
                placeholder=""
                value={personalInfo?.phone || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-sm">Email</Label>
              <Input
                name="email"
                required
                autoComplete="off"
                placeholder=""
                value={personalInfo?.email || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button
            className="mt-4"
            type="submit"
            disabled={
              isPending || resumeInfo?.status === "archived" ? true : false
            }
          >
            {isPending && <Loader size="15px" className="animate-spin" />}
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
