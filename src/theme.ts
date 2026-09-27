export const fps = 30;
export const width = 1920;
export const height = 1080;

export const tokens = {
  charcoal: "#0d0e10",
  glass: "rgba(13, 14, 16, 0.78)",
  onSurface: "#e3e2e3",
  onSurfaceMuted: "#b9cacb",
  cyan: "#00f2ff",
  amber: "#ffb800",
  magenta: "#ff00c8",
  glowCyan: "rgba(0, 242, 255, 0.4)",
  glowAmber: "rgba(255, 184, 0, 0.4)",
  glowMagenta: "rgba(255, 0, 200, 0.4)",
  fontDisplay: "Sora, sans-serif",
  fontMono: "JetBrains Mono, ui-monospace, monospace",
} as const;

export type OverlayKind = "person" | "place" | "note";

export const kindAccent: Record<OverlayKind, { color: string; glow: string }> =
  {
    person: { color: tokens.cyan, glow: tokens.glowCyan },
    place: { color: tokens.magenta, glow: tokens.glowMagenta },
    note: { color: tokens.amber, glow: tokens.glowAmber },
  };

export const kindKicker: Record<OverlayKind, string> = {
  person: "GUEST",
  place: "LOC",
  note: "NOTE",
};

export const fadeFrames = 12;
