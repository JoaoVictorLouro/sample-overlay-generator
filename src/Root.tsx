import React from "react";
import { Composition } from "remotion";
import { Chart } from "./Chart";
import { defaultChartProps } from "./chart-options";
import { parseCurrency, parsePriceValue, resolveUsdAmount } from "./exchange";
import { LowerThird, defaultLowerThirdProps } from "./LowerThird";
import { PriceCard, defaultPriceCardProps } from "./PriceCard";
import { Turntable, defaultTurntableProps } from "./Turntable";
import { fps, height, width } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LowerThird"
        component={LowerThird}
        durationInFrames={fps * defaultLowerThirdProps.durationInSeconds}
        fps={fps}
        width={width}
        height={height}
        defaultProps={defaultLowerThirdProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.round(props.durationInSeconds * fps),
        })}
      />
      <Composition
        id="PriceCard"
        component={PriceCard}
        durationInFrames={fps * defaultPriceCardProps.durationInSeconds}
        fps={fps}
        width={width}
        height={height}
        defaultProps={defaultPriceCardProps}
        calculateMetadata={async ({ props }) => {
          const value = parsePriceValue(props.value);
          const currency = parseCurrency(props.currency);
          const usdAmount = await resolveUsdAmount(value, currency);
          return {
            durationInFrames: Math.round(props.durationInSeconds * fps),
            props: { ...props, value, currency, usdAmount },
          };
        }}
      />
      <Composition
        id="Chart"
        component={Chart}
        durationInFrames={fps * defaultChartProps.durationInSeconds}
        fps={fps}
        width={width}
        height={height}
        defaultProps={defaultChartProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.round(props.durationInSeconds * fps),
        })}
      />
      <Composition
        id="Turntable"
        component={Turntable}
        durationInFrames={fps * defaultTurntableProps.durationInSeconds}
        fps={fps}
        width={width}
        height={height}
        defaultProps={defaultTurntableProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.round(props.durationInSeconds * fps),
        })}
      />
    </>
  );
};
