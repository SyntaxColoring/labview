import React from "react";
import classes from "./DefinitionInput.module.css";

interface Props {
  content: string;
  onChange: (newContent: string) => void;
  error: string | null;
}

export default function DefinitionInput(props: Props): React.JSX.Element {
  return (
    <div className={classes.container}>
      <textarea
        className={classes.input}
        placeholder="Paste a labware definition here."
        onChange={(e) => props.onChange(e.target.value)}
        value={props.content}
      />
      {props.error && <div className={classes.error}>{props.error}</div>}
    </div>
  );
}
