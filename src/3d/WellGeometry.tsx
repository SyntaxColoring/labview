import { Edges, Html, Line } from "@react-three/drei";
import React from "react";
import { DoubleSide, Shape as ThreeShape } from "three";
import { Labware } from "../opentrons/labware";
import { MeshProps } from "@react-three/fiber";

import classes from "./WellGeometry.module.css";

export type WellGeometry = NonNullable<Labware["innerLabwareGeometry"]>;

// TODO: Come up with a way to resolve the "geometry" term overloading between Opentrons
// labware definitions and three.js.
export default function RectangularWellGeometry({
  wellGeometry,
}: {
  wellGeometry: WellGeometry;
}): React.JSX.Element {
  const { bottomShape, frusta: unsortedFrusta } = wellGeometry;
  const frustaBottomToTop = unsortedFrusta.sort(
    (a, b) => a.topHeight - b.topHeight,
  );

  return (
    <group>
      {bottomShape.shape === "rectangular" && (
        <RectangularFloor
          xDimension={bottomShape.xDimension}
          yDimension={bottomShape.yDimension}
        />
      )}
      {frustaBottomToTop.map((frustum, index) => {
        const bottomZ =
          index === 0 ? 0 : frustaBottomToTop[index - 1].topHeight;
        const bottomCrossSection =
          index === 0 ? bottomShape : frustaBottomToTop[index - 1].geometry;

        return bottomCrossSection.shape === "rectangular" &&
          frustum.geometry.shape === "rectangular" ? (
          <RectangularFrustum
            key={index}
            topXDimension={frustum.geometry.xDimension}
            topYDimension={frustum.geometry.yDimension}
            bottomXDimension={bottomCrossSection.xDimension}
            bottomYDimension={bottomCrossSection.yDimension}
            zDimension={frustum.topHeight - bottomZ}
            position={[0, 0, bottomZ]}
          />
        ) : null;
      })}
    </group>
  );
}

// Return a frustum whose bottom is centered on the given position.
function RectangularFrustum({
  topXDimension,
  topYDimension,
  bottomXDimension,
  bottomYDimension,
  zDimension,
  position,
}: MeshProps & {
  topXDimension: number;
  topYDimension: number;
  bottomXDimension: number;
  bottomYDimension: number;
  zDimension: number;
  position: MeshProps["position"];
}): React.JSX.Element {
  const x0y0z0: [number, number, number] = [
    -bottomXDimension / 2,
    -bottomYDimension / 2,
    0,
  ];
  const x1y0z0: [number, number, number] = [
    bottomXDimension / 2,
    -bottomYDimension / 2,
    0,
  ];
  const x0y1z0: [number, number, number] = [
    -bottomXDimension / 2,
    bottomYDimension / 2,
    0,
  ];
  const x1y1z0: [number, number, number] = [
    bottomXDimension / 2,
    bottomYDimension / 2,
    0,
  ];
  const x0y0z1: [number, number, number] = [
    -topXDimension / 2,
    -topYDimension / 2,
    zDimension,
  ];
  const x1y0z1: [number, number, number] = [
    topXDimension / 2,
    -topYDimension / 2,
    zDimension,
  ];
  const x0y1z1: [number, number, number] = [
    -topXDimension / 2,
    topYDimension / 2,
    zDimension,
  ];
  const x1y1z1: [number, number, number] = [
    topXDimension / 2,
    topYDimension / 2,
    zDimension,
  ];

  // TODO: useMemo me.
  const triangles = [
    // x0 wall:
    [x0y0z0, x0y0z1, x0y1z1],
    [x0y0z0, x0y1z1, x0y1z0],
    // x1 wall:
    [x1y0z0, x1y1z1, x1y0z1],
    [x1y0z0, x1y1z0, x1y1z1],
    // y0 wall:
    [x0y0z0, x1y0z0, x1y0z1],
    [x0y0z0, x1y0z1, x0y0z1],
    // y1 wall:
    [x0y1z0, x1y1z1, x1y1z0],
    [x0y1z0, x0y1z1, x1y1z1],
  ];
  const buffer = new Float32Array(triangles.flat().flat());

  const bottomXDimensionLabelPos = midpoint(x0y0z0, x1y0z0);
  const bottomYDimensionLabelPos = midpoint(x0y0z0, x0y1z0);
  const topXDimensionLabelPos = midpoint(x0y0z1, x1y0z1);
  const topYDimensionLabelPos = midpoint(x0y0z1, x0y1z1);

  const needsExtraLineForZDimension =
    bottomXDimension !== topXDimension || bottomYDimension !== topYDimension;
  const zDimensionExtraLinePoints: [number, number, number][] = [
    [x0y0z1[0], x0y0z1[1], x0y0z0[2]],
    x0y0z1,
  ];
  const zDimensionLabelPos = midpoint(
    zDimensionExtraLinePoints[0],
    zDimensionExtraLinePoints[1],
  );

  const [highlighted, setHighlighted] = React.useState(false);

  return (
    <mesh
      position={position}
      onPointerEnter={(e) => {
        setHighlighted(true);
        e.stopPropagation();
      }}
      onPointerLeave={(e) => {
        setHighlighted(false);
        e.stopPropagation();
      }}
    >
      <bufferGeometry onUpdate={(self) => self.computeVertexNormals()}>
        <bufferAttribute
          onUpdate={(self) => {
            self.needsUpdate = true;
          }}
          attach="attributes-position"
          array={buffer}
          count={buffer.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <meshStandardMaterial
        transparent
        opacity={0.7}
        color={highlighted ? "cyan" : "red"}
        side={DoubleSide}
        polygonOffset
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
      <Edges />
      {highlighted && (
        <group>
          <Html
            className={classes.xLabel}
            position={bottomXDimensionLabelPos}
            center
          >
            {bottomXDimension}
          </Html>
          <Html
            className={classes.yLabel}
            position={bottomYDimensionLabelPos}
            center
          >
            {bottomYDimension}
          </Html>
          <Html
            className={classes.xLabel}
            position={topXDimensionLabelPos}
            center
          >
            {topXDimension}
          </Html>
          <Html
            className={classes.yLabel}
            position={topYDimensionLabelPos}
            center
          >
            {topYDimension}
          </Html>

          {needsExtraLineForZDimension && (
            <Line color="black" points={zDimensionExtraLinePoints} />
          )}
          <Html className={classes.zLabel} position={zDimensionLabelPos} center>
            {zDimension}
          </Html>
        </group>
      )}
    </mesh>
  );
}

// Return a rectangle in the x-y plane centered on (0, 0).
function RectangularFloor({
  xDimension,
  yDimension,
}: {
  xDimension: number;
  yDimension: number;
}): React.JSX.Element {
  const shape = new ThreeShape();
  shape.moveTo(-xDimension / 2, -yDimension / 2);
  shape.lineTo(xDimension / 2, -yDimension / 2);
  shape.lineTo(xDimension / 2, yDimension / 2);
  shape.lineTo(-xDimension / 2, yDimension / 2);
  return (
    <mesh>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial
        transparent
        opacity={0.7}
        color="red"
        side={DoubleSide}
        polygonOffset
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
      <Edges />
    </mesh>
  );
}

function midpoint(a: number[], b: number[]): [number, number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}
