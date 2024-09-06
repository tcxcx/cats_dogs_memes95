"use client";

import CardsDeckViewer from "@/components/card-shuffle";
import LoadingCheckWrapper from "@/components/loading-wrap-check";
import TournamentTable from "@/components/table";
const OpenPacks = () => {
  return (
    <LoadingCheckWrapper>
      <main className="flex flex-col items-center justify-start">
        <TournamentTable />
      </main>
    </LoadingCheckWrapper>
  );
};

export default OpenPacks;
