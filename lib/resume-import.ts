import {
  EducationType,
  ExperienceType,
  PersonalInfoType,
  SkillType,
} from "@/types/resume.type";

export type ImportedResumeData = {
  personalInfo: PersonalInfoType;
  summary: string;
  experiences: ExperienceType[];
  educations: EducationType[];
  skills: SkillType[];
};

const MONTHS: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

const valueAt = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const asRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
};

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
};

const toStringValue = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.map(toStringValue).filter(Boolean).join(", ");
  return String(value).trim();
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const stripHtml = (value: string) => {
  return value.replace(/<[^>]+>/g, " ");
};

const toBulletHtml = (value: unknown) => {
  const entries: unknown[] = Array.isArray(value)
    ? value
    : toStringValue(value)
        .split(/\n|•|-{1,2}\s|\*\s/g)
        .map((entry) => entry.trim());

  const bullets = entries
    .map((entry) => stripHtml(toStringValue(entry)).replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (!bullets.length) return "";

  return `<ul>${bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`;
};

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
};

const splitLocation = (location: string) => {
  const [city = "", state = ""] = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return { city, state };
};

const SECTION_HEADINGS = [
  "summary",
  "profile",
  "objective",
  "experience",
  "work experience",
  "professional experience",
  "employment",
  "education",
  "academic background",
  "skills",
  "technical skills",
  "projects",
  "certifications",
  "awards",
  "languages",
];

const normalizeTextLines = (rawText: string) => {
  return rawText
    .replace(/\r/g, "\n")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
};

const isSectionHeading = (line: string) => {
  const normalized = line.toLowerCase().replace(/[:\-]+$/g, "").trim();
  return SECTION_HEADINGS.includes(normalized);
};

const findSectionLines = (
  lines: string[],
  startsWith: string[],
  stopAt: string[] = SECTION_HEADINGS
) => {
  const startIndex = lines.findIndex((line) => {
    const normalized = line.toLowerCase().replace(/[:\-]+$/g, "").trim();
    return startsWith.includes(normalized);
  });

  if (startIndex < 0) return [];

  const result: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const normalized = lines[index].toLowerCase().replace(/[:\-]+$/g, "").trim();
    if (stopAt.includes(normalized)) break;
    result.push(lines[index]);
  }

  return result;
};

const uniqueStrings = (items: string[]) => {
  return Array.from(
    new Set(items.map((item) => item.trim()).filter(Boolean))
  );
};

const pickNameLine = (lines: string[]) => {
  return (
    lines.find((line) => {
      if (isSectionHeading(line)) return false;
      if (/@|www\.|https?:|linkedin|github|\d/.test(line.toLowerCase())) {
        return false;
      }
      const words = line.split(/\s+/);
      return words.length >= 2 && words.length <= 5 && line.length <= 60;
    }) || ""
  );
};

export const toDateInputValue = (value: unknown) => {
  const raw = toStringValue(value)
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!raw || /present|current|now|ongoing/i.test(raw)) return null;

  const iso = raw.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
  if (iso) {
    const [, year, month, day = "01"] = iso;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const slash = raw.match(/^(\d{1,2})[/-](\d{4})$/);
  if (slash) {
    const [, month, year] = slash;
    return `${year}-${month.padStart(2, "0")}-01`;
  }

  const monthYear = raw.match(/^([A-Za-z]+)\.?[,]?\s+(\d{4})$/);
  if (monthYear) {
    const [, monthName, year] = monthYear;
    const month = MONTHS[monthName.toLowerCase()];
    if (month) return `${year}-${month}-01`;
  }

  const year = raw.match(/^(\d{4})$/);
  if (year) return `${year[1]}-01-01`;

  return null;
};

export const extractJsonObject = (text: string) => {
  const cleaned = text.replace(/```json/gi, "```").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  if (start < 0) return "";

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < cleaned.length; index += 1) {
    const char = cleaned[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return cleaned.slice(start, index + 1);
  }

  return "";
};

export const normalizeImportedResume = (payload: unknown): ImportedResumeData => {
  const source = asRecord(payload);
  const rawPersonal = asRecord(
    valueAt(source, ["personalInfo", "personal", "contact", "contactInfo"])
  );
  const nameParts = splitName(
    toStringValue(valueAt(rawPersonal, ["fullName", "name", "candidateName"]))
  );

  const personalInfo: PersonalInfoType = {
    firstName:
      toStringValue(valueAt(rawPersonal, ["firstName", "givenName"])) ||
      nameParts.firstName,
    lastName:
      toStringValue(valueAt(rawPersonal, ["lastName", "familyName", "surname"])) ||
      nameParts.lastName,
    jobTitle: toStringValue(
      valueAt(rawPersonal, ["jobTitle", "headline", "title", "currentRole"])
    ),
    address: toStringValue(
      valueAt(rawPersonal, ["address", "location", "city", "place"])
    ),
    phone: toStringValue(valueAt(rawPersonal, ["phone", "phoneNumber", "mobile"])),
    email: toStringValue(valueAt(rawPersonal, ["email", "emailAddress"])),
  };

  const experiences = asArray(
    valueAt(source, [
      "experiences",
      "experience",
      "workExperience",
      "professionalExperience",
      "employment",
    ])
  )
    .map((entry) => {
      const exp = asRecord(entry);
      const location = splitLocation(
        toStringValue(valueAt(exp, ["location", "place", "companyLocation"]))
      );
      const endDateSource = valueAt(exp, ["endDate", "end", "to"]);
      const endText = toStringValue(endDateSource);

      return {
        title: toStringValue(valueAt(exp, ["title", "jobTitle", "position", "role"])),
        companyName: toStringValue(
          valueAt(exp, ["companyName", "company", "employer", "organization"])
        ),
        city: toStringValue(valueAt(exp, ["city"])) || location.city,
        state: toStringValue(valueAt(exp, ["state", "region"])) || location.state,
        startDate: toDateInputValue(valueAt(exp, ["startDate", "start", "from"])),
        endDate: toDateInputValue(endDateSource),
        currentlyWorking:
          Boolean(valueAt(exp, ["currentlyWorking", "current", "isCurrent"])) ||
          /present|current|now|ongoing/i.test(endText),
        workSummary: toBulletHtml(
          valueAt(exp, ["workSummary", "summary", "description", "responsibilities", "bullets", "achievements"])
        ),
      };
    })
    .filter((exp) => exp.title || exp.companyName || exp.workSummary);

  const educations = asArray(
    valueAt(source, ["educations", "education", "academicBackground", "academics"])
  )
    .map((entry) => {
      const edu = asRecord(entry);
      return {
        universityName: toStringValue(
          valueAt(edu, ["universityName", "school", "institution", "college", "university"])
        ),
        degree: toStringValue(valueAt(edu, ["degree", "qualification"])),
        major: toStringValue(valueAt(edu, ["major", "field", "fieldOfStudy", "specialization"])),
        startDate: toDateInputValue(valueAt(edu, ["startDate", "start", "from"])),
        endDate: toDateInputValue(valueAt(edu, ["endDate", "end", "to", "graduationDate"])),
        description: toStringValue(valueAt(edu, ["description", "summary", "details"])),
      };
    })
    .filter((edu) => edu.universityName || edu.degree || edu.major);

  const skills = asArray(valueAt(source, ["skills", "technicalSkills", "coreSkills"]))
    .flatMap((entry) => {
      if (typeof entry === "string") return entry.split(/,|\n|•/g);
      return [entry];
    })
    .map((entry) => {
      const skill = asRecord(entry);
      const name = toStringValue(skill.name ?? skill.skill ?? entry);
      const rating = Number(skill.rating ?? skill.level ?? 4);

      return {
        name,
        rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, rating)) : 4,
      };
    })
    .filter((skill) => skill.name);

  return {
    personalInfo,
    summary: toStringValue(
      valueAt(source, ["summary", "professionalSummary", "profile", "objective"])
    ),
    experiences,
    educations,
    skills,
  };
};

export const parseResumeTextFallback = (rawText: string): ImportedResumeData => {
  const lines = normalizeTextLines(rawText);
  const email = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone =
    rawText.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.replace(/\s+/g, " ") || "";
  const nameParts = splitName(pickNameLine(lines));
  const nameLineIndex = lines.findIndex((line) => line === pickNameLine(lines));
  const jobTitle =
    lines
      .slice(Math.max(0, nameLineIndex + 1), nameLineIndex + 5)
      .find((line) => {
        if (isSectionHeading(line)) return false;
        if (line.includes("@") || /\d{4}/.test(line)) return false;
        return line.length <= 90;
      }) || "";

  const summaryLines = findSectionLines(lines, ["summary", "profile", "objective"]);
  const skillLines = findSectionLines(lines, ["skills", "technical skills"]);
  const educationLines = findSectionLines(lines, ["education", "academic background"]);
  const experienceLines = findSectionLines(lines, [
    "experience",
    "work experience",
    "professional experience",
    "employment",
  ]);

  const skills = uniqueStrings(
    skillLines.flatMap((line) => line.split(/,|;|\||•|\u2022/g))
  )
    .slice(0, 30)
    .map((name) => ({ name, rating: 4 }));

  const educations = educationLines.length
    ? [
        {
          universityName: educationLines[0] || "",
          degree: educationLines[1] || "",
          major: educationLines[2] || "",
          startDate: toDateInputValue(educationLines.join(" ").match(/\b(19|20)\d{2}\b/)?.[0]),
          endDate: toDateInputValue(
            educationLines
              .join(" ")
              .match(/\b(19|20)\d{2}\b/g)
              ?.slice(-1)[0]
          ),
          description: educationLines.slice(3).join(" "),
        },
      ].filter((edu) => edu.universityName || edu.degree)
    : [];

  const experienceDateMatches = experienceLines
    .join(" ")
    .match(
      /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\b(?:19|20)\d{2}\b)[\w\s,.\/-]*(?:Present|Current|Now|(?:19|20)\d{2})?/gi
    );

  const experiences = experienceLines.length
    ? [
        {
          title: experienceLines[0] || "",
          companyName: experienceLines[1] || "",
          city: "",
          state: "",
          startDate: toDateInputValue(experienceDateMatches?.[0]),
          endDate: toDateInputValue(experienceDateMatches?.slice(-1)[0]),
          currentlyWorking: /present|current|now/i.test(experienceLines.join(" ")),
          workSummary: toBulletHtml(experienceLines.slice(2)),
        },
      ].filter((exp) => exp.title || exp.companyName || exp.workSummary)
    : [];

  return {
    personalInfo: {
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      jobTitle,
      address: "",
      phone,
      email,
    },
    summary: summaryLines.slice(0, 4).join(" "),
    experiences,
    educations,
    skills,
  };
};

export const parseImportedResumeResponse = (
  rawText: string,
  aiResponseText: string
): ImportedResumeData => {
  try {
    const jsonStr = extractJsonObject(aiResponseText);
    if (!jsonStr) throw new Error("No JSON object found in AI response.");
    const withoutTrailingCommas = jsonStr.replace(/,\s*([}\]])/g, "$1");
    return normalizeImportedResume(JSON.parse(withoutTrailingCommas));
  } catch (error) {
    console.warn("AI resume JSON parsing failed, using local fallback:", error);
    return parseResumeTextFallback(rawText);
  }
};

export const buildResumeImportPrompt = (rawText: string) => `
You are a senior resume data extraction engine. Read the resume text and return one valid JSON object only.

Rules:
- Extract every clearly present detail. Do not invent data.
- Use null or an empty string for missing scalar values.
- Return dates as YYYY-MM-DD. If the day is unknown, use the first day of the month. If only the year is known, use YYYY-01-01.
- For current jobs, set currentlyWorking to true and endDate to null.
- Put accomplishment and responsibility bullets in workSummary as an array of concise strings.
- Preserve all skills, including technical tools, languages, frameworks, and soft skills.
- Do not return markdown, comments, explanations, or code fences.

Schema:
{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "jobTitle": "",
    "address": "",
    "phone": "",
    "email": ""
  },
  "summary": "",
  "experiences": [
    {
      "title": "",
      "companyName": "",
      "city": "",
      "state": "",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "currentlyWorking": false,
      "workSummary": ["", ""]
    }
  ],
  "educations": [
    {
      "universityName": "",
      "degree": "",
      "major": "",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "description": ""
    }
  ],
  "skills": [
    { "name": "", "rating": 4 }
  ]
}

Resume text:
${rawText}
`;
