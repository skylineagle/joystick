import { Environment, Html, Loader, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import MangoModel from "./mango-model";

// Simple fallback content while the model loads
const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="orange" />
    <Html center>
      <div className="bg-black/50 text-white p-2 rounded-md">
        Loading model...
      </div>
    </Html>
  </mesh>
);

// Basic lighting for the scene
const BasicLighting = () => (
  <>
    <ambientLight intensity={0.8} />
    <pointLight position={[10, 10, 10]} intensity={1} />
    <pointLight position={[-10, -10, -10]} intensity={0.5} />
  </>
);

export const MangoScene = ({
  imuData = { x: 0, y: 0, z: 0 },
  showControls = true,
}: {
  imuData?: { x: number; y: number; z: number };
  showControls?: boolean;
}) => {
  return (
    <div className="w-full h-full aspect-square relative overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted">
      <div className="absolute top-0 left-0 bg-black/70 text-white p-2 z-10 text-xs">
        GLB Model Debug Mode
      </div>

      <Canvas
        shadows={false}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 5], fov: 45 }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <MangoModel rotation={imuData} />
          <BasicLighting />
          <Environment preset="sunset" background={false} />
          {showControls && <OrbitControls />}
          <axesHelper args={[5]} />
        </Suspense>
      </Canvas>

      <Loader />
    </div>
  );
};

export default MangoScene;
