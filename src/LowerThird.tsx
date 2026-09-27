import React from "react";
import { AbsoluteFill } from "remotion";
import { GlassPanel } from "./GlassPanel";
import { useOverlayOpacity } from "./motion";
import { kindAccent, kindKicker, tokens, type OverlayKind } from "./theme";

export type LowerThirdProps = {
  kind: OverlayKind;
  kicker: string;
  title: string;
  subtitle: string;
  durationInSeconds: number;
};

export const defaultLowerThirdProps: LowerThirdProps = {
  kind: "person",
  kicker: "",
  title: "Mika Tanaka",
  subtitle: "Chef · Osaka",
  durationInSeconds: 5,
};

export const LowerThird: React.FC<LowerThirdProps> = ({
  kind,
  kicker,
  title,
  subtitle,
}) => {
  const opacity = useOverlayOpacity();
  const accent = kindAccent[kind];
  const kickerLabel = kicker.trim() === "" ? kindKicker[kind] : kicker;

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          position: "absolute",
          left: 80,
          bottom: 96,
        }}
      >
        <GlassPanel
          accent={accent.color}
          glow={accent.glow}
          kicker={kickerLabel}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: tokens.onSurface,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 20,
              fontWeight: 600,
              color: tokens.onSurfaceMuted,
            }}
          >
            {subtitle}
          </p>
        </GlassPanel>
      </div>
    </AbsoluteFill>
  );
};
