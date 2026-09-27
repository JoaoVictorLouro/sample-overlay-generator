import type {
  Options,
  SeriesGanttOptions,
  SeriesOptionsType,
} from "highcharts";
import { tokens } from "./theme";

export const chartTypes = [
  "line",
  "spline",
  "area",
  "column",
  "pie",
  "gantt",
] as const;
export type ChartType = (typeof chartTypes)[number];

export type CartesianChart = {
  type: "line" | "spline" | "area" | "column";
  categories: string[];
  series: Array<{ name: string; data: number[] }>;
};

export type PieChart = {
  type: "pie";
  series: Array<{ name: string; y: number }>;
};

export type GanttChart = {
  type: "gantt";
  series: Array<{ name: string; start: string; end: string }>;
};

export type ChartSpec = CartesianChart | PieChart | GanttChart;

export type ChartProps = {
  title: string;
  description: string;
  durationInSeconds: number;
  chart: ChartSpec;
};

export const defaultChartProps: ChartProps = {
  title: "Shoot week",
  description: "When the crew was on the ground.",
  durationInSeconds: 6,
  chart: {
    type: "gantt",
    series: [
      { name: "Recce", start: "2026-04-01", end: "2026-04-03" },
      { name: "Principal", start: "2026-04-04", end: "2026-04-08" },
    ],
  },
};

export const sampleCharts: Record<ChartType, ChartSpec> = {
  column: {
    type: "column",
    categories: ["Day 1", "Day 2", "Day 3", "Day 4"],
    series: [{ name: "Spend", data: [42, 28, 65, 31] }],
  },
  line: {
    type: "line",
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    series: [{ name: "Views", data: [120, 240, 310, 280, 540] }],
  },
  spline: {
    type: "spline",
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    series: [{ name: "Views", data: [120, 240, 310, 280, 540] }],
  },
  area: {
    type: "area",
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    series: [{ name: "Views", data: [120, 240, 310, 280, 540] }],
  },
  pie: {
    type: "pie",
    series: [
      { name: "Travel", y: 40 },
      { name: "Food", y: 25 },
      { name: "Stays", y: 35 },
    ],
  },
  gantt: defaultChartProps.chart,
};

const palette = [tokens.cyan, tokens.amber, tokens.magenta, "#7c5cff"];

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function itemProgress(t: number, index: number, count: number): number {
  if (count <= 1) {
    return clamp01(t);
  }
  const stagger = 0.55;
  const start = (index / (count - 1)) * stagger;
  return clamp01((t - start) / (1 - stagger));
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function revealedCartesian(
  values: number[],
  type: CartesianChart["type"],
  t: number,
): Array<number | null> {
  if (type === "column") {
    return values.map(
      (value, index) => value * itemProgress(t, index, values.length),
    );
  }
  if (values.length <= 1) {
    return values.map((value) => value * clamp01(t));
  }
  const pos = clamp01(t) * (values.length - 1);
  const head = Math.floor(pos);
  const frac = pos - head;
  return values.map((value, index) => {
    if (index < head) {
      return value;
    }
    if (index === head) {
      return value;
    }
    if (index === head + 1 && frac > 0) {
      return lerp(values[head] ?? value, value, frac);
    }
    return null;
  });
}

const labelStyle = {
  color: tokens.onSurfaceMuted,
  fontFamily: tokens.fontMono,
  fontSize: "14px",
};

function baseChart(width: number, height: number): Options["chart"] {
  return {
    animation: false,
    backgroundColor: "transparent",
    borderRadius: 0,
    height,
    width,
    style: { fontFamily: tokens.fontDisplay },
  };
}

export function buildChartOptions(
  chart: ChartSpec,
  width: number,
  height: number,
  reveal: number,
): Options {
  if (chart.type === "pie") {
    return {
      chart: { ...baseChart(width, height), type: "pie" },
      colors: palette,
      credits: { enabled: false },
      title: { text: undefined },
      tooltip: { enabled: false },
      plotOptions: {
        pie: {
          animation: false,
          borderColor: tokens.charcoal,
          borderWidth: 2,
          dataLabels: {
            color: tokens.onSurface,
            style: {
              fontFamily: tokens.fontMono,
              fontSize: "14px",
              textOutline: "none",
            },
          },
        },
        series: { animation: false },
      },
      series: [
        {
          type: "pie",
          data: chart.series.map((point, index) => ({
            name: point.name,
            y: point.y * itemProgress(reveal, index, chart.series.length),
          })),
        },
      ],
    };
  }

  if (chart.type === "gantt") {
    const points = chart.series.map((item, index) => {
      const start = Date.parse(item.start);
      const end = Date.parse(item.end);
      const t = itemProgress(reveal, index, chart.series.length);
      return {
        name: item.name,
        start,
        end: start + (end - start) * t,
      };
    });
    return {
      chart: { ...baseChart(width, height), type: "gantt" },
      colors: palette,
      credits: { enabled: false },
      title: { text: undefined },
      tooltip: { enabled: false },
      xAxis: {
        labels: { style: labelStyle },
      },
      yAxis: {
        labels: { style: labelStyle },
      },
      series: [
        {
          type: "gantt",
          animation: false,
          data: points,
        } satisfies SeriesGanttOptions,
      ],
    };
  }

  const yMax = Math.max(...chart.series.flatMap((item) => item.data), 1) * 1.08;
  return {
    chart: { ...baseChart(width, height), type: chart.type },
    colors: palette,
    credits: { enabled: false },
    legend: {
      enabled: chart.series.length > 1,
      itemStyle: { color: tokens.onSurface },
    },
    title: { text: undefined },
    tooltip: { enabled: false },
    plotOptions: {
      series: { animation: false, connectNulls: false },
      column: { borderRadius: 0, borderWidth: 0 },
      area: { fillOpacity: 0.18 },
    },
    xAxis: {
      categories: chart.categories,
      labels: { style: labelStyle },
    },
    yAxis: {
      max: yMax,
      min: 0,
      title: { text: undefined },
      labels: { style: labelStyle },
    },
    series: chart.series.map((item) => ({
      type: chart.type,
      name: item.name,
      data: revealedCartesian(item.data, chart.type, reveal),
    })) as SeriesOptionsType[],
  };
}

export function chartConstructor(type: ChartType): "chart" | "ganttChart" {
  return type === "gantt" ? "ganttChart" : "chart";
}
