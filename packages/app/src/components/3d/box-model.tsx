import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export const BoxModel = ({
  rotation = { x: 0, y: 0, z: 0 },
}: {
  rotation?: { x: number; y: number; z: number };
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Direct mapping of IMU data to model rotation
      groupRef.current.rotation.x = rotation.x * Math.PI;
      groupRef.current.rotation.z = rotation.y * Math.PI;
      groupRef.current.rotation.y = rotation.z * Math.PI;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Box faces with bottom face darker */}
      <group>
        {/* Top face */}
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#3B82F6"
            roughness={0.3}
            metalness={0.2}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Bottom face - darker color */}
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#1E3A8A"
            roughness={0.3}
            metalness={0.2}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Front face */}
        <mesh position={[0, 0, 0.5]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#3B82F6"
            roughness={0.3}
            metalness={0.2}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Back face */}
        <mesh position={[0, 0, -0.5]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#3B82F6"
            roughness={0.3}
            metalness={0.2}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Left face */}
        <mesh position={[-0.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#3B82F6"
            roughness={0.3}
            metalness={0.2}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Right face */}
        <mesh position={[0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#3B82F6"
            roughness={0.3}
            metalness={0.2}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Edges for better visibility */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
        <lineBasicMaterial color="#1E40AF" linewidth={1} />
      </lineSegments>

      {/* X axis indicator (red) */}
      <mesh position={[1, 0, 0]} scale={[0.6, 0.05, 0.05]}>
        <boxGeometry />
        <meshStandardMaterial color="#EF4444" />
      </mesh>

      {/* Y axis indicator (green) */}
      <mesh position={[0, 1, 0]} scale={[0.05, 0.6, 0.05]}>
        <boxGeometry />
        <meshStandardMaterial color="#22C55E" />
      </mesh>

      {/* Z axis indicator (blue) */}
      <mesh position={[0, 0, 1]} scale={[0.05, 0.05, 0.6]}>
        <boxGeometry />
        <meshStandardMaterial color="#3B82F6" />
      </mesh>
    </group>
  );
};

export default BoxModel;
