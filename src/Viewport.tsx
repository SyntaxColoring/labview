import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera, Box } from "@react-three/drei";

import { Labware } from "./opentrons/labware";
import classes from "./Viewport.module.css";
import RectangularFrustumGeometry from "./3d/RectangularFrustumGeometry";

// @ts-expect-error
export default function Viewport({
	definition,
}: {
	definition: Labware | null;
}): React.JSX.Element {
	const [orbitCenterX, orbitCenterY, orbitCenterZ] = [0, 0, 0];
	// const orbitCenterX = (definition?.dimensions.xDimension ?? 0) / 2;
	// const orbitCenterY = (definition?.dimensions.yDimension ?? 0) / 2;
	// const orbitCenterZ = (definition?.dimensions.zDimension ?? 0) / 2;

	return (
		<div className={classes.container}>
			{/* TODO: Figure out how to get OrthographicCamera to work. */}
			<Canvas>
				<OrthographicCamera
					makeDefault
					left={-100}
					right={100}
					top={100}
					bottom={-100}
					near={0}
					far={200}
					position={[orbitCenterX - 50, orbitCenterY - 50, orbitCenterZ + 50]}
					up={[0, 0, 1]}
				/>
				{/*{definition !== null && <LabwareBoundingBox definition={definition} />}*/}
				<RectangularFrustumGeometry
					bottomXDimension={20}
					bottomYDimension={20}
					topYDimension={10}
					topXDimension={10}
					zDimension={20}
					withFloor={false}
				/>
				<ambientLight intensity={0.5} />
				<directionalLight position={[5, 5, 5]} />
				<OrbitControls target={[orbitCenterX, orbitCenterY, orbitCenterZ]} />
			</Canvas>
		</div>
	);
}

// @ts-expect-error
function LabwareBoundingBox({
	definition,
}: {
	definition: Labware;
}): React.JSX.Element {
	const { xDimension, yDimension, zDimension } = definition.dimensions;

	return (
		<>
			<Box
				args={[xDimension, yDimension, zDimension]}
				position={[xDimension / 2, yDimension / 2, zDimension / 2]}
			>
				<meshPhysicalMaterial color="red" transparent opacity={0.5} />
			</Box>
			{Object.entries(definition.wells).map(([wellName, well]) => {
				const geometry =
					well.shape === "circular" ? (
						<circleGeometry args={[well.diameter / 2, 32]} />
					) : (
						<planeGeometry args={[well.xDimension, well.yDimension]} />
					);
				return (
					<mesh key={wellName} position={[well.x, well.y, well.z + well.depth]}>
						{geometry}
					</mesh>
				);
			})}
		</>
	);
}
