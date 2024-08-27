import Game from "@/components/game";
import { DynamicIslandProvider } from "@/components/ui/dynamic-island";

export default function Page() {
  return (
    <DynamicIslandProvider initialSize="compact">
      <div>
        <h1 className="text-2xl font-bold text-center mb-4">Card Game</h1>
        <Game />
      </div>
    </DynamicIslandProvider>
  );
}
