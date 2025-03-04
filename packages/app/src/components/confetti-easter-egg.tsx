import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "@/utils/toast";

export function ConfettiEasterEgg({ children }: { children: React.ReactNode }) {
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<number | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset click count after a delay
  useEffect(() => {
    if (clickCount > 0) {
      if (clickTimerRef.current) {
        window.clearTimeout(clickTimerRef.current);
      }

      clickTimerRef.current = window.setTimeout(() => {
        setClickCount(0);
      }, 2000); // Reset after 2 seconds of inactivity
    }

    return () => {
      if (clickTimerRef.current) {
        window.clearTimeout(clickTimerRef.current);
      }
    };
  }, [clickCount]);

  // Check for easter egg trigger
  useEffect(() => {
    if (clickCount === 5) {
      triggerConfettiEasterEgg();
      setClickCount(0);
    }
  }, [clickCount]);

  // Create and append canvas for confetti on mount
  useEffect(() => {
    // Create canvas element for confetti
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    canvas.id = "confetti-canvas";

    // Only append if it doesn't exist already
    if (!document.getElementById("confetti-canvas")) {
      document.body.appendChild(canvas);
      confettiCanvasRef.current = canvas;
    }

    return () => {
      // Clean up canvas on unmount
      if (confettiCanvasRef.current) {
        document.body.removeChild(confettiCanvasRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClickCount((prev) => prev + 1);
  };

  const triggerConfettiEasterEgg = () => {
    // Show toast message
    toast.success({ message: "Confetti Party! 🎉" });

    // Create confetti
    const myConfetti = confetti.create(confettiCanvasRef.current!, {
      resize: true,
      useWorker: true,
    });

    // Fire confetti
    const end = Date.now() + 3000; // 3 seconds

    const colors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
    ];

    (function frame() {
      myConfetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });

      myConfetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Fire off some final bursts after a delay
    setTimeout(() => {
      myConfetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
      });
    }, 1000);

    setTimeout(() => {
      myConfetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
      });
    }, 2000);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F7") {
        setClickCount(5);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return <div onClick={handleClick}>{children}</div>;
}
