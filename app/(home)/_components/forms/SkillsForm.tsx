import React, { useCallback, useEffect } from "react";
import { Loader, Plus, X } from "lucide-react";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeContext } from "@/context/resume-info-provider";
import useUpdateDocument from "@/features/document/use-update-document";
import { generateThumbnail } from "@/lib/helper";
import { toast } from "@/hooks/use-toast";
import { Reorder } from "framer-motion";
import { GripVertical } from "lucide-react";
import { SkillType } from "@/types/resume.type";

const initialState: SkillType = {
  name: "",
  rating: 0,
};

type LocalSkill = SkillType & {
  _localId: string;
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

const SkillsForm = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync, isPending } = useUpdateDocument();

  const [skillsList, setSkillsList] = React.useState<LocalSkill[]>(() => {
    const initial: SkillType[] = resumeInfo?.skills?.length ? resumeInfo.skills : [initialState];
    return initial.map((item) => ({
      ...item,
      _localId: item.id?.toString() || crypto.randomUUID(),
    }));
  });

  // Sync from context when resumeInfo.skills changes (e.g. after PDF import)
  useEffect(() => {
    const contextSkills = resumeInfo?.skills || [];
    if (!contextSkills.length) return;
    if (!areListContentsEqual(skillsList, contextSkills)) {
      setSkillsList(
        contextSkills.map((item) => ({
          ...item,
          _localId: item.id?.toString() || crypto.randomUUID(),
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeInfo?.skills]);

  useEffect(() => {
    if (!resumeInfo) {
      return;
    }
    const cleanedList = skillsList.map(({ _localId, ...rest }) => rest);
    onUpdate({
      ...resumeInfo,
      skills: cleanedList,
    });
  }, [skillsList, onUpdate, resumeInfo]);

  const handleChange = (
    value: string | number,
    name: string,
    index: number
  ) => {
    setSkillsList((prevState) => {
      const newSkillList = [...prevState];
      newSkillList[index] = {
        ...newSkillList[index],
        [name]: value,
      };
      return newSkillList;
    });
  };

  const addNewSkill = () => {
    setSkillsList([...skillsList, { ...initialState, _localId: crypto.randomUUID() }]);
  };

  const removeSkill = (index: number) => {
    const updatedSkills = [...skillsList];
    updatedSkills.splice(index, 1);
    setSkillsList(updatedSkills);
  };

  const handleSubmit = useCallback(
    async (e: { preventDefault: () => void }) => {
      e.preventDefault();
      const thumbnail = await generateThumbnail();
      const cleanedSkills = skillsList.map(({ _localId, ...rest }) => rest);

      await mutateAsync(
        {
          currentPosition: 1,
          thumbnail: thumbnail,
          skills: cleanedSkills,
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Skills updated successfully",
            });
          },
          onError() {
            toast({
              title: "Error",
              description: "Failed to update skills",
              variant: "destructive",
            });
          },
        }
      );
    },
    [skillsList, mutateAsync]
  );

  return (
    <div>
      <div className="w-full">
        <h2 className="font-bold text-lg">Skills</h2>
        <p className="text-sm">Add your skills information</p>
      </div>
      <form onSubmit={handleSubmit}>
        <Reorder.Group
          axis="y"
          values={skillsList}
          onReorder={setSkillsList}
          className="border w-full h-auto divide-y-[1px] rounded-md px-3 pb-4 my-5"
        >
          {skillsList.map((item, index) => (
            <Reorder.Item
              key={item._localId}
              value={item}
              className="bg-background relative"
            >
              <div
                className="relative flex 
                items-center pl-6
    justify-between mb-5 pt-4 gap-3"
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 mt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                  <GripVertical size="16px" />
                </div>
                {skillsList?.length > 1 && (
                  <Button
                    variant="secondary"
                    type="button"
                    className="size-[20px] text-center rounded-full absolute -top-3 -right-5 !bg-black dark:!bg-gray-600 text-white"
                    size="icon"
                    disabled={isPending}
                    onClick={() => removeSkill(index)}
                  >
                    <X size="13px" />
                  </Button>
                )}

                <div className="flex-1">
                  <Label className="text-sm">Name</Label>
                  <Input
                    name="name"
                    placeholder=""
                    required
                    autoComplete="off"
                    value={item.name || ""}
                    onChange={(e) =>
                      handleChange(e.target.value, "name", index)
                    }
                  />
                </div>

                <div className="shrink-0 pt-5">
                  <Rating
                    style={{ maxWidth: 120 }}
                    isDisabled={!item.name}
                    value={item?.rating || 0}
                    onChange={(value: number) =>
                      handleChange(value, "rating", index)
                    }
                  />
                </div>
              </div>

              {index === skillsList.length - 1 && skillsList.length < 15 && (
                <Button
                  className="gap-1 mt-1 text-primary 
                  border-primary/50"
                  variant="outline"
                  type="button"
                  disabled={isPending}
                  onClick={addNewSkill}
                >
                  <Plus size="15px" />
                  Add More Skills
                </Button>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <Button className="mt-4" type="submit" disabled={isPending}>
          {isPending && <Loader size="15px" className="animate-spin" />}
          Save & Done
        </Button>
      </form>
    </div>
  );
};

export default SkillsForm;
