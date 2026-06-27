import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";
import { generateDocUUID, formatFileName } from "@/lib/helper";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
  it("drops falsy values", () => {
    expect(cn("p-2", false && "p-4", undefined, null)).toBe("p-2");
  });
});

describe("generateDocUUID", () => {
  it("produces a doc- prefix and 16 hex chars", () => {
    const id = generateDocUUID();
    expect(id).toMatch(/^doc-[a-f0-9]{16}$/);
  });
  it("returns unique values across calls", () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateDocUUID()));
    expect(ids.size).toBe(20);
  });
});

describe("formatFileName", () => {
  it("hyphenates spaces by default and adds .pdf", () => {
    expect(formatFileName("My Resume Final")).toBe("My-Resume-Final.pdf");
  });
  it("uses underscores when requested", () => {
    expect(formatFileName("Senior Engineer Resume", false)).toBe(
      "Senior_Engineer_Resume.pdf"
    );
  });
  it("collapses multiple spaces", () => {
    expect(formatFileName("Hello   World")).toBe("Hello-World.pdf");
  });
});
