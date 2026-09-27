import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GlassPanel } from "./GlassPanel";
import { fontMono } from "./fonts";
import { useOverlayOpacity } from "./motion";
import { fadeFrames, tokens } from "./theme";

export type PriceCardProps = {
  value: number;
  currency: string;
  description: string;
  durationInSeconds: number;
  usdAmount: number | null;
};

export const defaultPriceCardProps: PriceCardProps = {
  value: 1500,
  currency: "JPY",
  description: "Tonkotsu · Shinjuku",
  durationInSeconds: 5,
  usdAmount: null,
};

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function countedAmount(frame: number, target: number, fps: number): number {
  const t = interpolate(
    frame,
    [fadeFrames, fadeFrames + Math.round(fps * 0.7)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  return easeOutCubic(t) * target;
}

function formatAmount(value: number, target: number): string {
  const digits = target >= 100 && Number.isInteger(target) ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export const PriceCard: React.FC<PriceCardProps> = ({
  value,
  currency,
  description,
  usdAmount,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useOverlayOpacity();
  const displayed = countedAmount(frame, value, fps);
  const usdDisplayed =
    usdAmount === null ? null : countedAmount(frame, usdAmount, fps);

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 80,
        }}
      >
        <GlassPanel
          accent={tokens.cyan}
          glow={tokens.glowCyan}
          kicker="VAL"
          align="right"
        >
          <div
            style={{
              fontFamily: fontMono,
              fontSize: 64,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              color: tokens.cyan,
              textShadow: `0 0 18px ${tokens.glowCyan}`,
              lineHeight: 1,
            }}
          >
            {formatAmount(displayed, value)} {currency}
          </div>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 20,
              fontWeight: 600,
              color: tokens.amber,
              textShadow: `0 0 10px ${tokens.glowAmber}`,
            }}
          >
            {description}
          </p>
          {usdDisplayed !== null ? (
            <p
              style={{
                margin: "10px 0 0",
                fontFamily: fontMono,
                fontSize: 28,
                fontWeight: 700,
                color: tokens.onSurface,
              }}
            >
              {formatAmount(usdDisplayed, usdAmount ?? usdDisplayed)} USD
            </p>
          ) : null}
        </GlassPanel>
      </div>
    </AbsoluteFill>
  );
};
