"use client";

import { api } from "@/lib/hono-rpc";
import { useQuery } from "@tanstack/react-query";

const useGetBranches = (documentId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["document-branches", documentId],
    enabled: Boolean(documentId) && enabled,
    queryFn: async () => {
      const response = await api.document.branches[":documentId"].$get({
        param: { documentId },
      });
      if (!response.ok) throw new Error("Failed to load branches");
      const json = await response.json();
      if (!("data" in json) || !json.data) {
        throw new Error("Failed to load branches");
      }
      return json.data;
    },
  });
};

export default useGetBranches;
