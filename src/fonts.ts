import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";

export const { fontFamily: fontSora } = loadSora("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});

export const { fontFamily: fontMono } = loadMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});
