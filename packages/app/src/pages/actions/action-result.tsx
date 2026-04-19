// import { useTheme } from "@/components/theme-provider";
// import JsonView from "@uiw/react-json-view";
// import { darkTheme } from "@uiw/react-json-view/dark";
// import { lightTheme } from "@uiw/react-json-view/light";
import { FC, useMemo } from "react";

type ParsedActionResult =
  | { kind: "text"; text: string }
  | { kind: "jsonStructured"; value: object }
  | { kind: "jsonOther"; value: unknown };

const parseActionResultText = (raw: string): ParsedActionResult => {
  const trimmed = raw.trim();
  if (!trimmed.length) {
    return { kind: "text", text: raw };
  }
  try {
    const value = JSON.parse(trimmed);
    if (value !== null && typeof value === "object") {
      return { kind: "jsonStructured", value: value as object };
    }
    return { kind: "jsonOther", value };
  } catch {
    return { kind: "text", text: raw };
  }
};

export const ActionResultDisplay: FC<{ content: string }> = ({ content }) => {
  // const { getActualColorMode } = useTheme();
  const parsed = useMemo(() => parseActionResultText(content), [content]);
  // const themeStyle = getActualColorMode() === "dark" ? darkTheme : lightTheme;

  // if (parsed.kind === "jsonStructured") {
  //   return (
  //     <JsonView
  //       value={parsed.value}
  //       style={themeStyle}
  //       collapsed={1}
  //       shortenTextAfterLength={0}
  //       displayDataTypes={false}
  //       className="rounded-md bg-transparent text-left"
  //     />
  //   );
  // }

  if (parsed.kind === "jsonOther" || parsed.kind === "jsonStructured") {
    return (
      <pre className="m-0 whitespace-pre-wrap break-words text-sm leading-relaxed">
        {JSON.stringify(parsed.value, null, 2)}
      </pre>
    );
  }

  return (
    <pre className="m-0 whitespace-pre-wrap break-words text-sm leading-relaxed">
      {parsed.text}
    </pre>
  );
};
