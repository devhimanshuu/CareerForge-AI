import React, { useCallback, useEffect, useState } from "react";
import { Loader, Plus, X, Zap, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeContext } from "@/context/resume-info-provider";
import useUpdateDocument from "@/features/document/use-update-document";
import { generateThumbnail } from "@/lib/helper";
import { toast } from "@/hooks/use-toast";
import { Reorder, useDragControls } from "framer-motion";
import { SkillType } from "@/types/resume.type";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

const SkillCard = ({
  item,
  index,
  skillsList,
  handleChange,
  removeSkill,
  isPending,
}: {
  item: LocalSkill;
  index: number;
  skillsList: LocalSkill[];
  handleChange: (value: string | number, name: string, index: number) => void;
  removeSkill: (index: number) => void;
  isPending: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const controls = useDragControls();

  const ratingLabels = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];
  const ratingColors = ["", "bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];
  const skillRating = item.rating || 0;

  return (
    <Reorder.Item
      key={item._localId}
      value={item}
      className="bg-background"
      dragListener={false}
      dragControls={controls}
    >
      <div className="section-card overflow-hidden mb-3">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            onPointerDown={(e) => controls.start(e)}
          >
            <GripVertical size={14} />
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black",
                  item.name && skillRating > 0
                    ? "bg-indigo-500/10 text-indigo-500"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-bold">
                  {item.name || `Skill ${index + 1}`}
                </p>
                {skillRating > 0 && (
                  <p className="text-[9px] font-bold text-muted-foreground">
                    {ratingLabels[skillRating]}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {skillRating > 0 && (
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                      key={dot}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors",
                        dot <= skillRating ? ratingColors[skillRating] : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              )}
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </div>
          </button>

          {skillsList.length > 1 && (
            <Button
              variant="ghost"
              type="button"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => removeSkill(index)}
            >
              <X size={12} />
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
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">
                    Skill Name
                  </Label>
                  <Input
                    name="name"
                    placeholder="e.g. React, TypeScript, Node.js"
                    required
                    autoComplete="off"
                    value={item.name || ""}
                    onChange={(e) =>
                      handleChange(e.target.value, "name", index)
                    }
                    className="h-9 rounded-xl border-border/50 focus-visible:ring-indigo-500/50 focus-visible:ring-2 transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">
                    Proficiency Level
                  </Label>
                  <div className="flex items-center gap-4">
                    <Rating
                      style={{ maxWidth: 140 }}
                      isDisabled={!item.name}
                      value={skillRating}
                      onChange={(value: number) =>
                        handleChange(value, "rating", index)
                      }
                    />
                    {skillRating > 0 && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "text-[10px] font-black px-2.5 py-1 rounded-full text-white",
                          ratingColors[skillRating]
                        )}
                      >
                        {ratingLabels[skillRating]}
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reorder.Item>
  );
};

const SkillsForm = () => {
  const { resumeInfo, onUpdate } = useResumeContext();
  const { mutateAsync, isPending } = useUpdateDocument();

  const [skillsList, setSkillsList] = React.useState<LocalSkill[]>(() => {
    const initial: SkillType[] = resumeInfo?.skills?.length
      ? resumeInfo.skills
      : [initialState];
    return initial.map((item) => ({
      ...item,
      _localId: item.id?.toString() || crypto.randomUUID(),
    }));
  });

  useEffect(() => {
    const contextSkills = resumeInfo?.skills || [];
    if (!contextSkills.length) return;
    setSkillsList((prev) => {
      if (areListContentsEqual(prev, contextSkills)) {
        return prev;
      }
      return contextSkills.map((item) => ({
        ...item,
        _localId: item.id?.toString() || crypto.randomUUID(),
      }));
    });
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
    setSkillsList([
      ...skillsList,
      { ...initialState, _localId: crypto.randomUUID() },
    ]);
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

  // Skill stats
  const filledSkills = skillsList.filter((s) => s.name).length;
  const avgRating =
    skillsList.filter((s) => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) /
    (skillsList.filter((s) => s.rating).length || 1);

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
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Zap size={16} className="text-emerald-500" />
            </div>
            Skills
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Showcase your technical and professional abilities
          </p>
        </div>
      </div>

      {/* Skill Stats */}
      <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-muted/30 border border-border/40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-[10px] font-bold text-muted-foreground">
            {filledSkills} Skills Added
          </span>
        </div>
        {avgRating > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-muted-foreground">
              Avg. Level: {Math.round(avgRating)}/5
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <Reorder.Group
          axis="y"
          values={skillsList}
          onReorder={setSkillsList}
          className="space-y-0"
        >
          {skillsList.map((item, index) => (
            <SkillCard
              key={item._localId}
              item={item}
              index={index}
              skillsList={skillsList}
              handleChange={handleChange}
              removeSkill={removeSkill}
              isPending={isPending}
            />
          ))}
        </Reorder.Group>

        {skillsList.length < 15 && (
          <Button
            className="gap-2 w-full h-11 rounded-xl border-dashed border-2 border-border/50 bg-transparent hover:bg-muted/30 text-muted-foreground hover:text-foreground font-bold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            variant="outline"
            type="button"
            disabled={isPending}
            onClick={addNewSkill}
          >
            <Plus size={16} />
            Add Another Skill
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
              Save & Done
              <span className="ml-1 text-xs opacity-70">✓</span>
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default SkillsForm;
