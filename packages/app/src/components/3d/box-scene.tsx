import { Loader, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import BoxModel from "./box-model";

export const BoxScene = ({
  imuData = { x: 0, y: 0, z: 0 },
}: {
  imuData?: { x: number; y: number; z: number };
}) => {
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

  return (
    <div className="w-full h-[200px] relative overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted">
      <Canvas shadows={false} dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={40} />
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
        <BoxModel rotation={imuData} />
        <gridHelper args={[10, 10, "#666666", "#444444"]} />
      </Canvas>
      <Loader />
    </div>
  );
};

export default BoxScene;
