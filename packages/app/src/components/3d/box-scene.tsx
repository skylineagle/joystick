import { Loader, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useState } from "react";
import BoxModel from "./box-model";

// Simple error boundary component for 3D content
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("Three.js error:", event.error);
      setHasError(true);
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-destructive">
        Error loading 3D model
      </div>
    );
  }

  return <>{children}</>;
};

// Lighting setup for box visualization
const SceneLighting = () => {
  return (
    <>
      <ambientLight intensity={0.8} />
      <spotLight
        position={[5, 5, 5]}
        angle={0.25}
        penumbra={1}
        intensity={0.8}
      />
      <spotLight
        position={[-5, 5, -5]}
        angle={0.3}
        penumbra={0.8}
        intensity={0.5}
      />
    </>
  );
};

export const BoxScene = ({
  imuData = { x: 0, y: 0, z: 0 },
}: {
  imuData?: { x: number; y: number; z: number };
}) => {
  return (
    <div className="w-full h-full aspect-square relative overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted">
      <ErrorBoundary>
        <Canvas shadows={false} dpr={[1, 2]} gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={40} />
          <SceneLighting />
          <BoxModel rotation={imuData} />
          <gridHelper args={[10, 10, "#666666", "#444444"]} />
        </Canvas>

        <Loader />
      </ErrorBoundary>
      <div className="absolute top-2 right-2 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground">
        Box rotates based on IMU data
      </div>
    </div>
  );
};

export default BoxScene;
