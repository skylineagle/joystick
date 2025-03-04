import { useTheme } from "@/components/theme-provider";
import { useDevice } from "@/hooks/use-device";
import { urls } from "@/lib/urls";
import { toast } from "@/utils/toast";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { customDarkTheme, customLightTheme } from "./terminal-theme";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import "xterm/css/xterm.css";

// ASCII art for the easter egg as individual lines for better terminal display
const joystickAsciiLines = [
  "     _                 _   _      _    ",
  "    | | ___  _   _ ___| |_(_) ___| | __",
  " _  | |/ _ \\| | | / __| __| |/ __| |/ /",
  "| |_| | (_) | |_| \\__ \\ |_| | (__|   < ",
  " \\___/ \\___/ \\__, |___/\\__|_|\\___|_|\\_\\",
  "             |___/                     ",
];

// Matrix characters for the matrix easter egg
const matrixChars =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";

export function TerminalPage() {
  const { theme } = useTheme();
  const terminalRef = useRef<HTMLDivElement>(null);
  const { device: deviceId } = useParams();
  const { data: selectedDevice } = useDevice(deviceId ?? "");
  const [isMarioKartActive, setIsMarioKartActive] = useState(false);
  const terminalInstance = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const commandBufferRef = useRef<string>("");
  const matrixIntervalRef = useRef<number | null>(null);
  const snakeGameIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !selectedDevice?.configuration) return;

    const terminal = new Terminal({
      cursorBlink: true,
      theme: theme === "dark" ? customDarkTheme : customLightTheme,
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

        if (command === "joystick-ascii") {
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
          setIsMarioKartActive(true);
          return;
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
      if (matrixIntervalRef.current) {
        window.clearInterval(matrixIntervalRef.current);
        matrixIntervalRef.current = null;
      }
      if (snakeGameIntervalRef.current) {
        window.clearInterval(snakeGameIntervalRef.current);
        snakeGameIntervalRef.current = null;
      }
      terminal.dispose();
      ws.close();
      wsRef.current = null;
      terminalInstance.current = null;
      fitAddonRef.current = null;
      commandBufferRef.current = "";
    };
  }, [selectedDevice, theme]);

  if (!selectedDevice) return <div>Please select a device first</div>;

  return (
    <>
      {isMarioKartActive && (
        <div className="flex items-center justify-center">
          <iframe
            src="https://funhtml5games.com?embed=mariokart"
            className="h-[400px] w-[640px] rounded-3xl self-center"
          />
          <Button
            onClick={() => setIsMarioKartActive(false)}
            className="relative top-2 left-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 z-10 transition-colors"
            aria-label="Close Mario Kart"
          >
            <X />
          </Button>
        </div>
      )}
      <div ref={terminalRef} className="size-full rounded-3xl" />
    </>
  );
}
