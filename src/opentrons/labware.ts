// Minimal schema validation and TypeScript bindings for the labware definition schema.
// TODO: Figure out a way to install opentrons-shared-data in this project and use its bindings.

import { z } from "zod";

const wellCommon = z.object({
  depth: z.number(),
  x: z.number(),
  y: z.number(),
  z: z.number(),
  geometryDefinitionId: z.string().nullable().optional(),
});

const rectangularWell = wellCommon.extend({
  shape: z.literal("rectangular"),
  xDimension: z.number(),
  yDimension: z.number(),
});

const circularWell = wellCommon.extend({
  shape: z.literal("circular"),
  diameter: z.number(),
  depth: z.number(),
});

const well = z.discriminatedUnion("shape", [rectangularWell, circularWell]);

const circularCrossSection = z.object({
  shape: z.literal("circular"),
  diameter: z.number(),
});

const rectangularCrossSection = z.object({
  shape: z.literal("rectangular"),
  xDimension: z.number(),
  yDimension: z.number(),
});

const sphericalSegment = z.object({
  shape: z.literal("spherical"),
  radiusOfCurvature: z.number(),
  depth: z.number(),
});

const boundedSection = z.object({
  geometry: z.discriminatedUnion("shape", [
    circularCrossSection,
    rectangularCrossSection,
  ]),
  topHeight: z.number(),
});

export const labware = z.object({
  dimensions: z.object({
    xDimension: z.number(),
    yDimension: z.number(),
    zDimension: z.number(),
  }),
  wells: z.record(z.string(), well),
  innerLabwareGeometry: z
    .object({
      frusta: z.array(boundedSection),
      bottomShape: z.discriminatedUnion("shape", [
        circularCrossSection,
        rectangularCrossSection,
        sphericalSegment,
      ]),
    })
    .nullable()
    .optional(),
});

export type Labware = z.infer<typeof labware>;
