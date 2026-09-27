import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateTorusKnot } from "@babylonjs/core/Meshes/Builders/torusKnotBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Scene } from "@babylonjs/core/scene";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GlassPanel } from "./GlassPanel";
import { useOverlayOpacity } from "./motion";
import { tokens } from "./theme";

export type TurntableProps = {
  label: string;
  durationInSeconds: number;
};

export const defaultTurntableProps: TurntableProps = {
  label: "Product",
  durationInSeconds: 5,
};

type BabylonApi = {
  engine: Engine;
  scene: Scene;
  camera: ArcRotateCamera;
};

export function renderBabylonFrame(engine: Engine, scene: Scene): void {
  engine.beginFrame();
  scene.render();
  engine.endFrame();
}

export const Turntable: React.FC<TurntableProps> = ({ label }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const opacity = useOverlayOpacity();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const apiRef = useRef<BabylonApi | null>(null);
  const [handle] = useState(() => delayRender("babylon"));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      premultipliedAlpha: false,
      adaptToDeviceRatio: false,
    });
    engine.setSize(width, height);

    const scene = new Scene(engine);
    scene.autoClear = true;
    scene.clearColor = new Color4(0, 0, 0, 0);

    const camera = new ArcRotateCamera(
      "camera",
      Math.PI / 3,
      Math.PI / 2.4,
      6.2,
      Vector3.Zero(),
      scene,
    );
    camera.minZ = 0.1;

    const light = new HemisphericLight("hemi", new Vector3(0.4, 1, 0.2), scene);
    light.intensity = 0.85;
    light.groundColor = new Color3(0.05, 0.08, 0.1);

    const mesh = CreateTorusKnot(
      "knot",
      { radius: 1.1, tube: 0.28, radialSegments: 96, tubularSegments: 24 },
      scene,
    );
    const material = new StandardMaterial("cyan", scene);
    material.emissiveColor = Color3.FromHexString("#00f2ff");
    material.diffuseColor = Color3.FromHexString("#00363a");
    material.specularColor = Color3.FromHexString("#7ef6ff");
    mesh.material = material;

    apiRef.current = { engine, scene, camera };
    continueRender(handle);

    return () => {
      apiRef.current = null;
      scene.dispose();
      engine.dispose();
    };
  }, [handle, height, width]);

  useLayoutEffect(() => {
    const api = apiRef.current;
    if (!api) {
      return;
    }
    api.camera.alpha = Math.PI / 3 + (frame / fps) * 0.85;
    renderBabylonFrame(api.engine, api.scene);
  }, [fps, frame]);

  return (
    <AbsoluteFill style={{ opacity }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: "transparent",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 80,
          bottom: 96,
        }}
      >
        <GlassPanel accent={tokens.cyan} glow={tokens.glowCyan} kicker="3D">
          <h1
            style={{
              margin: 0,
              fontSize: 36,
              fontWeight: 700,
              color: tokens.onSurface,
            }}
          >
            {label}
          </h1>
        </GlassPanel>
      </div>
    </AbsoluteFill>
  );
};
