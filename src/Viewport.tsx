import React from "react";
import { Canvas } from "@react-three/fiber";
import {
	PerspectiveCamera,
	OrbitControls,
	OrthographicCamera,
	Outlines,
	Box,
	Grid,
} from "@react-three/drei";

import { Labware } from "./opentrons/labware";
import classes from "./Viewport.module.css";

export default function Viewport({
	definition,
}: {
	definition: Labware | null;
}): React.JSX.Element {
	const orbitCenterX = (definition?.dimensions.xDimension ?? 0) / 2;
	const orbitCenterY = (definition?.dimensions.yDimension ?? 0) / 2;
	const orbitCenterZ = (definition?.dimensions.zDimension ?? 0) / 2;

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
				{definition !== null && <LabwareBoundingBox definition={definition} />}
				<ambientLight intensity={0.5} />
				<directionalLight position={[5, 5, 5]} />
				<OrbitControls target={[orbitCenterX, orbitCenterY, orbitCenterZ]} />
			</Canvas>
		</div>
	);
}

function LabwareBoundingBox({ definition }: { definition: Labware }) {
	const { xDimension, yDimension, zDimension } = definition.dimensions;
	return (
		<Box
			args={[xDimension, yDimension, zDimension]}
			position={[xDimension / 2, yDimension / 2, zDimension / 2]}
		>
			<meshPhysicalMaterial color="red" transparent opacity={0.5} />
		</Box>
	);
}
