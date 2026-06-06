"use client";

import { api } from "@/lib/hono-rpc";
import { useQuery } from "@tanstack/react-query";

const useGetDocument = (documentId: string, isPublic: boolean = false, pdfSecret?: string) => {
  const query = useQuery({
    queryKey: ["document", documentId, pdfSecret],
    queryFn: async () => {
      const endpoint = !isPublic
        ? api.document[":documentId"]
        : api.document.public.doc[":documentId"];

      const queryObj: any = {};
      if (isPublic && pdfSecret) {
        queryObj.pdfSecret = pdfSecret;
      }

      const response = await endpoint.$get({
        param: {
          documentId: documentId,
        },
        query: queryObj,
      });

      if (!response.ok) {
        throw new Error("Failed to get document");
      }

      const { data, success } = await response.json();
      return {
        data,
        success,
      };
    },
    retry: isPublic ? false : 3,
    enabled: !!documentId,
  });

  return query;
};

export default useGetDocument;
