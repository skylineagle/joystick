import { DesignTheme, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useDevice } from "@/hooks/use-device";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { toast } from "@/utils/toast";
import { RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import {
  bubblegumDarkTheme,
  bubblegumLightTheme,
  candyDarkTheme,
  candyLightTheme,
  coffeeDarkTheme,
  coffeeLightTheme,
  defaultDarkTheme,
  defaultLightTheme,
  graphiteDarkTheme,
  graphiteLightTheme,
  oceanDarkTheme,
  oceanLightTheme,
  retroDarkTheme,
  retroLightTheme,
} from "./terminal-theme";

import "xterm/css/xterm.css";

const joystickAsciiLines = [
  "                                       ....                                     ",
  "                                 ......:;;:.....                                ",
  "                              $x..X&&&&&&&&&&&&x..$X                            ",
  "                           $&&$.X&&X..........&&&:.&&&x                         ",
  "                         $&&$.......$&&&&&&&&X.......&&&X                       ",
  "                       $&&X........X&X......&&;........&&&X                     ",
  "                      &&$..............&&&&..............&&$                    ",
  "                    x&&+....X$$XXXX$&$.$&&$.&&&$$XX$$X....$&&                   ",
  "                    &&+...$+...:..................+...X$...$&&                  ",
  "                   &&x...$..&$::x&x..............$&&...;&...&&&                 ",
  "                  &&&...X&.X$X:.&X&...x.;..x..$&&...&&&.&x...&&                 ",
  "                  &&:...&&.;&X$$$&&............x..+..+..&&...$&$                ",
  "                 x&&...;&&&..&&&&+.&;.&:..+$.X$..$&&...&&&...x&&                ",
  "                 &&&...X&;$&x......&&$&;..x&$&$......$&Xx&:..+&&                ",
  "                 X&&...$$+++&&&x..................$&&$+xx&x..x&&                ",
  "                  &&:..&$xxxxxX$&&&&&&&&&&&&&&&&&&$xxXXXX&&..$&$                ",
  "                  &&$..&&xXXXXXX&&&:..........;&&&XXXXXX$&$..&&.                ",
  "                   &&+.X&&$X$$&&&+..............x&&&$$$$&&:.&&&                 ",
  "                   ;&&..+&&&&&&+..................X&&&&&&:.X&&                  ",
  "                    X&&+..................................$&&                   ",
  "                     $&&&...............................;&&&                    ",
  "                       $&&$:..........................;&&&X                     ",
  "                         $&&&;......................x&&&X                       ",
  "                           X&&&&$:..............;&&&&$x                         ",
  "                               $&&&&&&&&&&&&&&&&&&X                             ",
  "                                    x$&&&&&&$;                                  ",
  "                                                                                ",
];

// Matrix characters for the matrix easter egg
const matrixChars =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";

// Function to get the correct terminal theme based on current theme and color mode
function getTerminalTheme(mode: string, designTheme: DesignTheme) {
  // return mode === "dark" ? shadcnDarkTheme : shadcnLightTheme;
  switch (designTheme) {
    case "bubblegum":
      return mode === "dark" ? bubblegumDarkTheme : bubblegumLightTheme;
    case "ocean":
      return mode === "dark" ? oceanDarkTheme : oceanLightTheme;
    case "coffee":
      return mode === "dark" ? coffeeDarkTheme : coffeeLightTheme;
    case "candy":
      return mode === "dark" ? candyDarkTheme : candyLightTheme;
    case "retro":
      return mode === "dark" ? retroDarkTheme : retroLightTheme;
    case "graphite":
      return mode === "dark" ? graphiteDarkTheme : graphiteLightTheme;
    default: // "default"
      return mode === "dark" ? defaultDarkTheme : defaultLightTheme;
  }
}

export function TerminalPage() {
  const { getActualColorMode, designTheme } = useTheme();
  const terminalRef = useRef<HTMLDivElement>(null);
  const { device: deviceId } = useParams();
  const { data: selectedDevice, isLoading: isDeviceLoading } = useDevice(
    deviceId ?? ""
  );
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
  const isEasterEggsPermitted = useIsPermitted("easter-eggs");
  const { isMobileLandscape } = useMobileLandscape();
  const terminalInstance = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const commandBufferRef = useRef<string>("");
  const matrixIntervalRef = useRef<number | null>(null);
  const snakeGameIntervalRef = useRef<number | null>(null);
  const [isTerminalLoading, setIsTerminalLoading] = useState(true);
  const isMountedRef = useRef(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to initialize the terminal and connection
  const initializeTerminal = useCallback(() => {
    if (!terminalRef.current || !selectedDevice?.configuration) {
      return;
    }

    // Clean up existing terminal and connection
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

    setIsTerminalLoading(true);
    setIsRefreshing(false);

    const terminal = new Terminal({
      cursorBlink: true,
      theme: getTerminalTheme(getActualColorMode(), designTheme),
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

    const ws = new WebSocket(`${urls.panel}/terminal`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMountedRef.current) return;

      ws.send(
        JSON.stringify({
          type: "connect",
          device: selectedDevice.id,
        })
      );
      setIsTerminalLoading(false);
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;
      terminal.write(event.data);
    };

    ws.onerror = (error) => {
      if (!isMountedRef.current) return;
      console.error("Terminal WebSocket error:", error);
      terminal.write(
        "\r\n\x1b[31mError: WebSocket connection failed. Please try again.\x1b[0m\r\n"
      );
      setIsTerminalLoading(false);
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      terminal.write(
        "\r\n\x1b[33mConnection closed. Click the refresh button to reconnect.\x1b[0m\r\n"
      );
      setIsTerminalLoading(false);
    };

    // Function to run the Matrix effect
    const runMatrixEffect = () => {
      // Clear any existing interval
      if (matrixIntervalRef.current) {
        window.clearInterval(matrixIntervalRef.current);
      }

      // Show toast notification
      toast.success({ message: "Matrix Easter Egg Activated!" });

      // Get terminal dimensions
      const cols = terminal.cols;
      const rows = terminal.rows;

      // Create arrays to track the state of each column
      const drops: number[] = [];
      for (let i = 0; i < cols; i++) {
        drops[i] = Math.floor(Math.random() * rows);
      }

      // Set text color to green
      terminal.write("\x1b[32m");

      // Start the animation
      let frameCount = 0;
      const maxFrames = 300; // Run for about 10 seconds at 30fps

      matrixIntervalRef.current = window.setInterval(() => {
        // Clear the screen with a black background
        terminal.write("\x1b[2J\x1b[H");

        // Draw each drop
        for (let i = 0; i < cols; i++) {
          // Get a random character
          const char =
            matrixChars[Math.floor(Math.random() * matrixChars.length)];

          // Calculate position
          const pos = drops[i];
          if (pos >= 0 && pos < rows) {
            // Move cursor to position
            terminal.write(`\x1b[${pos + 1};${i + 1}H${char}`);
          }

          // Move drop down
          drops[i]++;

          // Reset drop with small probability or if it's off screen
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

          // Reset terminal
          terminal.write("\x1b[0m"); // Reset colors
          terminal.write("\x1b[2J\x1b[H"); // Clear screen
          terminal.write(
            "Matrix effect complete. Welcome back to reality.\r\n\n"
          );

          // Reconnect to the terminal
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: "connect",
                device: selectedDevice.id,
              })
            );
          }
        }
      }, 33); // ~30fps
    };

    // Function to run the Snake game
    const runSnakeGame = () => {
      // Clear any existing game
      if (snakeGameIntervalRef.current) {
        window.clearInterval(snakeGameIntervalRef.current);
      }

      // Show toast notification
      toast.success({ message: "Snake Game Activated!" });

      // Get terminal dimensions
      const cols = terminal.cols;
      const rows = terminal.rows;

      // Game area boundaries (leave some space for borders)
      const gameWidth = Math.min(cols - 4, 40);
      const gameHeight = Math.min(rows - 6, 20);

      // Initialize game state
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

      // Clear the screen
      terminal.write("\x1b[2J\x1b[H");

      // Draw game instructions
      terminal.write("SNAKE GAME\r\n");
      terminal.write("Use arrow keys to move. Press 'q' to quit.\r\n\n");

      // Function to draw the game board
      const drawGame = () => {
        // Clear the screen
        terminal.write("\x1b[2J\x1b[H");

        // Draw score
        terminal.write(`Score: ${score}\r\n`);

        // Draw top border
        terminal.write("+" + "-".repeat(gameWidth) + "+\r\n");

        // Draw game area with snake and food
        for (let y = 0; y < gameHeight; y++) {
          let line = "|";
          for (let x = 0; x < gameWidth; x++) {
            // Check if this position has snake
            const isSnake = snake.some(
              (segment) => segment.x === x && segment.y === y
            );
            // Check if this position has food
            const isFood = food.x === x && food.y === y;

            if (isSnake) {
              line += "O";
            } else if (isFood) {
              line += "*";
            } else {
              line += " ";
            }
          }
          line += "|\r\n";
          terminal.write(line);
        }

        // Draw bottom border
        terminal.write("+" + "-".repeat(gameWidth) + "+\r\n");

        // Show game over message if applicable
        if (gameOver) {
          terminal.write(
            "\r\nGame Over! Press 'r' to restart or 'q' to quit.\r\n"
          );
        }
      };

      // Function to update the game state
      const updateGame = () => {
        if (gameOver) return;

        // Calculate new head position based on direction
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

        // Check for collisions with walls
        if (
          head.x < 0 ||
          head.x >= gameWidth ||
          head.y < 0 ||
          head.y >= gameHeight
        ) {
          gameOver = true;
          return;
        }

        // Check for collisions with self
        if (
          snake.some((segment) => segment.x === head.x && segment.y === head.y)
        ) {
          gameOver = true;
          return;
        }

        // Add new head to snake
        snake.unshift(head);

        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
          // Increase score
          score++;

          // Generate new food
          food = {
            x: Math.floor(Math.random() * gameWidth),
            y: Math.floor(Math.random() * gameHeight),
          };
        } else {
          // Remove tail if no food was eaten
          snake.pop();
        }
      };

      // Set up key handler for game controls
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
            // Quit game
            if (snakeGameIntervalRef.current) {
              window.clearInterval(snakeGameIntervalRef.current);
              snakeGameIntervalRef.current = null;
            }
            terminal.write("\x1b[2J\x1b[H");
            terminal.write("Snake game ended. Thanks for playing!\r\n\n");

            // Reconnect to the terminal
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "connect",
                  device: selectedDevice.id,
                })
              );
            }

            // Remove key handler
            if (keyHandlerAdded) {
              terminal.onKey(() => {});
              keyHandlerAdded = false;
            }
            break;
          case "r":
            if (gameOver) {
              // Restart game
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

      // Add key handler
      terminal.onKey((e) => {
        handleGameKeys(e.domEvent);
      });
      keyHandlerAdded = true;

      // Start game loop
      drawGame();
      snakeGameIntervalRef.current = window.setInterval(() => {
        updateGame();
        drawGame();
      }, 200); // Update every 200ms
    };

    terminal.onData((data) => {
      // Check for easter egg command
      if (data === "\r") {
        // Enter key
        const command = commandBufferRef.current.trim();

        if (isEasterEggsPermitted) {
          if (command === "help") {
            // Display all available terminal easter eggs
            terminal.write("\r\n\n"); // Add some space
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
            terminal.write("Shift+Ctrl+E - Neon mode\r\n");
            terminal.write("Shift+Ctrl+S - Slow motion mode\r\n");
            terminal.write("Shift+Ctrl+P - Pixel art mode\r\n");
            terminal.write("Shift+Ctrl+M - Mirror mode\r\n");
            terminal.write("Shift+Ctrl+V - Vaporwave mode\r\n");
            terminal.write("Shift+Ctrl+Z - Zoom mode\r\n");
            terminal.write("Shift+Ctrl+J - Jitter mode\r\n");
            terminal.write("Shift+Ctrl+A - Sparkle mode\r\n");
            terminal.write("↑↑↓↓←→←→BA - Konami code\r\n\n");

            // Clear the command buffer
            commandBufferRef.current = "";

            // Send a new line to the terminal to maintain proper cursor position
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "data",
                  device: selectedDevice.id,
                  data: "\x03",
                })
              );
            }
            return;
          } else if (command === "joystick") {
            // Display the ASCII art line by line
            terminal.write("\r\n\n"); // Add some space

            // Write each line of the ASCII art with proper line breaks
            joystickAsciiLines.forEach((line) => {
              terminal.write(line + "\r\n");
            });

            terminal.write("\r\nYou found a hidden easter egg! 🎉\r\n\n");

            // Show toast notification
            toast.success({ message: "Terminal Easter Egg Activated!" });

            // Clear the command buffer
            commandBufferRef.current = "";

            // Send a new line to the terminal to maintain proper cursor position
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "data",
                  device: selectedDevice.id,
                  data: "\r",
                })
              );
            }
            return;
          } else if (command === "matrix") {
            // Run the Matrix effect
            terminal.write("\r\n\nEntering the Matrix...\r\n\n");

            // Clear the command buffer
            commandBufferRef.current = "";

            // Start the Matrix effect after a short delay
            setTimeout(runMatrixEffect, 1000);
            return;
          } else if (command === "snake") {
            // Run the Snake game
            terminal.write("\r\n\nStarting Snake game...\r\n\n");

            // Clear the command buffer
            commandBufferRef.current = "";

            // Start the Snake game after a short delay
            setTimeout(runSnakeGame, 1000);
            return;
          } else if (command === "mariokart") {
            // Run the Mario Kart game
            terminal.write("\r\n\nStarting Mario Kart...\r\n\n");
            setActiveMiniGame("mariokart");
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "data",
                  device: selectedDevice.id,
                  data: "\x03",
                })
              );
            }
            return;
          } else if (command === "ninja") {
            // Run the Ninja Game Mode
            terminal.write("\r\n\nStarting Fruit Ninja Game Mode...\r\n\n");
            setActiveMiniGame("ninja");
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "data",
                  device: selectedDevice.id,
                  data: "\x03",
                })
              );
            }
            return;
          } else if (command === "driver") {
            // Run the Driver Game Mode
            terminal.write("\r\n\nStarting Drunk Driving Game Mode...\r\n\n");
            setActiveMiniGame("driver");
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "data",
                  device: selectedDevice.id,
                  data: "\x03",
                })
              );
            }
            return;
          } else if (command === "angrybirds") {
            // Run the Angry Birds Game Mode
            terminal.write("\r\n\nStarting Angry Birds Game Mode...\r\n\n");
            setActiveMiniGame("angrybirds");
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "data",
                  device: selectedDevice.id,
                  data: "\x03",
                })
              );
            }
            return;
          } else if (command === "doodle") {
            // Run the Doodle Jump Game Mode
            terminal.write("\r\n\nStarting Doodle Jump Game Mode...\r\n\n");
            setActiveMiniGame("doodle");
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "data",
                  device: selectedDevice.id,
                  data: "\x03",
                })
              );
            }
            return;
          }
        }
        // Reset command buffer on enter
        commandBufferRef.current = "";
      } else if (data === "\u007f") {
        // Backspace
        // Remove last character from buffer
        commandBufferRef.current = commandBufferRef.current.slice(0, -1);
      } else if (data.length === 1 && data.charCodeAt(0) >= 32) {
        // Add printable characters to buffer
        commandBufferRef.current += data;
      }

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
  }, [
    designTheme,
    getActualColorMode,
    isEasterEggsPermitted,
    selectedDevice?.configuration,
    selectedDevice?.id,
  ]);

  // Function to handle refresh button click
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    toast.info({ message: "Reconnecting terminal..." });

    // Small delay to allow UI to update
    setTimeout(() => {
      initializeTerminal();
    }, 100);
  }, [initializeTerminal]);

  useEffect(() => {
    isMountedRef.current = true;

    // Initialize the terminal
    setTimeout(() => {
      initializeTerminal();
    }, 200);

    // Cleanup function
    return () => {
      isMountedRef.current = false;

      // Clear any active intervals
      if (matrixIntervalRef.current !== null) {
        window.clearInterval(matrixIntervalRef.current);
        matrixIntervalRef.current = null;
      }

      if (snakeGameIntervalRef.current !== null) {
        window.clearInterval(snakeGameIntervalRef.current);
        snakeGameIntervalRef.current = null;
      }

      // Close WebSocket connection
      if (wsRef.current) {
        // Remove event handlers to prevent memory leaks
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;

        // Close the connection
        if (
          wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING
        ) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }

      // Clean up terminal
      if (terminalInstance.current) {
        terminalInstance.current.dispose();
        terminalInstance.current = null;
      }
    };
  }, [initializeTerminal]);

  if (!selectedDevice) return <div>Please select a device first</div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {activeMiniGame && (
        <div className="flex items-center justify-center">
          {activeMiniGame === "mariokart" ? (
            <iframe
              src="https://funhtml5games.com?embed=mariokart"
              className="h-[400px] w-[640px] rounded-3xl self-center"
            />
          ) : activeMiniGame === "ninja" ? (
            <iframe
              src="https://funhtml5games.com?embed=blockninja"
              className="h-[400px] w-[640px] rounded-3xl self-center"
            />
          ) : activeMiniGame === "driver" ? (
            <iframe
              src="https://funhtml5games.com?embed=drunkdrive"
              className="h-[400px] w-[640px] rounded-3xl self-center"
            />
          ) : activeMiniGame === "angrybirds" ? (
            <iframe
              src="https://funhtml5games.com?embed=angrybirds"
              className="h-[400px] w-[640px] rounded-3xl self-center"
            />
          ) : activeMiniGame === "doodle" ? (
            <iframe
              src="https://funhtml5games.com?embed=doodlejump"
              style={{ width: "422px", height: "572px", border: "none" }}
              className="h-[400px] w-[640px] rounded-3xl self-center"
            />
          ) : null}
          <Button
            onClick={() => setActiveMiniGame(null)}
            className="relative top-2 left-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 z-10 transition-colors"
            aria-label="Close Mini Game"
          >
            <X />
          </Button>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <div className="absolute top-2 right-2 z-20">
          <Button
            size="sm"
            variant="ghost"
            className="bg-background/80 hover:bg-background/60"
            onClick={handleRefresh}
            disabled={isTerminalLoading || isRefreshing}
            title="Refresh terminal connection"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>
        {(isDeviceLoading || isTerminalLoading) && (
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
        <div
          className={cn(
            "flex gap-4 md:gap-6 h-full",
            isMobileLandscape ? "flex-row" : "flex-col md:flex-row"
          )}
        >
          <div ref={terminalRef} className="size-full" />
        </div>
      </div>
    </div>
  );
}
