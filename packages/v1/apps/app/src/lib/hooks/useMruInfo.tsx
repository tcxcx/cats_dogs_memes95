"use client";

import useSWR from "swr";
import { getInfo } from "@/lib/apiClient";

export const useMruInfo = () => {
  const { data: mruInfo, isLoading } = useSWR("/mru-info", getInfo, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
  });
  return { mruInfo, isLoading };
};
