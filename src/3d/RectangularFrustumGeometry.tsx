import { Wireframe } from "@react-three/drei";
import React from "react";
import { DoubleSide } from "three";

interface Props {
  topXDimension: number;
  topYDimension: number;
  bottomXDimension: number;
  bottomYDimension: number;
  zDimension: number;
  withFloor: boolean;
}

// Bottom face will be centered on (0, 0, 0).
export default function RectangularFrustumGeometry({
  topXDimension,
  topYDimension,
  bottomXDimension,
  bottomYDimension,
  zDimension,
}: Props): React.JSX.Element {
  const x0y0z0 = [-bottomXDimension / 2, -bottomYDimension / 2, 0];
  const x1y0z0 = [bottomXDimension / 2, -bottomYDimension / 2, 0];
  const x0y1z0 = [-bottomXDimension / 2, bottomYDimension / 2, 0];
  const x1y1z0 = [bottomXDimension / 2, bottomYDimension / 2, 0];
  const x0y0z1 = [-topXDimension / 2, -topYDimension / 2, zDimension];
  const x1y0z1 = [topXDimension / 2, -topYDimension / 2, zDimension];
  const x0y1z1 = [-topXDimension / 2, topYDimension / 2, zDimension];
  const x1y1z1 = [topXDimension / 2, topYDimension / 2, zDimension];

  const triangles = [
    // x0 wall:
    [x0y0z0, x0y0z1, x0y1z1],
    [x0y0z0, x0y1z0, x0y1z1],
    // x1 wall:
    [x1y0z0, x1y0z1, x1y1z1],
    [x1y0z0, x1y1z0, x1y1z1],
    // y0 wall:
    [x0y0z0, x1y0z0, x1y0z1],
    [x0y0z0, x0y0z1, x1y0z1],
    // y1 wall:
    [x0y1z0, x1y1z0, x1y1z1],
    [x0y1z0, x0y1z1, x1y1z1],
  ];
  const buffer = new Float32Array(triangles.flat().flat());
  return (
    <mesh>
      <bufferGeometry onUpdate={(self) => self.computeVertexNormals()}>
        <bufferAttribute
          attach="attributes-position"
          array={buffer}
          count={buffer.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <meshStandardMaterial color="red" side={DoubleSide} />
      <Wireframe />
    </mesh>
  );
}
