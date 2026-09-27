import React from "react";
import { fontMono, fontSora } from "./fonts";
import { tokens } from "./theme";

const CHAMFER = 18;

type GlassPanelProps = {
  accent: string;
  glow: string;
  kicker: string;
  children: React.ReactNode;
  align?: "left" | "right";
};

export const GlassPanel: React.FC<GlassPanelProps> = ({
  accent,
  glow,
  kicker,
  children,
  align = "left",
}) => {
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        maxWidth: 1100,
        padding: "28px 40px 28px 44px",
        background: tokens.glass,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        clipPath: `polygon(${CHAMFER}px 0, 100% 0, 100% calc(100% - ${CHAMFER}px), calc(100% - ${CHAMFER}px) 100%, 0 100%, 0 ${CHAMFER}px)`,
        boxShadow: `0 0 36px ${glow}, inset 0 1px 0 ${accent}55`,
        textAlign: align,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          background: accent,
          boxShadow: `0 0 18px ${glow}`,
        }}
      />
      <div
        style={{
          fontFamily: fontMono,
          fontSize: 16,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: accent,
          textShadow: `0 0 12px ${glow}`,
          marginBottom: 10,
        }}
      >
        {kicker}
      </div>
      <div style={{ fontFamily: fontSora }}>{children}</div>
    </div>
  );
};
