import { useDevice } from "@/hooks/use-device";
import { urls } from "@/lib/urls";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
// import { Atom as TerminalTheme } from "xterm-theme";

// import xtermTheme from "xterm-theme";

import "xterm/css/xterm.css";

export function TerminalPage() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { device: deviceId } = useParams();
  const { data: selectedDevice } = useDevice(deviceId ?? "");
  const terminalInstance = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !selectedDevice?.configuration) return;

    const terminal = new Terminal({
      cursorBlink: true,
      // theme: TerminalTheme,
      theme: {
        background: "#1a1b26",
        foreground: "#a9b1d6",
      },
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 14,
      lineHeight: 1.2,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());

    terminal.open(terminalRef.current);
    fitAddon.fit();

    terminalInstance.current = terminal;
    fitAddonRef.current = fitAddon;

    const ws = new WebSocket(`${urls.panel}/terminal`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "connect",
          device: selectedDevice.id,
        })
      );
    };

    ws.onmessage = (event) => {
      terminal.write(event.data);
    };

    terminal.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "data",
            device: selectedDevice.id,
            data,
          })
        );
      }
    });

    const handleResize = () => {
      fitAddon.fit();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "resize",
            device: selectedDevice.id,
            data: {
              cols: terminal.cols,
              rows: terminal.rows,
            },
          })
        );
      }
    };

    window.addEventListener("resize", handleResize);
    // Initial resize
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      terminal.dispose();
      ws.close();
      wsRef.current = null;
      terminalInstance.current = null;
      fitAddonRef.current = null;
    };
  }, [selectedDevice]);

  if (!selectedDevice) return <div>Please select a device first</div>;

  return <div ref={terminalRef} className="size-full rounded-3xl" />;
}
