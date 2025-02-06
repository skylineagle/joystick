import { WebSocketServer } from "ws";
import { randomBytes } from "crypto";
import sharp from "sharp";

const PORT = 8080;

interface Frame {
  id: string;
  timestamp: number;
  data: string; // base64 encoded JPEG data
}

async function generateTestFrame(): Promise<Frame> {
  // Create a 320x240 test pattern
  const width = 320;
  const height = 240;
  const channels = 3; // RGB
  const data = Buffer.alloc(width * height * channels);

  // Use time to create animation
  const time = Date.now() / 1000; // Convert to seconds
  const offset = Math.sin(time) * 0.5 + 0.5; // Oscillate between 0 and 1

  // Generate a moving gradient pattern
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      // Create moving patterns using time
      const xNorm = (x / width + offset) % 1;
      const yNorm = (y / height + offset) % 1;

      data[i] = Math.floor(xNorm * 255); // R - moves horizontally
      data[i + 1] = Math.floor(yNorm * 255); // G - moves vertically
      data[i + 2] = Math.floor(Math.abs(Math.sin(time * 2)) * 255); // B - pulses
    }
  }

  // Convert raw RGB buffer to JPEG using sharp
  const jpegData = await sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .jpeg({
      quality: 80,
      mozjpeg: true, // Use mozjpeg for better compression
    })
    .toBuffer();

  return {
    id: randomBytes(16).toString("hex"),
    timestamp: Date.now(),
    data: jpegData.toString("base64"),
  };
}

function startServer() {
  const wss = new WebSocketServer({ port: PORT });

  console.log(`WebSocket server started on ws://localhost:${PORT}`);

  wss.on("connection", async (ws) => {
    console.log("Client connected");

    // Send a frame every 100ms
    const interval = setInterval(async () => {
      try {
        const frame = await generateTestFrame();

        // Only send if the connection is still open
        if (ws.readyState === ws.OPEN) {
          ws.send(
            JSON.stringify({
              type: "frame",
              payload: {
                id: frame.id,
                timestamp: frame.timestamp,
                data: frame.data, // Already base64 encoded
              },
            })
          );
        }
      } catch (error) {
        console.error("Error generating frame:", error);
      }
    }, 100);

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received message:", data);
        // Handle mode changes, bitrate changes, etc.
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      clearInterval(interval);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clearInterval(interval);
    });
  });

  process.on("SIGINT", () => {
    wss.close(() => {
      console.log("Server shut down");
      process.exit(0);
    });
  });
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export { startServer };
export type { Frame };
