import * as Monaco from "monaco-editor";
import { DeviceAutomation, DeviceInformation } from "@/types/types";

export interface EditorMarker {
  severity: Monaco.MarkerSeverity;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
}

export interface EditorConfig {
  id: string;
  config: string;
  automation: DeviceAutomation | null;
  name: string;
  information?: DeviceInformation;
  overlay?: File;
}
