import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function VaporwaveEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (Alt+V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply vaporwave effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove styles
      const styleElement = document.getElementById("vaporwave-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }

      // Remove grid background
      const gridBackground = document.getElementById("vaporwave-grid");
      if (gridBackground) {
        document.body.removeChild(gridBackground);
      }

      // Remove palm tree
      const palmTree = document.getElementById("vaporwave-palm");
      if (palmTree) {
        document.body.removeChild(palmTree);
      }

      // Remove statue
      const statue = document.getElementById("vaporwave-statue");
      if (statue) {
        document.body.removeChild(statue);
      }

      // Reset document colors
      document.documentElement.style.removeProperty("--background");
      document.documentElement.style.removeProperty("--foreground");
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--secondary");
      document.documentElement.style.removeProperty("--accent");

      return;
    }

    // Show toast notification
    toast.success({ message: "Vaporwave mode activated! 🌴" });

    // Add CSS for vaporwave effect
    const styleElement = document.createElement("style");
    styleElement.id = "vaporwave-style";
    styleElement.textContent = `
      :root {
        --vaporwave-pink: #ff71ce;
        --vaporwave-blue: #01cdfe;
        --vaporwave-purple: #b967ff;
        --vaporwave-yellow: #fffb96;
        --vaporwave-green: #05ffa1;
      }
      
      body {
        background-color: #000033 !important;
        color: var(--vaporwave-pink) !important;
        font-family: "Arial", sans-serif !important;
        letter-spacing: 1px !important;
      }
      
      h1, h2, h3, h4, h5, h6 {
        color: var(--vaporwave-blue) !important;
        text-shadow: 3px 3px var(--vaporwave-pink) !important;
        font-weight: bold !important;
      }
      
      button, .button {
        background: linear-gradient(45deg, var(--vaporwave-purple), var(--vaporwave-pink)) !important;
        border: 2px solid var(--vaporwave-blue) !important;
        color: white !important;
        text-shadow: 1px 1px 2px black !important;
        box-shadow: 0 0 10px var(--vaporwave-purple) !important;
      }
      
      input, select, textarea {
        background-color: rgba(0, 0, 51, 0.7) !important;
        border: 1px solid var(--vaporwave-pink) !important;
        color: var(--vaporwave-yellow) !important;
      }
      
      a {
        color: var(--vaporwave-green) !important;
        text-decoration: none !important;
      }
      
      a:hover {
        color: var(--vaporwave-blue) !important;
        text-shadow: 0 0 5px var(--vaporwave-blue) !important;
      }
      
      .card, .container, .box {
        background: linear-gradient(135deg, rgba(1, 205, 254, 0.2), rgba(255, 113, 206, 0.2)) !important;
        border: 1px solid var(--vaporwave-pink) !important;
        box-shadow: 0 0 15px rgba(185, 103, 255, 0.5) !important;
        backdrop-filter: blur(5px) !important;
      }
      
      /* Grid background animation */
      @keyframes grid-move {
        0% {
          transform: translateY(0) perspective(500px) rotateX(60deg);
        }
        100% {
          transform: translateY(50%) perspective(500px) rotateX(60deg);
        }
      }
      
      #vaporwave-grid {
        animation: grid-move 20s linear infinite;
      }
      
      /* Palm tree animation */
      @keyframes palm-sway {
        0% {
          transform: rotate(-5deg);
        }
        50% {
          transform: rotate(5deg);
        }
        100% {
          transform: rotate(-5deg);
        }
      }
      
      #vaporwave-palm {
        animation: palm-sway 10s ease-in-out infinite;
      }
    `;
    document.head.appendChild(styleElement);

    // Set vaporwave colors
    document.documentElement.style.setProperty("--background", "#000033");
    document.documentElement.style.setProperty("--foreground", "#ff71ce");
    document.documentElement.style.setProperty("--primary", "#01cdfe");
    document.documentElement.style.setProperty("--secondary", "#b967ff");
    document.documentElement.style.setProperty("--accent", "#05ffa1");

    // Create grid background
    const gridBackground = document.createElement("div");
    gridBackground.id = "vaporwave-grid";
    gridBackground.style.position = "fixed";
    gridBackground.style.top = "0";
    gridBackground.style.left = "0";
    gridBackground.style.width = "100%";
    gridBackground.style.height = "100%";
    gridBackground.style.backgroundImage =
      "linear-gradient(0deg, transparent 24%, rgba(255, 113, 206, 0.5) 25%, rgba(255, 113, 206, 0.5) 26%, transparent 27%, transparent 74%, rgba(255, 113, 206, 0.5) 75%, rgba(255, 113, 206, 0.5) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 113, 206, 0.5) 25%, rgba(255, 113, 206, 0.5) 26%, transparent 27%, transparent 74%, rgba(255, 113, 206, 0.5) 75%, rgba(255, 113, 206, 0.5) 76%, transparent 77%, transparent)";
    gridBackground.style.backgroundSize = "50px 50px";
    gridBackground.style.zIndex = "-1";
    gridBackground.style.opacity = "0.3";
    gridBackground.style.pointerEvents = "none";
    document.body.appendChild(gridBackground);

    // Create palm tree
    const palmTree = document.createElement("div");
    palmTree.id = "vaporwave-palm";
    palmTree.style.position = "fixed";
    palmTree.style.bottom = "0";
    palmTree.style.right = "20px";
    palmTree.style.width = "150px";
    palmTree.style.height = "300px";
    palmTree.style.backgroundImage =
      'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200"><path d="M50,200 L55,150 C55,150 40,140 45,120 C50,100 60,110 60,110 C60,110 50,90 60,80 C70,70 75,85 75,85 C75,85 70,60 85,55 C100,50 90,70 90,70 C90,70 100,50 95,40 C90,30 80,35 80,35 C80,35 85,20 75,10 C65,0 60,15 60,15 C60,15 55,5 45,10 C35,15 45,25 45,25 C45,25 30,20 25,30 C20,40 35,45 35,45 C35,45 20,45 15,55 C10,65 25,70 25,70 C25,70 15,75 15,85 C15,95 30,90 30,90 C30,90 20,100 25,110 C30,120 40,110 40,110 C40,110 35,125 40,135 C45,145 50,135 50,135 L45,150 L50,200 Z" fill="%2305ffa1"/></svg>\')';
    palmTree.style.backgroundSize = "contain";
    palmTree.style.backgroundRepeat = "no-repeat";
    palmTree.style.zIndex = "-1";
    palmTree.style.opacity = "0.7";
    palmTree.style.pointerEvents = "none";
    palmTree.style.transformOrigin = "bottom center";
    document.body.appendChild(palmTree);

    // Create statue
    const statue = document.createElement("div");
    statue.id = "vaporwave-statue";
    statue.style.position = "fixed";
    statue.style.bottom = "20px";
    statue.style.left = "20px";
    statue.style.width = "100px";
    statue.style.height = "200px";
    statue.style.backgroundImage =
      'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200"><rect x="40" y="180" width="20" height="20" fill="white"/><rect x="30" y="160" width="40" height="20" fill="white"/><rect x="45" y="60" width="10" height="100" fill="white"/><circle cx="50" cy="40" r="20" fill="white"/><rect x="20" y="100" width="60" height="10" fill="white"/></svg>\')';
    statue.style.backgroundSize = "contain";
    statue.style.backgroundRepeat = "no-repeat";
    statue.style.zIndex = "-1";
    statue.style.opacity = "0.5";
    statue.style.pointerEvents = "none";
    document.body.appendChild(statue);

    // Set a timeout to deactivate after 1 minute
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Vaporwave mode deactivated." });
    }, 60 * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isActive]);

  return null;
}
