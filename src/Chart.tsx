import Highcharts from "highcharts";
import HighchartsGantt from "highcharts/highcharts-gantt";
import HighchartsReact from "highcharts-react-official";
import React, { useCallback, useMemo, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  buildChartOptions,
  chartConstructor,
  type ChartProps,
} from "./chart-options";
import { GlassPanel } from "./GlassPanel";
import { useOverlayOpacity } from "./motion";
import { fadeFrames, tokens } from "./theme";

export const Chart: React.FC<ChartProps> = ({ title, description, chart }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = useOverlayOpacity();
  const [handle] = useState(() => delayRender("highcharts"));
  const reveal = interpolate(
    frame,
    [fadeFrames, durationInFrames - fadeFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const chartWidth = 920;
  const chartHeight = 420;
  const options = useMemo(
    () => buildChartOptions(chart, chartWidth, chartHeight, reveal),
    [chart, reveal],
  );
  const handleLoad = useCallback(() => {
    continueRender(handle);
  }, [handle]);

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <GlassPanel accent={tokens.cyan} glow={tokens.glowCyan} kicker="CHT">
          <h1
            style={{
              margin: 0,
              fontSize: 36,
              fontWeight: 700,
              color: tokens.onSurface,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: "8px 0 20px",
              fontSize: 18,
              fontWeight: 600,
              color: tokens.onSurfaceMuted,
            }}
          >
            {description}
          </p>
          <HighchartsReact
            highcharts={chart.type === "gantt" ? HighchartsGantt : Highcharts}
            constructorType={chartConstructor(chart.type)}
            options={{
              ...options,
              chart: {
                ...options.chart,
                animation: false,
                backgroundColor: "transparent",
              },
            }}
            immutable={false}
            allowChartUpdate
            updateArgs={[true, true, false]}
            callback={handleLoad}
          />
        </GlassPanel>
      </div>
    </AbsoluteFill>
  );
};
