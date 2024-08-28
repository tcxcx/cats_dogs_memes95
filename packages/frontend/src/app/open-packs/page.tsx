import CardsDeckViewer from "@/components/card-shuffle";
import { DynamicIslandProvider } from "@/components/ui/dynamic-island";

export default function OpenPacks() {
  return (
    <DynamicIslandProvider initialSize="tiny">
      <main className="flex min-h-screen max-w-full flex-col items-center justify-center">
        <CardsDeckViewer />{" "}
      </main>
    </DynamicIslandProvider>
  );
}
