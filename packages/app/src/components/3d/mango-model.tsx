import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

// Path to the model
const MODEL_PATH = "/mango.glb";

// Simple fallback when model isn't loaded
const FallbackShape = () => (
  <mesh>
    <sphereGeometry args={[1, 32, 32]} />
    <meshStandardMaterial color="orange" wireframe />
  </mesh>
);

export const MangoModel = ({
  rotation = { x: 0, y: 0, z: 0 },
}: {
  rotation?: { x: number; y: number; z: number };
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Load the model
  const { scene } = useGLTF(MODEL_PATH);

  // Apply rotation on each frame
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = rotation.x * Math.PI;
      groupRef.current.rotation.z = rotation.y * Math.PI;
      groupRef.current.rotation.y = rotation.z * Math.PI;
    }
  });

  // If scene exists, show it, otherwise show fallback
  return (
    <group ref={groupRef}>
      {scene ? (
        <primitive object={scene} scale={[0.6, 0.6, 0.6]} />
      ) : (
        <FallbackShape />
      )}
    </group>
  );
};

// Preload the model
useGLTF.preload(MODEL_PATH);

export default MangoModel;
