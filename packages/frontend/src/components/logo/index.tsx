"use client";
import { useState } from "react";
import { LightBoard, PatternCell } from "@/components/lightboard";

export default function Logo() {
  const [catsDrawState, setCatsDrawState] = useState<PatternCell>("2");
  const [dogsDrawState, setDogsDrawState] = useState<PatternCell>("2");
  const [memesDrawState, setMemesDrawState] = useState<PatternCell>("2");

  const cycleDrawState = (
    setDrawState: React.Dispatch<React.SetStateAction<PatternCell>>
  ) => {
    setDrawState((prev) => {
      switch (prev) {
        case "0":
          return "1";
        case "1":
          return "2";
        case "2":
          return "3";
        case "3":
          return "0";
        default:
          return "0";
      }
    });
  };

  return (
    <>
      {/* DOGS */}
      <div className="w-full bg-bg">
        <LightBoard
          rows={7}
          lightSize={2}
          gap={1}
          text="CATS"
          font="default"
          updateInterval={600}
          controlledDrawState={dogsDrawState}
          onDrawStateChange={() => cycleDrawState(setDogsDrawState)}
          colors={{
            background: "#daf5f0",
            textDim: "#444444",
            drawLine: "#daf5f0",
            textBright: "#FFFFFF",
          }}
        />
      </div>
      <div className="w-full bg-bg">
        <LightBoard
          rows={7}
          lightSize={3}
          gap={1}
          text="MEMES"
          font="default"
          updateInterval={900}
          controlledDrawState={dogsDrawState}
          onDrawStateChange={() => cycleDrawState(setDogsDrawState)}
          colors={{
            background: "#c4a1ff",
            textDim: "#444444",
            drawLine: "#daf5f0",
            textBright: "#FFFFFF",
          }}
        />
      </div>

      {/* AND MEMES */}
      <div className="w-full bg-bg">
        <LightBoard
          lightSize={2}
          gap={1}
          text="DOGS"
          font="default"
          updateInterval={600}
          controlledDrawState={memesDrawState}
          onDrawStateChange={() => cycleDrawState(setMemesDrawState)}
          colors={{
            background: "#daf5f0",
            textDim: "#444444",
            drawLine: "#eeefe9",
            textBright: "#FFFFFF",
          }}
        />
      </div>
    </>
  );
}
