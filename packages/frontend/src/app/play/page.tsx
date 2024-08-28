import Game from "@/components/game";
import { DynamicIslandProvider } from "@/components/ui/dynamic-island";

export default function Page() {
  return (
    <DynamicIslandProvider initialSize="compact">
      <div className="container h-fit">
        <h1 className="null"></h1>
        <Game />
      </div>
    </DynamicIslandProvider>
  );
}
