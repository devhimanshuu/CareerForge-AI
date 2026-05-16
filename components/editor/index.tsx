import React, { useState } from "react";
import {
  EditorProvider,
  Editor,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnStrikeThrough,
  Separator,
  BtnNumberedList,
  BtnBulletList,
  BtnLink,
} from "react-simple-wysiwyg";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Loader, Sparkles, TrendingUp, Briefcase, Shrink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AIChatSession } from "@/lib/groq-model";

const PROMPT = `Given the job title "{jobTitle}",
 create 6-7 concise and personal bullet points in
  HTML stringify format that highlight my key
  skills, relevant technologies, and significant
   contributions in that role. Do not include
    the job title itself in the output. Provide
     only the bullet points inside an unordered
     list.`;

const REWRITE_PROMPTS = {
  quantify: `Rewrite the following resume bullet point to quantify the achievement. Add placeholders like [X]% or $Y for numbers/percentages if none exist. Make it sound highly professional and impactful. Only return the rewritten text, no quotes or explanations:\n\n`,
  professional: `Rewrite the following resume bullet point to make it sound more professional. Use executive power verbs (e.g., orchestrated, spearheaded, drove). Make it sound highly professional and impactful. Only return the rewritten text, no quotes or explanations:\n\n`,
  shorten: `Rewrite the following resume bullet point to be extremely concise for ATS brevity. Remove fluff and keep the core impact. Only return the rewritten text, no quotes or explanations:\n\n`,
};

const RichTextEditor = (props: {
  jobTitle: string | null | undefined;
  initialValue: string;
  onEditorChange: (e: any) => void;
}) => {
  const { jobTitle, initialValue, onEditorChange } = props;

  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(initialValue || "");

  // Inline AI State
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [loadingRewrite, setLoadingRewrite] = useState(false);

  const GenerateSummaryFromAI = async () => {
    try {
      if (!jobTitle) {
        toast({
          title: "Must provide Job Postion",
          variant: "destructive",
        });
        return;
      }
      setLoading(true);
      const prompt = PROMPT.replace("{jobTitle}", jobTitle);
      const result = await AIChatSession.sendMessage(prompt);
      let responseText = await result.response.text();
      
      let htmlContent = "";
      try {
        const parsed = JSON.parse(`[${responseText}]`);
        htmlContent = parsed?.[0] || responseText;
      } catch (e) {
        // AI returned raw HTML instead of JSON stringified HTML. Strip markdown just in case.
        htmlContent = responseText.replace(/```html/gi, '').replace(/```json/gi, '').replace(/```/g, '').trim();
        // Sometimes it still returns quotes around the HTML
        htmlContent = htmlContent.replace(/^["']|["']$/g, "").trim();
      }

      setValue(htmlContent);
      onEditorChange(htmlContent);
    } catch (error) {
      console.log(error);
      toast({
        title: "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      setSelectionRange(range);
      setSelectionRect(range.getBoundingClientRect());
      setSelectedText(selection.toString().trim());
    } else {
      setSelectionRect(null);
      setSelectionRange(null);
      setSelectedText("");
    }
  };

  const handleRewrite = async (type: "quantify" | "professional" | "shorten") => {
    if (!selectedText || !selectionRange) return;
    setLoadingRewrite(true);
    try {
      const prompt = REWRITE_PROMPTS[type] + selectedText;
      const result = await AIChatSession.sendMessage(prompt);
      let newText = await result.response.text();
      newText = newText.replace(/^["']|["']$/g, "").trim();

      // Ensure the correct range is selected
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectionRange);

      // Replace the text
      document.execCommand("insertText", false, newText);

      // Hide the menu
      setSelectionRect(null);
      setSelectionRange(null);
      setSelectedText("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to rewrite text",
        variant: "destructive",
      });
    } finally {
      setLoadingRewrite(false);
    }
  };

  return (
    <div>
      <div
        className="flex items-center 
      justify-between my-2"
      >
        <Label>Work Summary</Label>
        <Button
          variant="outline"
          type="button"
          className="gap-1"
          disabled={loading}
          onClick={() => GenerateSummaryFromAI()}
        >
          <>
            <Sparkles size="15px" className="text-purple-500" />
            Generate with AI
          </>
          {loading && <Loader size="13px" className="animate-spin" />}
        </Button>
      </div>

      <div onMouseUp={handleMouseUp} onKeyUp={handleMouseUp}>
        <EditorProvider>
          <Editor
            value={value}
            containerProps={{
              style: {
                resize: "vertical",
                lineHeight: 1.2,
                fontSize: "13.5px",
              },
            }}
            onChange={(e) => {
              setValue(e.target.value);
              onEditorChange(e.target.value);
              // Hide selection menu on typing
              setSelectionRect(null);
            }}
          >
            <Toolbar>
              <BtnBold />
              <BtnItalic />
              <BtnUnderline />
              <BtnStrikeThrough />
              <Separator />
              <BtnNumberedList />
              <BtnBulletList />
              <Separator />
              <BtnLink />
            </Toolbar>
          </Editor>
        </EditorProvider>

        {/* Floating AI Magic Wand Menu */}
        {selectionRect && selectedText && (
          <div
            className="fixed z-50 flex items-center gap-1 p-1 bg-background border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: selectionRect.top - 48,
              left: Math.max(10, selectionRect.left + selectionRect.width / 2 - 150),
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent selection clear
          >
            {loadingRewrite ? (
              <div className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-muted-foreground min-w-[200px] justify-center">
                <Loader className="w-4 h-4 animate-spin text-purple-500" />
                Rewriting magically...
              </div>
            ) : (
              <>
                <div className="px-2 border-r border-border flex items-center bg-purple-500/10 rounded-l-lg py-1">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRewrite("professional")}
                  className="h-8 text-[11px] px-2.5 font-semibold hover:bg-purple-500/10 hover:text-purple-600"
                >
                  <Briefcase className="w-3 h-3 mr-1" />
                  Make it sound more professional
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRewrite("quantify")}
                  className="h-8 text-[11px] px-2.5 font-semibold hover:bg-purple-500/10 hover:text-purple-600"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Quantify this achievement
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRewrite("shorten")}
                  className="h-8 text-[11px] px-2.5 font-semibold hover:bg-purple-500/10 hover:text-purple-600"
                >
                  <Shrink className="w-3 h-3 mr-1" />
                  Shorten
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
