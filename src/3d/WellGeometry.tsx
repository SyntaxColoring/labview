import { Edges, EdgesRef } from "@react-three/drei";
import React from "react";
import { DoubleSide, Shape as ThreeShape } from "three";
import { Labware } from "../opentrons/labware";
import { MeshProps } from "@react-three/fiber";

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
  const x0y0z0 = [-bottomXDimension / 2, -bottomYDimension / 2, 0];
  const x1y0z0 = [bottomXDimension / 2, -bottomYDimension / 2, 0];
  const x0y1z0 = [-bottomXDimension / 2, bottomYDimension / 2, 0];
  const x1y1z0 = [bottomXDimension / 2, bottomYDimension / 2, 0];
  const x0y0z1 = [-topXDimension / 2, -topYDimension / 2, zDimension];
  const x1y0z1 = [topXDimension / 2, -topYDimension / 2, zDimension];
  const x0y1z1 = [-topXDimension / 2, topYDimension / 2, zDimension];
  const x1y1z1 = [topXDimension / 2, topYDimension / 2, zDimension];

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
      <bufferGeometry onUpdate={(self) => self.computeVertexNormals()} attri>
        <bufferAttribute
          onUpdate={
            (self) => {
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
