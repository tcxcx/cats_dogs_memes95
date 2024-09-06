"use client";

import CardsDeckViewer from "@/components/card-shuffle";
import { DynamicIslandProvider } from "@v1/ui/dynamic-island";
import LoadingCheckWrapper from "@/components/loading-wrap-check";

const OpenPacks = () => {
  return (
    <LoadingCheckWrapper>
      <DynamicIslandProvider initialSize="compact">
        <main className="flex min-h-screen max-w-full flex-col items-center justify-center">
          <CardsDeckViewer />
        </main>
      </DynamicIslandProvider>
    </LoadingCheckWrapper>
  );
};

export default OpenPacks;
