import { TerminalSessions } from "@/components/terminal/terminal-sessions";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useDevice } from "@/hooks/use-device";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { useAuthStore } from "@/lib/auth";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { toast } from "@/utils/toast";
import { Play, RefreshCw, Settings, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { getTerminalTheme } from "./terminal-theme";

import "xterm/css/xterm.css";

const joystickAsciiLines = [
  "                                                                                ",
  "                                    x$&&&&&&$;                                  ",
  "                               $&&&&&&&&&&&&&&&&&&X                             ",
  "                           X&&&&$:..............;&&&&$x                         ",
  "                         $&&&;......................x&&&X                       ",
  "                       $&&&:..........................:&&&$                     ",
  "                     $&&&:............................:&&&$                   ",
  "                   $&&&:..............................:&&&$                 ",
  "                 $&&&:................................:&&&$               ",
  "               $&&&:..................................:&&&$             ",
  "             $&&&:....................................:&&&$           ",
  "           $&&&:......................................:&&&$         ",
  "         $&&&:........................................:&&&$       ",
  "       $&&&:..........................................:&&&$     ",
  "     $&&&:............................................:&&&$   ",
  "   $&&&:..............................................:&&&$ ",
  " $&&&:................................................:&&&$",
  " $&&&:................................................:&&&$",
  "   $&&&:..............................................:&&&$ ",
  "     $&&&:............................................:&&&$   ",
  "       $&&&:..........................................:&&&$     ",
  "         $&&&:........................................:&&&$       ",
  "           $&&&:......................................:&&&$         ",
  "             $&&&:....................................:&&&$           ",
  "               $&&&:..................................:&&&$             ",
  "                 $&&&:................................:&&&$               ",
  "                   $&&&:..............................:&&&$                 ",
  "                     $&&&:............................:&&&$                   ",
  "                       $&&&:..........................:&&&$                     ",
  "                         $&&&;......................x&&&X                       ",
  "                           X&&&&$:..............;&&&&$x                         ",
  "                               $&&&&&&&&&&&&&&&&&&X                             ",
  "                                    x$&&&&&&$;                                  ",
  "                                                                                ",
];

const matrixChars =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";

export function TerminalPage() {
  const { getActualColorMode, designTheme } = useTheme();
  const terminalRef = useRef<HTMLDivElement>(null);
  const { device: deviceId } = useParams();
  const { data: selectedDevice, isLoading: isDeviceLoading } = useDevice(
    deviceId ?? ""
  );
  const [, setActiveMiniGame] = useState<string | null>(null);
  const isEasterEggsPermitted = useIsPermitted("easter-eggs");
  const { isMobileLandscape } = useMobileLandscape();
  const terminalInstance = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const commandBufferRef = useRef<string>("");
  const matrixIntervalRef = useRef<number | null>(null);
  const snakeGameIntervalRef = useRef<number | null>(null);
  const [isTerminalLoading, setIsTerminalLoading] = useState(false);
  const isMountedRef = useRef(true);
  const isTerminalRouteAllowed = useIsRouteAllowed("terminal");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { token } = useAuthStore();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "reconnecting"
  >("disconnected");
  const [showSessions, setShowSessions] = useState(false);
  const hasInitializedRef = useRef(false);

  const getStoredSessionId = () => {
    if (typeof window !== "undefined" && selectedDevice?.id) {
      return localStorage.getItem(`terminal_session_${selectedDevice.id}`);
    }
    return null;
  };

  const storeSessionId = (sessionId: string) => {
    if (typeof window !== "undefined" && selectedDevice?.id) {
      localStorage.setItem(`terminal_session_${selectedDevice.id}`, sessionId);
    }
  };

  const clearStoredSessionId = () => {
    if (typeof window !== "undefined" && selectedDevice?.id) {
      localStorage.removeItem(`terminal_session_${selectedDevice.id}`);
    }
  };

  const initializeTerminal = useCallback(() => {
    if (!terminalRef.current || !selectedDevice?.configuration) {
      return;
    }

    const storedSessionId = getStoredSessionId();
    const hasValidConnection = wsRef.current?.readyState === WebSocket.OPEN;

    if (storedSessionId && hasValidConnection) {
      return;
    }

    const cleanupExistingConnection = () => {
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;

        if (
          wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING
        ) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }

      if (terminalInstance.current) {
        terminalInstance.current.dispose();
        terminalInstance.current = null;
      }
    };

    cleanupExistingConnection();

    setIsTerminalLoading(true);
    setSessionStatus("connecting");

    const terminal = new Terminal({
      cursorBlink: true,
      theme: getTerminalTheme(designTheme, getActualColorMode() === "dark"),
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 14,
      lineHeight: 1.2,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());

    if (terminalRef.current) {
      try {
        terminal.open(terminalRef.current);
        fitAddon.fit();
      } catch (error) {
        console.error("Error opening terminal:", error);
      }
    }

    terminal.focus();

    terminalInstance.current = terminal;
    fitAddonRef.current = fitAddon;

    const ws = new WebSocket(`${urls.panel}/terminal?token=${token}`);
    wsRef.current = ws;

    const connectionTimeout = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.close();
        setSessionStatus("disconnected");
        setIsTerminalLoading(false);
        setIsRefreshing(false);
        toast.error({ message: "Connection timeout. Please try again." });
      }
    }, 10000);

    ws.onopen = () => {
      if (!isMountedRef.current) return;

      clearTimeout(connectionTimeout);
      console.log("WebSocket opened, attempting to connect/reconnect");

      const storedSessionId = getStoredSessionId();

      if (storedSessionId) {
        const connectMessage = {
          type: "connect",
          device: selectedDevice!.id,
          reconnect: true,
          sessionId: storedSessionId,
        };
        ws.send(JSON.stringify(connectMessage));
      } else {
        const connectMessage = {
          type: "connect",
          device: selectedDevice!.id,
        };
        ws.send(JSON.stringify(connectMessage));
      }
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;

      try {
        const data = JSON.parse(event.data);

        if (data.type === "session_created") {
          terminal.clear();
          setCurrentSessionId(data.sessionId);
          storeSessionId(data.sessionId);
          setSessionStatus("connected");
          setIsTerminalLoading(false);
          setIsRefreshing(false);
          toast.success({ message: "Terminal session created" });
        } else if (data.type === "session_restored") {
          console.log("Session restored successfully");
          setCurrentSessionId(data.sessionId);
          storeSessionId(data.sessionId);
          setSessionStatus("connected");
          setIsTerminalLoading(false);
          setIsRefreshing(false);
          toast.success({ message: "Terminal session restored" });
        } else if (data.type === "session_not_found") {
          clearStoredSessionId();
          setCurrentSessionId(null);
          setSessionStatus("disconnected");
          setIsTerminalLoading(false);
          setIsRefreshing(false);
          toast.info({ message: "Session not found, creating new session" });

          const connectMessage = {
            type: "connect",
            device: selectedDevice!.id,
          };
          ws.send(JSON.stringify(connectMessage));
        } else if (data.type === "session_terminated") {
          setCurrentSessionId(null);
          clearStoredSessionId();
          setSessionStatus("disconnected");
          setIsTerminalLoading(false);
          setIsRefreshing(false);
          toast.info({ message: "Terminal session terminated" });
        } else if (data.type === "terminal_data") {
          terminal.write(data.data);
        } else {
          terminal.write(event.data);
        }
      } catch {
        terminal.write(event.data);
      }
    };

    ws.onerror = (error) => {
      if (!isMountedRef.current) return;
      clearTimeout(connectionTimeout);
      console.error("Terminal WebSocket error:", error);
      setSessionStatus("disconnected");
      setIsTerminalLoading(false);
      setIsRefreshing(false);
      hasInitializedRef.current = false;
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      clearTimeout(connectionTimeout);
      setSessionStatus("disconnected");
      setIsTerminalLoading(false);
      setIsRefreshing(false);
      hasInitializedRef.current = false;

      if (terminalInstance.current) {
        terminalInstance.current.dispose();
        terminalInstance.current = null;
      }
    };

    const runMatrixEffect = () => {
      if (matrixIntervalRef.current) {
        window.clearInterval(matrixIntervalRef.current);
      }

      toast.success({ message: "Matrix Easter Egg Activated!" });

      const cols = terminal.cols;
      const rows = terminal.rows;

      const drops: number[] = [];
      for (let i = 0; i < cols; i++) {
        drops[i] = Math.floor(Math.random() * rows);
      }

      terminal.write("\x1b[32m");

      let frameCount = 0;
      const maxFrames = 300;

      matrixIntervalRef.current = window.setInterval(() => {
        terminal.write("\x1b[2J\x1b[H");

        for (let i = 0; i < cols; i++) {
          const char =
            matrixChars[Math.floor(Math.random() * matrixChars.length)];

          const pos = drops[i];
          if (pos >= 0 && pos < rows) {
            terminal.write(`\x1b[${pos + 1};${i + 1}H${char}`);
          }

          drops[i]++;

          if (drops[i] > rows || Math.random() > 0.98) {
            drops[i] = 0;
          }
        }

        frameCount++;
        if (frameCount >= maxFrames) {
          if (matrixIntervalRef.current) {
            window.clearInterval(matrixIntervalRef.current);
            matrixIntervalRef.current = null;
          }

          terminal.write("\x1b[0m");
          terminal.write("\x1b[2J\x1b[H");
          terminal.write(
            "Matrix effect complete. Welcome back to reality.\r\n\n"
          );

          if (ws.readyState === WebSocket.OPEN && getStoredSessionId()) {
            ws.send(
              JSON.stringify({
                type: "connect",
                device: selectedDevice.id,
                reconnect: true,
                sessionId: getStoredSessionId(),
              })
            );
          }
        }
      }, 33);
    };

    const runSnakeGame = () => {
      if (snakeGameIntervalRef.current) {
        window.clearInterval(snakeGameIntervalRef.current);
      }

      toast.success({ message: "Snake Game Activated!" });

      const cols = terminal.cols;
      const rows = terminal.rows;

      const gameWidth = Math.min(cols - 4, 40);
      const gameHeight = Math.min(rows - 6, 20);

      let snake = [
        { x: Math.floor(gameWidth / 2), y: Math.floor(gameHeight / 2) },
      ];
      let food = {
        x: Math.floor(Math.random() * gameWidth),
        y: Math.floor(Math.random() * gameHeight),
      };
      let direction = "right";
      let score = 0;
      let gameOver = false;
      let keyHandlerAdded = false;

      terminal.write("\x1b[2J\x1b[H");

      terminal.write("SNAKE GAME\r\n");
      terminal.write("Use arrow keys to move. Press 'q' to quit.\r\n\n");

      const drawGame = () => {
        terminal.write("\x1b[H");

        for (let y = 0; y < gameHeight + 2; y++) {
          for (let x = 0; x < gameWidth + 2; x++) {
            if (
              y === 0 ||
              y === gameHeight + 1 ||
              x === 0 ||
              x === gameWidth + 1
            ) {
              terminal.write("#");
            } else {
              const snakeSegment = snake.find(
                (segment) => segment.x === x - 1 && segment.y === y - 1
              );
              const isFood = food.x === x - 1 && food.y === y - 1;

              if (snakeSegment) {
                terminal.write("O");
              } else if (isFood) {
                terminal.write("*");
              } else {
                terminal.write(" ");
              }
            }
          }
          terminal.write("\r\n");
        }

        terminal.write(`\r\nScore: ${score}\r\n`);
        if (gameOver) {
          terminal.write("Game Over! Press 'r' to restart or 'q' to quit.\r\n");
        }
      };

      const updateGame = () => {
        if (gameOver) return;

        const head = { ...snake[0] };

        switch (direction) {
          case "up":
            head.y--;
            break;
          case "down":
            head.y++;
            break;
          case "left":
            head.x--;
            break;
          case "right":
            head.x++;
            break;
        }

        if (
          head.x < 0 ||
          head.x >= gameWidth ||
          head.y < 0 ||
          head.y >= gameHeight ||
          snake.some((segment) => segment.x === head.x && segment.y === head.y)
        ) {
          gameOver = true;
          return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          score++;
          food = {
            x: Math.floor(Math.random() * gameWidth),
            y: Math.floor(Math.random() * gameHeight),
          };
        } else {
          snake.pop();
        }
      };

      const handleGameKeys = (e: { key: string }) => {
        switch (e.key) {
          case "ArrowUp":
            if (direction !== "down") direction = "up";
            break;
          case "ArrowDown":
            if (direction !== "up") direction = "down";
            break;
          case "ArrowLeft":
            if (direction !== "right") direction = "left";
            break;
          case "ArrowRight":
            if (direction !== "left") direction = "right";
            break;
          case "q":
            if (snakeGameIntervalRef.current) {
              window.clearInterval(snakeGameIntervalRef.current);
              snakeGameIntervalRef.current = null;
            }
            terminal.write("\x1b[2J\x1b[H");
            terminal.write("Snake game ended. Thanks for playing!\r\n\n");

            if (ws.readyState === WebSocket.OPEN && currentSessionId) {
              ws.send(
                JSON.stringify({
                  type: "connect",
                  device: selectedDevice.id,
                  reconnect: true,
                  sessionId: currentSessionId,
                })
              );
            }

            if (keyHandlerAdded) {
              terminal.onKey(() => {});
              keyHandlerAdded = false;
            }
            break;
          case "r":
            if (gameOver) {
              snake = [
                { x: Math.floor(gameWidth / 2), y: Math.floor(gameHeight / 2) },
              ];
              food = {
                x: Math.floor(Math.random() * gameWidth),
                y: Math.floor(Math.random() * gameHeight),
              };
              direction = "right";
              score = 0;
              gameOver = false;
            }
            break;
        }
      };

      terminal.onKey((e) => {
        handleGameKeys(e.domEvent);
      });
      keyHandlerAdded = true;

      drawGame();
      snakeGameIntervalRef.current = window.setInterval(() => {
        updateGame();
        drawGame();
      }, 200);
    };

    terminal.onData((data) => {
      if (data === "\r") {
        const command = commandBufferRef.current.trim();

        if (isEasterEggsPermitted) {
          if (command === "help") {
            terminal.write("\r\n\n");
            terminal.write("🎮 Available Terminal Easter Eggs 🎮\r\n");
            terminal.write("================================\r\n\n");
            terminal.write("joystick  - Display ASCII art of a joystick\r\n");
            terminal.write("matrix    - Enter the Matrix effect\r\n");
            terminal.write("snake     - Play the classic Snake game\r\n");
            terminal.write("mariokart - Start Mario Kart game\r\n");
            terminal.write("ninja - Start Fruit Ninja game\r\n");
            terminal.write("driver - Start Drunk Driving game\r\n");
            terminal.write("angrybirds - Start Angry Birds game\r\n");
            terminal.write("doodle - Start Doodle Jump game\r\n");
            terminal.write("Other Easter Eggs (Keyboard Shortcuts):\r\n");
            terminal.write("--------------------------------\r\n");
            terminal.write("F1 - Retro Game Mode\r\n");
            terminal.write("F2 - Glitch Mode\r\n");
            terminal.write("F3 - Bubble effect\r\n");
            terminal.write("F4 - Pirate mode (arr, matey!)\r\n");
            terminal.write("F6 - Gravity effect (everything falls)\r\n");
            terminal.write("F7 - Confetti party\r\n");
            terminal.write("F8 - Barrel roll\r\n");
            terminal.write("F9 - Disco mode\r\n");
            terminal.write("F10 - Typewriter effect\r\n");
            terminal.write("F11 - Rain effect\r\n");
            terminal.write("F12 - Earthquake effect\r\n");
            terminal.write("Ctrl+Shift+E - Enable all easter eggs\r\n");
            terminal.write("Ctrl+Shift+D - Disable all easter eggs\r\n");
            terminal.write("\r\n");
            commandBufferRef.current = "";
            return;
          } else if (command === "joystick") {
            terminal.write("\r\n\n");
            joystickAsciiLines.forEach((line) => {
              terminal.write(line + "\r\n");
            });
            terminal.write("\r\n");
            commandBufferRef.current = "";
            return;
          } else if (command === "matrix") {
            terminal.write("\r\n\nEntering the Matrix...\r\n\n");
            commandBufferRef.current = "";
            setTimeout(runMatrixEffect, 1000);
            return;
          } else if (command === "snake") {
            terminal.write("\r\n\nStarting Snake game...\r\n\n");
            commandBufferRef.current = "";
            setTimeout(runSnakeGame, 1000);
            return;
          } else if (command === "mariokart") {
            terminal.write("\r\n\nStarting Mario Kart...\r\n\n");
            setActiveMiniGame("mariokart");
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "data",
                  device: selectedDevice.id,
                  sessionId: getStoredSessionId(),
                  data: "\x03",
                })
              );
            }
            return;
          } else if (command === "ninja") {
            terminal.write("\r\n\nStarting Fruit Ninja...\r\n\n");
            setActiveMiniGame("ninja");
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "data",
                  device: selectedDevice.id,
                  sessionId: getStoredSessionId(),
                  data: "\x03",
                })
              );
            }
            return;
          } else if (command === "driver") {
            terminal.write("\r\n\nStarting Drunk Driving...\r\n\n");
            setActiveMiniGame("driver");
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "data",
                  device: selectedDevice.id,
                  sessionId: getStoredSessionId(),
                  data: "\x03",
                })
              );
            }
            return;
          } else if (command === "angrybirds") {
            terminal.write("\r\n\nStarting Angry Birds Game Mode...\r\n\n");
            setActiveMiniGame("angrybirds");
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "data",
                  device: selectedDevice.id,
                  sessionId: getStoredSessionId(),
                  data: "\x03",
                })
              );
            }
            return;
          } else if (command === "doodle") {
            terminal.write("\r\n\nStarting Doodle Jump Game Mode...\r\n\n");
            setActiveMiniGame("doodle");
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "data",
                  device: selectedDevice.id,
                  sessionId: getStoredSessionId(),
                  data: "\x03",
                })
              );
            }
            return;
          }
        }
        commandBufferRef.current = "";
      } else if (data === "\u007f") {
        commandBufferRef.current = commandBufferRef.current.slice(0, -1);
      } else if (data.length === 1 && data.charCodeAt(0) >= 32) {
        commandBufferRef.current += data;
      }

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "data",
            device: selectedDevice.id,
            sessionId: getStoredSessionId(),
            data,
          })
        );
      }
    });
  }, [
    designTheme,
    getActualColorMode,
    isEasterEggsPermitted,
    selectedDevice?.configuration,
    selectedDevice?.id,
    token,
  ]);

  const handleConnect = useCallback(() => {
    if (isTerminalLoading) return;

    setCurrentSessionId(null);
    setSessionStatus("connecting");
    setIsTerminalLoading(true);

    setTimeout(() => {
      hasInitializedRef.current = false;
      initializeTerminal();
    }, 100);
  }, [initializeTerminal, isTerminalLoading]);

  const handleRefresh = useCallback(() => {
    if (isRefreshing || isTerminalLoading) return;

    setIsRefreshing(true);
    toast.info({ message: "Reconnecting terminal..." });

    const storedSessionId = getStoredSessionId();
    if (storedSessionId) {
      setCurrentSessionId(storedSessionId);
      setSessionStatus("reconnecting");
    } else {
      setCurrentSessionId(null);
      setSessionStatus("connecting");
    }

    setTimeout(() => {
      hasInitializedRef.current = false;
      initializeTerminal();
    }, 100);
  }, [initializeTerminal, isRefreshing, isTerminalLoading]);

  useEffect(() => {
    if (isRefreshing) {
      const timeoutId = setTimeout(() => {
        console.log("Refresh timeout - resetting state");
        setIsRefreshing(false);
        setSessionStatus("disconnected");
        setIsTerminalLoading(false);
        toast.error({ message: "Connection timeout. Please try again." });
      }, 15000);

      return () => clearTimeout(timeoutId);
    }
  }, [isRefreshing]);

  const handleDisconnect = useCallback(() => {
    const sessionId = getStoredSessionId();
    if (wsRef.current && sessionId) {
      try {
        wsRef.current.send(
          JSON.stringify({
            type: "disconnect",
            sessionId: sessionId,
          })
        );
      } catch (error) {
        console.error("Failed to send disconnect message:", error);
      }
    }

    clearStoredSessionId();
    setCurrentSessionId(null);
    setSessionStatus("disconnected");
    setIsTerminalLoading(false);
    hasInitializedRef.current = false;

    if (terminalInstance.current) {
      terminalInstance.current.dispose();
      terminalInstance.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    toast.info({ message: "Terminal session disconnected" });
  }, []);

  const handleReconnect = useCallback(
    (sessionId: string) => {
      setCurrentSessionId(sessionId);
      setSessionStatus("reconnecting");
      hasInitializedRef.current = false;

      setTimeout(() => {
        initializeTerminal();
      }, 100);
    },
    [initializeTerminal]
  );

  useEffect(() => {
    isMountedRef.current = true;
    hasInitializedRef.current = false;

    const storedSessionId = getStoredSessionId();
    if (storedSessionId) {
      setCurrentSessionId(storedSessionId);
      setSessionStatus("connected");
    }

    setTimeout(() => {
      if (!hasInitializedRef.current && !wsRef.current && storedSessionId) {
        initializeTerminal();
        hasInitializedRef.current = true;
      }
    }, 200);

    return () => {
      isMountedRef.current = false;
      hasInitializedRef.current = false;

      if (matrixIntervalRef.current !== null) {
        window.clearInterval(matrixIntervalRef.current);
        matrixIntervalRef.current = null;
      }

      if (snakeGameIntervalRef.current !== null) {
        window.clearInterval(snakeGameIntervalRef.current);
        snakeGameIntervalRef.current = null;
      }

      const storedSessionId = getStoredSessionId();
      if (wsRef.current && storedSessionId) {
        try {
          wsRef.current.send(
            JSON.stringify({
              type: "pause",
              sessionId: storedSessionId,
            })
          );
        } catch (error) {
          console.error("Failed to send pause message:", error);
        }
      }

      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;

        if (
          wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING
        ) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }

      if (terminalInstance.current) {
        terminalInstance.current.dispose();
        terminalInstance.current = null;
      }
    };
  }, [selectedDevice?.id, token]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = getStoredSessionId();
      if (sessionId) {
        wsRef.current?.send(
          JSON.stringify({
            type: "pause",
            sessionId: sessionId,
          })
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const sessionId = getStoredSessionId();
        if (wsRef.current && sessionId) {
          wsRef.current.send(
            JSON.stringify({
              type: "pause",
              sessionId: sessionId,
            })
          );
        }
      } else if (document.visibilityState === "visible") {
        const sessionId = getStoredSessionId();
        if (wsRef.current && sessionId) {
          wsRef.current.send(
            JSON.stringify({
              type: "resume",
              sessionId: sessionId,
            })
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (!selectedDevice) return <div>Please select a device first</div>;

  if (!isTerminalRouteAllowed) {
    return <div>You are not allowed to access this page</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Terminal</h1>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                sessionStatus === "connected" && "bg-green-500",
                sessionStatus === "connecting" && "bg-yellow-500",
                sessionStatus === "disconnected" && "bg-red-500",
                sessionStatus === "reconnecting" && "bg-blue-500"
              )}
            />
            <span className="text-sm text-muted-foreground capitalize">
              {sessionStatus}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSessions(!showSessions)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          {sessionStatus === "connected" && getStoredSessionId() && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDisconnect}
              title="Disconnect terminal"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {(sessionStatus === "connecting" ||
            sessionStatus === "reconnecting") && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isTerminalLoading || isRefreshing}
              title="Refresh connection"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  (isRefreshing || sessionStatus === "reconnecting") &&
                    "animate-spin"
                )}
              />
            </Button>
          )}
          {sessionStatus === "disconnected" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleConnect}
              disabled={isTerminalLoading}
              title="Connect to terminal"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        {showSessions && (
          <div className="absolute top-2 left-2 z-30 w-80 max-h-96 overflow-y-auto">
            <TerminalSessions
              deviceId={selectedDevice.id}
              currentSessionId={getStoredSessionId()}
              onReconnect={handleReconnect}
            />
          </div>
        )}

        {(isDeviceLoading ||
          (isTerminalLoading && sessionStatus !== "disconnected")) && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">
                {isDeviceLoading
                  ? "Loading device..."
                  : "Connecting to terminal..."}
              </p>
            </div>
          </div>
        )}
        {sessionStatus === "disconnected" ? (
          <div className="flex-1 flex items-center justify-center m-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <X className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Terminal Disconnected</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  The terminal connection has been closed. Click the connect
                  button to start a new session.
                </p>
              </div>
              <Button onClick={handleConnect} disabled={isTerminalLoading}>
                <Play className="h-4 w-4 mr-2" />
                Connect Terminal
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "flex gap-4 md:gap-6 h-full",
              isMobileLandscape ? "flex-row" : "flex-col md:flex-row"
            )}
          >
            <div ref={terminalRef} className="size-full" />
          </div>
        )}
      </div>
    </div>
  );
}
