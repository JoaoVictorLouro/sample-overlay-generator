#!/usr/bin/env tsx

import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { stdin, stdout } from "node:process";
import { createInterface, type Interface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { sampleCharts, type ChartType } from "../src/chart-options";
import { defaultLowerThirdProps } from "../src/LowerThird";
import { defaultPriceCardProps } from "../src/PriceCard";
import { defaultTurntableProps } from "../src/Turntable";
import { kindKicker, type OverlayKind } from "../src/theme";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const compositions = [
  "lower-third",
  "price-card",
  "chart",
  "turntable",
] as const;
type CompositionChoice = (typeof compositions)[number];

const remotionIds: Record<CompositionChoice, string> = {
  "lower-third": "LowerThird",
  "price-card": "PriceCard",
  chart: "Chart",
  turntable: "Turntable",
};

const kinds = [
  "person",
  "place",
  "note",
] as const satisfies readonly OverlayKind[];
const chartTypes = [
  "line",
  "spline",
  "area",
  "column",
  "pie",
  "gantt",
] as const satisfies readonly ChartType[];

function printHelp(): void {
  console.log(`Usage: npx overlays [flags]

Flags:
  --composition NAME   lower-third | price-card | chart | turntable
  --props-file PATH    JSON props (same shape the composition expects)
  --out PATH           Output file
  --no-prompt          Skip questions; use defaults + flags
  --help
`);
}

function getFlag(name: string): string | undefined {
  const prefix = `--${name}`;
  const eq = process.argv.find((arg) => arg.startsWith(`${prefix}=`));
  if (eq) {
    return eq.slice(prefix.length + 1);
  }
  const index = process.argv.indexOf(prefix);
  if (index >= 0) {
    const next = process.argv[index + 1];
    if (next && !next.startsWith("--")) {
      return next;
    }
    return "";
  }
  return undefined;
}

function hasFlag(name: string): boolean {
  return (
    process.argv.includes(`--${name}`) ||
    process.argv.some((arg) => arg.startsWith(`--${name}=`))
  );
}

function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug === "" ? "overlay" : slug;
}

function parseChoice<T extends string>(
  raw: string,
  options: readonly T[],
  fallback: T,
): T {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return fallback;
  }
  const asIndex = Number(trimmed);
  if (Number.isInteger(asIndex) && asIndex >= 1 && asIndex <= options.length) {
    return options[asIndex - 1] as T;
  }
  return (
    options.find((option) => option.toLowerCase() === trimmed.toLowerCase()) ??
    fallback
  );
}

async function ask(
  rl: Interface | null,
  label: string,
  fallback: string,
): Promise<string> {
  if (!rl) {
    return fallback;
  }
  const raw = await rl.question(`${label} [${fallback}]: `);
  const trimmed = raw.trim();
  return trimmed === "" ? fallback : trimmed;
}

async function askChoice<T extends string>(
  rl: Interface | null,
  label: string,
  options: readonly T[],
  fallback: T,
): Promise<T> {
  if (!rl) {
    return fallback;
  }
  console.log(`${label} [${fallback}]`);
  for (const [index, option] of options.entries()) {
    console.log(`  ${index + 1}) ${option}`);
  }
  const raw = await ask(rl, "Choice (number or name)", fallback);
  return parseChoice(raw, options, fallback);
}

function outputExtension(): string {
  return process.platform === "darwin" ? ".mov" : ".webm";
}

function codecArgs(): string[] {
  if (process.platform === "darwin") {
    return [
      "--codec",
      "prores",
      "--prores-profile",
      "4444",
      "--image-format",
      "png",
      "--pixel-format",
      "yuva444p10le",
    ];
  }
  return [
    "--codec",
    "vp9",
    "--image-format",
    "png",
    "--pixel-format",
    "yuva420p",
  ];
}

async function loadPropsFile(
  filePath: string,
): Promise<Record<string, unknown>> {
  const resolved = path.resolve(root, filePath);
  const text = await readFile(resolved, "utf8");
  const parsed: unknown = JSON.parse(text);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Props file must be a JSON object: ${filePath}`);
  }
  return parsed as Record<string, unknown>;
}

async function collectProps(
  rl: Interface | null,
  choice: CompositionChoice,
  fileProps: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (choice === "lower-third") {
    const kind =
      (fileProps.kind as OverlayKind | undefined) ??
      (await askChoice(rl, "Kind", kinds, defaultLowerThirdProps.kind));
    const title =
      (fileProps.title as string | undefined) ??
      (await ask(rl, "Title", defaultLowerThirdProps.title));
    const subtitle =
      (fileProps.subtitle as string | undefined) ??
      (await ask(rl, "Subtitle", defaultLowerThirdProps.subtitle));
    const kickerRaw =
      (fileProps.kicker as string | undefined) ??
      (await ask(rl, "Kicker [blank = kind default]", ""));
    const durationRaw =
      fileProps.durationInSeconds ??
      (await ask(
        rl,
        "Duration in seconds",
        String(defaultLowerThirdProps.durationInSeconds),
      ));
    return {
      kind,
      title,
      subtitle,
      kicker: kickerRaw === "" ? kindKicker[kind] : kickerRaw,
      durationInSeconds: Number(durationRaw),
    };
  }

  if (choice === "price-card") {
    const value =
      fileProps.value ??
      (await ask(rl, "Value", String(defaultPriceCardProps.value)));
    const currency =
      (fileProps.currency as string | undefined) ??
      (await ask(rl, "Currency", defaultPriceCardProps.currency));
    const description =
      (fileProps.description as string | undefined) ??
      (await ask(rl, "Description", defaultPriceCardProps.description));
    const durationRaw =
      fileProps.durationInSeconds ??
      (await ask(
        rl,
        "Duration in seconds",
        String(defaultPriceCardProps.durationInSeconds),
      ));
    return {
      value: Number(value),
      currency,
      description,
      durationInSeconds: Number(durationRaw),
      usdAmount: null,
    };
  }

  if (choice === "chart") {
    const title =
      (fileProps.title as string | undefined) ??
      (await ask(rl, "Title", "Shoot week"));
    const description =
      (fileProps.description as string | undefined) ??
      (await ask(rl, "Description", "When the crew was on the ground."));
    const type =
      (fileProps.chart &&
      typeof fileProps.chart === "object" &&
      "type" in fileProps.chart
        ? (fileProps.chart as { type: ChartType }).type
        : undefined) ??
      (await askChoice(rl, "Chart type", chartTypes, "gantt"));
    const durationRaw =
      fileProps.durationInSeconds ??
      (await ask(rl, "Duration in seconds", "6"));
    if (fileProps.chart) {
      return {
        title,
        description,
        durationInSeconds: Number(durationRaw),
        chart: fileProps.chart,
      };
    }
    return {
      title,
      description,
      durationInSeconds: Number(durationRaw),
      chart: sampleCharts[type],
    };
  }

  const label =
    (fileProps.label as string | undefined) ??
    (await ask(rl, "Label", defaultTurntableProps.label));
  const durationRaw =
    fileProps.durationInSeconds ??
    (await ask(
      rl,
      "Duration in seconds",
      String(defaultTurntableProps.durationInSeconds),
    ));
  return {
    label,
    durationInSeconds: Number(durationRaw),
  };
}

function defaultOutPath(
  choice: CompositionChoice,
  props: Record<string, unknown>,
): string {
  const title =
    (typeof props.title === "string" && props.title) ||
    (typeof props.label === "string" && props.label) ||
    (typeof props.description === "string" && props.description) ||
    choice;
  return path.join(root, "out", `${slugify(title)}${outputExtension()}`);
}

function renderOverlay(
  id: string,
  props: Record<string, unknown>,
  outPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const remotion = path.join(root, "node_modules", ".bin", "remotion");
    const child = spawn(
      remotion,
      [
        "render",
        "src/index.ts",
        id,
        outPath,
        "--props",
        JSON.stringify(props),
        ...codecArgs(),
      ],
      { cwd: root, stdio: "inherit" },
    );
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`remotion render exited with code ${code ?? "null"}`));
    });
  });
}

async function main(): Promise<void> {
  if (hasFlag("help")) {
    printHelp();
    return;
  }

  const noPrompt = hasFlag("no-prompt") || !stdin.isTTY;
  const rl = noPrompt
    ? null
    : createInterface({ input: stdin, output: stdout });
  const propsFile = getFlag("props-file");
  const fileProps = propsFile ? await loadPropsFile(propsFile) : {};
  const compositionFlag =
    getFlag("composition") ??
    (typeof fileProps.composition === "string" ? fileProps.composition : "");
  const choice = await askChoice(
    rl,
    "Composition",
    compositions,
    parseChoice(compositionFlag, compositions, "lower-third"),
  );
  const props = await collectProps(rl, choice, fileProps);
  rl?.close();

  const outPath = path.resolve(
    root,
    getFlag("out") ?? defaultOutPath(choice, props),
  );
  await mkdir(path.dirname(outPath), { recursive: true });
  console.log(`Rendering ${outPath} …`);
  await renderOverlay(remotionIds[choice], props, outPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
