import React, { useCallback, useEffect, useState } from "react";
import { useResumeContext } from "@/context/resume-info-provider";
import { Button } from "@/components/ui/button";
import { Loader, Plus, X, Briefcase, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import useUpdateDocument from "@/features/document/use-update-document";
import RichTextEditor from "@/components/editor";
import { Reorder, useDragControls } from "framer-motion";
import { generateThumbnail } from "@/lib/helper";
import { toast } from "@/hooks/use-toast";
import VoiceToResume from "@/components/editor/VoiceToResume";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const initialState = {
  id: undefined,
  docId: undefined,
  title: "",
  companyName: "",
  city: "",
  state: "",
  startDate: "",
  endDate: "",
  workSummary: "",
  currentlyWorking: false,
};

const areListContentsEqual = (listA: any[], listB: any[]) => {
  if (!listA || !listB) return false;
  if (listA.length !== listB.length) return false;
  for (let i = 0; i < listA.length; i++) {
    const itemA = listA[i];
    const itemB = listB[i];
    const keys = Array.from(new Set([...Object.keys(itemA), ...Object.keys(itemB)]));
    for (const key of keys) {
      if (key === "_localId") continue;
      const valA = itemA[key];
      const valB = itemB[key];
      const normalizedA = valA === null || valA === undefined ? "" : valA;
      const normalizedB = valB === null || valB === undefined ? "" : valB;
      if (normalizedA !== normalizedB) {
        return false;
      }
    }
  }
  return true;
};

const ExperienceCard = ({
  item,
  index,
  experienceList,
  handleChange,
  handEditor,
  removeExperience,
  isPending,
}: {
  item: any;
  index: number;
  experienceList: any[];
  handleChange: (e: any, index: number) => void;
  handEditor: (value: string, name: string, index: number) => void;
  removeExperience: (index: number) => void;
  isPending: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const controls = useDragControls();

  const isComplete = item.title && item.companyName;

  return (
    <Reorder.Item
      key={item._localId}
      value={item}
      className="bg-background"
      dragListener={false}
      dragControls={controls}
    >
      <div className="section-card overflow-hidden mb-4">
        {/* Card Header - Collapsible */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <div
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            onPointerDown={(e) => controls.start(e)}
          >
            <GripVertical size={16} />
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black",
                  isComplete
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-bold">
                  {item.title || `Experience ${index + 1}`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {item.companyName || "Company name"}
                </p>
              </div>
            </div>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {experienceList.length > 1 && (
            <Button
              variant="ghost"
              type="button"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => removeExperience(index)}
            >
              <X size={14} />
            </Button>
          )}
        </div>

        {/* Collapsible Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">
                      Position Title
                    </Label>
                    <Input
                      name="title"
                      placeholder="Software Engineer"
                      required
                      value={item?.title || ""}
                      onChange={(e) => handleChange(e, index)}
                      className="h-10 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">
                      Company Name
                    </Label>
                    <Input
                      name="companyName"
                      placeholder="Google"
                      required
                      value={item?.companyName || ""}
                      onChange={(e) => handleChange(e, index)}
                      className="h-10 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">
                      City
                    </Label>
                    <Input
                      name="city"
                      placeholder="San Francisco"
                      required
                      value={item?.city || ""}
                      onChange={(e) => handleChange(e, index)}
                      className="h-10 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">
                      State
                    </Label>
                    <Input
                      name="state"
                      placeholder="CA"
                      required
                      value={item?.state || ""}
                      onChange={(e) => handleChange(e, index)}
                      className="h-10 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">
                      Start Date
                    </Label>
                    <Input
                      name="startDate"
                      type="date"
                      required
                      value={item?.startDate || ""}
                      onChange={(e) => handleChange(e, index)}
                      className="h-10 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">
                      End Date
                    </Label>
                    <Input
                      name="endDate"
                      type="date"
                      required
                      value={item?.endDate || ""}
                      onChange={(e) => handleChange(e, index)}
                      className="h-10 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-muted-foreground">
                      Work Summary
                    </Label>
                    <VoiceToResume
                      jobTitle={item.title || undefined}
                      onGenerated={(content) =>
                        handEditor(content, "workSummary", index)
                      }
                    />
                  </div>
                  <RichTextEditor
                    jobTitle={item.title || undefined}
                    initialValue={item.workSummary || ""}
                    onEditorChange={(value: string) =>
                      handEditor(value, "workSummary", index)
                    }
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reorder.Item>
  );
};

const ExperienceForm = (props: { handleNext: () => void }) => {
  const { handleNext } = props;
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync, isPending } = useUpdateDocument();

  const [experienceList, setExperienceList] = React.useState(() => {
    const list = resumeInfo?.experiences?.length
      ? resumeInfo.experiences
      : [initialState];
    return list.map((item) => ({
      ...item,
      _localId: item.id || crypto.randomUUID(),
    }));
  });

  useEffect(() => {
    const contextExperiences = resumeInfo?.experiences || [];
    if (!contextExperiences.length) return;
    setExperienceList((prev) => {
      if (areListContentsEqual(prev, contextExperiences)) {
        return prev;
      }
      return contextExperiences.map((item) => ({
        ...item,
        _localId: item.id || crypto.randomUUID(),
      }));
    });
  }, [resumeInfo?.experiences]);

  useEffect(() => {
    if (!resumeInfo) return;
    const cleanedList = experienceList.map(({ _localId, ...rest }) => rest);
    onUpdate({
      ...resumeInfo,
      experiences: cleanedList,
    });
  }, [experienceList, onUpdate, resumeInfo]);

  const handleChange = (
    e: { target: { name: string; value: string } },
    index: number
  ) => {
    const { name, value } = e.target;
    setExperienceList((prevState) => {
      const newExperienceList = [...prevState];
      newExperienceList[index] = {
        ...newExperienceList[index],
        [name]: value,
      };
      return newExperienceList;
    });
  };

  const addNewExperience = () => {
    setExperienceList([
      ...experienceList,
      { ...initialState, _localId: crypto.randomUUID() },
    ]);
  };

  const removeExperience = (index: number) => {
    const updatedExperience = [...experienceList];
    updatedExperience.splice(index, 1);
    setExperienceList(updatedExperience);
  };

  const handEditor = (value: string, name: string, index: number) => {
    setExperienceList((prevState) => {
      const newExperienceList = [...prevState];
      newExperienceList[index] = {
        ...newExperienceList[index],
        [name]: value,
      };
      return newExperienceList;
    });
  };

  const handleSubmit = useCallback(
    async (e: { preventDefault: () => void }) => {
      e.preventDefault();
      const thumbnail = await generateThumbnail();
      const currentNo = resumeInfo?.currentPosition
        ? resumeInfo.currentPosition + 1
        : 1;

      await mutateAsync(
        {
          currentPosition: currentNo,
          thumbnail: thumbnail,
          experience: experienceList,
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Experience updated successfully",
            });
            handleNext();
          },
          onError() {
            toast({
              title: "Error",
              description: "Failed to update experience",
              variant: "destructive",
            });
          },
        }
      );
    },
    [resumeInfo, experienceList, handleNext, mutateAsync]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Briefcase size={16} className="text-blue-500" />
            </div>
            Professional Experience
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add your work experience, most recent first
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Reorder.Group
          axis="y"
          values={experienceList}
          onReorder={setExperienceList}
          className="space-y-0"
        >
          {experienceList?.map((item, index) => (
            <ExperienceCard
              key={item._localId}
              item={item}
              index={index}
              experienceList={experienceList}
              handleChange={handleChange}
              handEditor={handEditor}
              removeExperience={removeExperience}
              isPending={isPending}
            />
          ))}
        </Reorder.Group>

        {experienceList.length < 5 && (
          <Button
            className="gap-2 w-full h-11 rounded-xl border-dashed border-2 border-border/50 bg-transparent hover:bg-muted/30 text-muted-foreground hover:text-foreground font-bold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            variant="outline"
            type="button"
            onClick={addNewExperience}
          >
            <Plus size={16} />
            Add Another Experience
          </Button>
        )}

        <Button
          className="w-full h-11 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/10 mt-4"
          type="submit"
          disabled={isPending}
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

export default ExperienceForm;
