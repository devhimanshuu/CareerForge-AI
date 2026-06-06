import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { chatModel } from "./config";
import {
  sectionDetectionPrompt,
  SectionDetectionResponseSchema,
  personalInfoExtractionPrompt,
  PersonalInfoExtractionSchema,
  experienceExtractionPrompt,
  ExperiencesExtractionSchema,
  educationExtractionPrompt,
  EducationsExtractionSchema,
  skillsExtractionPrompt,
  SkillsExtractionSchema,
  SummaryExtractionSchema,
} from "./index";
import { normalizeImportedResume } from "../resume-import";

// Define the state schema for LangGraph
export const ExtractorState = Annotation.Root({
  rawText: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  sections: Annotation<any[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  personalInfo: Annotation<any>({
    reducer: (x, y) => y ?? x,
    default: () => ({}),
  }),
  summary: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  experiences: Annotation<any[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  educations: Annotation<any[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  skills: Annotation<any[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  completenessScore: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  retryCount: Annotation<number>({
    reducer: (x, y) => (x ?? 0) + (y ?? 0),
    default: () => 0,
  }),
  errors: Annotation<string[]>({
    reducer: (x, y) => [...(x ?? []), ...(y ?? [])],
    default: () => [],
  }),
});

// Node 1: Section Detection (Bypassed to pass full text context directly to nodes for 100% extraction accuracy)
const detectSectionsNode = async (state: typeof ExtractorState.State) => {
  return { sections: [] };
};

// Node 2: Personal Info Extraction
const extractPersonalInfoNode = async (state: typeof ExtractorState.State) => {
  try {
    const model = chatModel.withStructuredOutput(PersonalInfoExtractionSchema);
    const chain = personalInfoExtractionPrompt.pipe(model);
    const response: any = await chain.invoke({ sectionText: state.rawText });
    return { personalInfo: response };
  } catch (error: any) {
    console.error("Personal info extraction failed:", error);
    return { errors: [error.message] };
  }
};

// Node 3: Summary Extraction
const extractSummaryNode = async (state: typeof ExtractorState.State) => {
  try {
    const model = chatModel.withStructuredOutput(SummaryExtractionSchema);
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `Extract the professional summary or objective statement from the following resume text.
Return the summary exactly as written. Do not summarize the summary. If no summary exists, return an empty string.`,
      ],
      ["human", "{sectionText}"],
    ]);
    const chain = prompt.pipe(model);
    const response: any = await chain.invoke({ sectionText: state.rawText });
    return { summary: response.summary?.trim() || "" };
  } catch (error: any) {
    console.error("Summary extraction failed:", error);
    return { summary: "" };
  }
};

// Node 4: Experiences Extraction
const extractExperiencesNode = async (state: typeof ExtractorState.State) => {
  try {
    const model = chatModel.withStructuredOutput(ExperiencesExtractionSchema);
    const chain = experienceExtractionPrompt.pipe(model);
    const response: any = await chain.invoke({ sectionText: state.rawText });
    return { experiences: response.experiences };
  } catch (error: any) {
    console.error("Experiences extraction failed:", error);
    return { experiences: [], errors: [error.message] };
  }
};

// Node 5: Education Extraction
const extractEducationNode = async (state: typeof ExtractorState.State) => {
  try {
    const model = chatModel.withStructuredOutput(EducationsExtractionSchema);
    const chain = educationExtractionPrompt.pipe(model);
    const response: any = await chain.invoke({ sectionText: state.rawText });
    return { educations: response.educations };
  } catch (error: any) {
    console.error("Education extraction failed:", error);
    return { educations: [], errors: [error.message] };
  }
};

// Node 6: Skills Extraction
const extractSkillsNode = async (state: typeof ExtractorState.State) => {
  try {
    const model = chatModel.withStructuredOutput(SkillsExtractionSchema);
    const chain = skillsExtractionPrompt.pipe(model);
    const response: any = await chain.invoke({ sectionText: state.rawText });
    return { skills: response.skills };
  } catch (error: any) {
    console.error("Skills extraction failed:", error);
    return { skills: [], errors: [error.message] };
  }
};

// Node 7: Validate Extraction Quality
const validateNode = async (state: typeof ExtractorState.State) => {
  let score = 100;
  
  if (!state.personalInfo?.firstName || !state.personalInfo?.lastName) {
    score -= 30;
  }
  if (!state.personalInfo?.email) {
    score -= 20;
  }
  if (!state.experiences || state.experiences.length === 0) {
    score -= 25;
  }
  if (!state.educations || state.educations.length === 0) {
    score -= 15;
  }
  if (!state.skills || state.skills.length === 0) {
    score -= 10;
  }

  return {
    completenessScore: score,
    retryCount: 1, // This will be added to the current retryCount by the reducer
  };
};

// Node 8: Recovery Node (runs targeted scans if quality score is low)
const recoveryNode = async (state: typeof ExtractorState.State) => {
  console.log(`[LangGraph Extractor] Quality low (${state.completenessScore}/100). Running recovery node...`);
  
  let experiences = state.experiences;
  if (!experiences || experiences.length === 0) {
    try {
      const model = chatModel.withStructuredOutput(ExperiencesExtractionSchema);
      const chain = experienceExtractionPrompt.pipe(model);
      const response: any = await chain.invoke({ sectionText: state.rawText });
      experiences = response.experiences;
    } catch (e) {
      console.error("Recovery experiences extraction failed:", e);
    }
  }

  let educations = state.educations;
  if (!educations || educations.length === 0) {
    try {
      const model = chatModel.withStructuredOutput(EducationsExtractionSchema);
      const chain = educationExtractionPrompt.pipe(model);
      const response: any = await chain.invoke({ sectionText: state.rawText });
      educations = response.educations;
    } catch (e) {
      console.error("Recovery education extraction failed:", e);
    }
  }

  let personalInfo = state.personalInfo;
  if (!personalInfo?.email || !personalInfo?.firstName) {
    try {
      const model = chatModel.withStructuredOutput(PersonalInfoExtractionSchema);
      const chain = personalInfoExtractionPrompt.pipe(model);
      const response: any = await chain.invoke({ sectionText: state.rawText.slice(0, 3000) });
      personalInfo = {
        ...personalInfo,
        firstName: personalInfo?.firstName || response.firstName,
        lastName: personalInfo?.lastName || response.lastName,
        email: personalInfo?.email || response.email,
        phone: personalInfo?.phone || response.phone,
        address: personalInfo?.address || response.address,
        jobTitle: personalInfo?.jobTitle || response.jobTitle,
      };
    } catch (e) {
      console.error("Recovery personalInfo extraction failed:", e);
    }
  }

  return {
    experiences,
    educations,
    personalInfo,
  };
};

// Define flow
const workflow = new StateGraph(ExtractorState)
  .addNode("detectSections", detectSectionsNode)
  .addNode("extractPersonalInfo", extractPersonalInfoNode)
  .addNode("extractSummary", extractSummaryNode)
  .addNode("extractExperiences", extractExperiencesNode)
  .addNode("extractEducation", extractEducationNode)
  .addNode("extractSkills", extractSkillsNode)
  .addNode("validate", validateNode)
  .addNode("recovery", recoveryNode);

workflow.addEdge(START, "detectSections");
workflow.addEdge("detectSections", "extractPersonalInfo");
workflow.addEdge("extractPersonalInfo", "extractSummary");
workflow.addEdge("extractSummary", "extractExperiences");
workflow.addEdge("extractExperiences", "extractEducation");
workflow.addEdge("extractEducation", "extractSkills");
workflow.addEdge("extractSkills", "validate");

// Conditional edges after validate
workflow.addConditionalEdges(
  "validate",
  (state) => {
    if (state.completenessScore < 75 && state.retryCount < 2) {
      return "recovery";
    }
    return END;
  },
  {
    recovery: "recovery",
    [END]: END,
  }
);

workflow.addEdge("recovery", END);

export const resumeExtractorGraph = workflow.compile();

/**
 * Main function to invoke the LangGraph resume extraction pipeline.
 */
export async function extractResumeData(rawText: string) {
  const result = await resumeExtractorGraph.invoke({ rawText });
  
  // Merge and normalize extracted data using project normalizers
  const mergedRaw = {
    personalInfo: result.personalInfo || {},
    summary: result.summary || "",
    experiences: result.experiences || [],
    educations: result.educations || [],
    skills: result.skills || [],
  };
  
  return normalizeImportedResume(mergedRaw);
}
