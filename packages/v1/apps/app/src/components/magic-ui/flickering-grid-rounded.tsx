import FlickeringGrid from "./index";

export default function FlickeringBackground() {
  return (
    <div className="relative rounded-lg w-full h-full bg-bg overflow-hidden border">
      <FlickeringGrid
        className="z-0 absolute inset-0 w-full h-full"
        squareSize={4}
        gridGap={6}
        color="#9e66ff"
        maxOpacity={0.2}
        flickerChance={0.3}
        width={2000}
        height={4000}
      />
    </div>
  );
}
