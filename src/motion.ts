import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fadeFrames } from "./theme";

export function useOverlayOpacity(): number {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(
    frame,
    [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}
