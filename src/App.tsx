import React from "react";

import "./App.css";
import DefinitionInput from "./DefinitionInput";
import { labware, Labware } from "./opentrons/labware";
import { ZodIssue } from "zod";

export default function App() {
  const [input, setInput] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [definition, setDefinition] = React.useState<Labware | null>(null);

  return (
    <>
      <h1>Labware Thing</h1>
      <DefinitionInput
        content={input}
        onChange={(newContent) => {
          setInput(newContent);
          const parseResult = parseDefinition(newContent);
          if (parseResult.type === "success") {
            setDefinition(parseResult.result);
            setError(null);
          } else {
            setDefinition(null);
            setError(parseResult.message);
          }
        }}
        error={error}
      />
    </>
  );
}

function parseDefinition(
  rawInput: string,
): { type: "success"; result: Labware } | { type: "error"; message: string } {
  let parsedJSON: string;
  try {
    parsedJSON = JSON.parse(rawInput);
  } catch (e) {
    return { type: "error", message: e instanceof Error ? e.message : "" };
  }

  const result = labware.safeParse(parsedJSON);

  if (result.success) {
    return { type: "success", result: result.data };
  } else {
    return { type: "error", message: formatZodIssues(result.error.issues) };
  }
}

function formatZodIssues(issues: ZodIssue[]): string {
  return issues.map(formatZodIssue).join("\n\n");
}

function formatZodIssue(issue: ZodIssue): string {
  return formatZodPath(issue.path) + ":\n  " + issue.message;
}

function formatZodPath(path: (string | number)[]): string {
  return path.reduce<string>((acc, element, index) => {
    if (typeof element == "number") {
      return acc + "[" + element + "]";
    } else {
      // TODO: String elements in the path can have spaces and other weird characters.
      // Need to quote and escape them.
      if (index === 0) {
        return acc + element;
      } else {
        return acc + "." + element;
      }
    }
  }, "");
}
