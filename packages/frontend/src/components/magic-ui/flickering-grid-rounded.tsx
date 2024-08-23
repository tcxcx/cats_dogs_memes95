import FlickeringGrid from "./index";

export default function FlickeringBackground() {
  return (
    <div className="relative h-screen rounded-lg w-full bg-bg overflow-hidden border">
      <FlickeringGrid
        className="z-0 absolute inset-0 size-full"
        squareSize={4}
        gridGap={6}
        color="#9e66ff"
        maxOpacity={0.5}
        flickerChance={0.1}
      />
    </div>
  );
}
