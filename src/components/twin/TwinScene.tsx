"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TwinWorld, type WorldProps } from "@/components/twin/TwinWorld";

export default function TwinScene(props: WorldProps) {
  return (
    <Canvas
      shadows dpr={[1, 2]} camera={{ position: [24, 19, 27], fov: 36 }}
      role="img" aria-label="Interactive 3D illustration of a demo neighbourhood. Use the building list for keyboard access."
      onPointerMissed={() => props.onSelect(null)}
    >
      <color attach="background" args={["#e6edf0"]} />
      <fog attach="fog" args={["#e6edf0", 70, 150]} />
      <hemisphereLight args={["#ffffff", "#b9b39c", 0.9]} />
      <directionalLight
        position={[16, 28, 12]} intensity={1.6} castShadow
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.03}
        shadow-camera-left={-28} shadow-camera-right={28} shadow-camera-top={28} shadow-camera-bottom={-28} shadow-camera-near={1} shadow-camera-far={90}
      />
      <TwinWorld {...props} />
      <OrbitControls makeDefault enableDamping maxPolarAngle={Math.PI / 2.15} minDistance={7} maxDistance={60} target={[0, 0, 3]} />
    </Canvas>
  );
}
