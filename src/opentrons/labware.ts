/*
Minimal schema validation and TypeScript bindings for Opentrons labware definitions.
(Or parts of Opentrons labware definitions, anyway.)

Unfortunately, we have to hand-write our own Zod bindings, instead of using something
like Ajv to directly validate against the Opentrons JSON Schema. Because JSON Schema
has no discriminated unions, the error messages are unusably bad for interactive editing.

Most recently updated for this upstream revision:
https://github.com/Opentrons/opentrons/blob/44e030b5da88d4edb54525ca1a35b49c461a3a14/shared-data/labware/schemas/3.json
*/

import { z } from "zod";

const spherical = z.object({
  shape: z.literal("spherical"),
  radiusOfCurvature: z.number(),
  topHeight: z.number(),
  bottomHeight: z.number(),
});

const conical = z.object({
  shape: z.literal("conical"),
  bottomDiameter: z.number(),
  topDiameter: z.number(),
  topHeight: z.number(),
  bottomHeight: z.number(),
});

const cuboidal = z.object({
  shape: z.literal("cuboidal"),
  bottomXDimension: z.number(),
  bottomYDimension: z.number(),
  topXDimension: z.number(),
  topYDimension: z.number(),
  topHeight: z.number(),
  bottomHeight: z.number(),
});

// TODO: Add squaredcone and roundedcuboid.

export const innerLabwareGeometry = z.object({
  sections: z.array(
    z.discriminatedUnion("shape", [spherical, conical, cuboidal]),
  ),
});

export type InnerLabwareGeometry = z.infer<typeof innerLabwareGeometry>;
