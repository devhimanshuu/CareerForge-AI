import React, { useCallback, useEffect } from "react";
import { useResumeContext } from "@/context/resume-info-provider";
import { Button } from "@/components/ui/button";
import { Loader, Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import useUpdateDocument from "@/features/document/use-update-document";
import RichTextEditor from "@/components/editor";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { generateThumbnail } from "@/lib/helper";
import { toast } from "@/hooks/use-toast";
import VoiceToResume from "@/components/editor/VoiceToResume";


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

const ExperienceForm = (props: { handleNext: () => void }) => {
  const { handleNext } = props;
  const { resumeInfo, onUpdate } = useResumeContext();

  const { mutateAsync, isPending } = useUpdateDocument();

  // Give local ids for framer-motion reorder
  const [experienceList, setExperienceList] = React.useState(() => {
    const list = resumeInfo?.experiences?.length
      ? resumeInfo.experiences
      : [initialState];
    return list.map(item => ({ ...item, _localId: item.id || crypto.randomUUID() }));
  });

  // Sync from context when resumeInfo.experiences changes (e.g. after PDF import)
  useEffect(() => {
    const contextExperiences = resumeInfo?.experiences || [];
    if (!contextExperiences.length) return;
    if (!areListContentsEqual(experienceList, contextExperiences)) {
      setExperienceList(
        contextExperiences.map(item => ({
          ...item,
          _localId: item.id || crypto.randomUUID(),
        }))
      );
    }
  }, [resumeInfo?.experiences]);

  useEffect(() => {
    if (!resumeInfo) return;
    // Remove _localId before saving
    const cleanedList = experienceList.map(({ _localId, ...rest }) => rest);
    onUpdate({
      ...resumeInfo,
      experiences: cleanedList,
    });
  }, [experienceList]);

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
    setExperienceList([...experienceList, { ...initialState, _localId: crypto.randomUUID() }]);
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
    <div>
      <div className="w-full">
        <h2 className="font-bold text-lg">Professional Experience</h2>
        <p className="text-sm">Add previous job experience</p>
      </div>
      <form onSubmit={handleSubmit}>
        <Reorder.Group
          axis="y"
          values={experienceList}
          onReorder={setExperienceList}
          className="border w-full h-auto divide-y-[1px] rounded-md px-3 pb-4 my-5"
        >
          {experienceList?.map((item, index) => (
            <Reorder.Item
              key={item._localId}
              value={item}
              className="bg-background relative"
            >
              <div
                className="relative grid 
                  grid-cols-1 sm:grid-cols-2 mb-5 pt-4 gap-3
              "
              >
                <div className="absolute -left-6 top-6 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                  <GripVertical size="16px" />
                </div>
                {experienceList?.length > 1 && (
                  <Button
                    variant="secondary"
                    type="button"
                    className="size-[20px] text-center
                              rounded-full absolute -top-3 -right-5
                              !bg-black dark:!bg-gray-600 text-white
                              "
                    size="icon"
                    onClick={() => removeExperience(index)}
                  >
                    <X size="13px" />
                  </Button>
                )}

                <div>
                  <Label className="text-sm">Position title</Label>
                  <Input
                    name="title"
                    placeholder=""
                    required
                    value={item?.title || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>

                <div>
                  <Label className="text-sm">Company Name</Label>
                  <Input
                    name="companyName"
                    placeholder=""
                    required
                    value={item?.companyName || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>

                <div>
                  <Label className="text-sm">City</Label>
                  <Input
                    name="city"
                    placeholder=""
                    required
                    value={item?.city || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>

                <div>
                  <Label className="text-sm">State</Label>
                  <Input
                    name="state"
                    placeholder=""
                    required
                    value={item?.state || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>

                <div>
                  <Label className="text-sm">Start Date</Label>
                  <Input
                    name="startDate"
                    type="date"
                    placeholder=""
                    required
                    value={item?.startDate || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>

                <div>
                  <Label className="text-sm">End Date</Label>
                  <Input
                    name="endDate"
                    type="date"
                    placeholder=""
                    required
                    value={item?.endDate || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 mt-1">
                  {/* {Work Summary} */}
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">Work Summary</Label>
                    <VoiceToResume 
                        jobTitle={item.title || undefined}
                        onGenerated={(content) => handEditor(content, "workSummary", index)} 
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

              {index === experienceList.length - 1 &&
                experienceList.length < 5 && (
                  <Button
                    className="gap-1 mt-1 text-primary 
                          border-primary/50"
                    variant="outline"
                    type="button"
                    onClick={addNewExperience}
                  >
                    <Plus size="15px" />
                    Add More Experience
                  </Button>
                )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <Button className="mt-4" type="submit" disabled={isPending}>
          {isPending && <Loader size="15px" className="animate-spin" />}
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default ExperienceForm;
