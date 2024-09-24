import React from "react";

import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { Labware } from "./opentrons/labware";

import RectangularWellGeometry from "./3d/WellGeometry";

import classes from "./Viewport.module.css";

export default function Viewport({
  definition,
}: {
  definition: Labware["innerLabwareGeometry"] | null;
}): React.JSX.Element {
  const [orbitCenterX, orbitCenterY, orbitCenterZ] = [0, 0, 0];

  return (
    <div className={classes.container}>
      <Canvas>
        <OrthographicCamera
          makeDefault
          left={-100}
          right={100}
          top={100}
          bottom={-100}
          near={0}
          far={200}
          position={[orbitCenterX - 10, orbitCenterY - 50, orbitCenterZ + 25]}
          up={[0, 0, 1]}
        />
        {definition && <RectangularWellGeometry wellGeometry={definition} />}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <OrbitControls target={[orbitCenterX, orbitCenterY, orbitCenterZ]} />
      </Canvas>
    </div>
  );
}
