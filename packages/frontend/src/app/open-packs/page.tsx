import CardsDeckViewer from "@/components/card-shuffle";
import { DynamicIslandProvider } from "@/components/ui/dynamic-island";

export default function OpenPacks() {
  return (
    <DynamicIslandProvider initialSize="compact">
      <main className="flex min-h-screen max-w-7xl flex-col items-center justify-center">
        <CardsDeckViewer />{" "}
      </main>
    </DynamicIslandProvider>
  );
}
