"use client";

import useSWR from "swr";
import { getInfo } from "../../app/api/rollup/route";

export const useMruInfo = () => {
  const { data: mruInfo, isLoading } = useSWR("/mru-info", getInfo, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
  });
  return { mruInfo, isLoading };
};