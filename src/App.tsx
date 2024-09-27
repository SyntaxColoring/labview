import React from "react";

import classes from "./App.module.css";
import DefinitionInput from "./DefinitionInput";
import { labware, Labware } from "./opentrons/labware";
import { ZodIssue } from "zod";
import Viewport from "./Viewport";

import * as exampleLabware from "./opentrons/exampleLabware.json";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function App() {
  const [input, setInput] = React.useState<string>(
    JSON.stringify(exampleLabware, null, 2),
  );

  const parseResult = input.trim() === "" ? null : parseDefinition(input);
  const errorMessage =
    parseResult?.type === "error" ? parseResult.message : null;
  const definition =
    parseResult?.type === "success" ? parseResult.result : null;

  return (
    <div className={classes.appContainer}>
      <div className={classes.header}>
        <h1 className={classes.pageTitle}>Labware Thing</h1>
      </div>
      <PanelGroup direction="horizontal">
        <Panel>
          <DefinitionInput
            content={input}
            onChange={(newContent) => {
              setInput(newContent);
            }}
            error={errorMessage}
          />
        </Panel>
        <PanelResizeHandle className={classes.resizeHandle} />
        <Panel>
          <Viewport definition={definition} />
        </Panel>
      </PanelGroup>
    </div>
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
