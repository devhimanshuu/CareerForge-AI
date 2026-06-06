"use client";
import React from "react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import useGetDocument from "@/features/document/use-get-document-by-id";
import { ResumeDataType } from "@/types/resume.type";
import Error from "../../../_components/Error";
import PreviewResume from "../../../_components/PreviewResume";

const PublicResume = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const searchParams = useSearchParams();
  const isPrint = searchParams.get("print") === "true";
  const pdfSecret = searchParams.get("pdfSecret") || "";
  
  const { data, isSuccess, isLoading } = useGetDocument(documentId, true, pdfSecret);
  const resumeInfo = data?.data ?? ({} as ResumeDataType);

  if (!isLoading && !isSuccess) {
    return <Error />;
  }
  return (
    <div className={isPrint ? "w-full bg-white" : "w-full min-h-screen h-auto bg-black"}>
      {!isPrint && (
        <nav
          className="w-full px-8
          border-b sticky top-0 border-gray-700
          bg-black/50 h-12 py-2
          "
        >
          <div className="flex items-center gap-1">
            <Image
              src="/images/pdf_icon.png"
              width={20}
              height={20}
              alt="pdf logo"
            />
            <h5
              className="text-[20px] px-1 text-gray-300
                    font-semibold"
            >
              {resumeInfo?.title || "Untitled Resume"}.pdf
            </h5>
          </div>
        </nav>
      )}
      <div className={isPrint ? "w-full" : "w-full flex-1 flex items-center justify-center py-5"}>
        <div
          className={isPrint ? "w-full bg-white" : "max-w-[90%] mx-auto lg:max-w-[50%] w-full bg-white"}
        >
          <PreviewResume
            {...{
              resumeInfo,
              isLoading,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PublicResume;
