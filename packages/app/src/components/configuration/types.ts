import * as Monaco from "monaco-editor";

export interface EditorMarker {
  severity: Monaco.MarkerSeverity;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
}
