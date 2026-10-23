"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { TwinWorld } from "@/components/twin/TwinWorld";

const noop = () => {};
const TARGET: [number, number, number] = [0, 0, 3];

/** Slow cinematic sweep around the colony. No OrbitControls, so it never captures touch or scroll on phones. */
function Sweep({ animate }: { animate: boolean }) {
  useFrame(({ camera, clock }) => {
    const a = 0.73 + (animate ? 0.5 * Math.sin(clock.elapsedTime * 0.12) : 0);
    camera.position.set(TARGET[0] + 36 * Math.sin(a), 18, TARGET[2] + 36 * Math.cos(a));
    camera.lookAt(...TARGET);
  });
  return null;
}

export default function HeroScene({ animate }: { animate: boolean }) {
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [26, 18, 33], fov: 34 }} role="img" aria-label="Illustrative 3D demo colony with a slowly rising and falling flood scenario" style={{ touchAction: "pan-y" }}>
      <color attach="background" args={["#e6edf0"]} />
      <fog attach="fog" args={["#e6edf0", 70, 150]} />
      <hemisphereLight args={["#ffffff", "#b9b39c", 0.9]} />
      <directionalLight position={[16, 28, 12]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.03}
        shadow-camera-left={-28} shadow-camera-right={28} shadow-camera-top={28} shadow-camera-bottom={-28} shadow-camera-near={1} shadow-camera-far={90} />
      <TwinWorld layer="flood" waterM={0} selectedId={null} hoveredId={null} onSelect={noop} onHover={noop} demoLoop={animate} />
      <Sweep animate={animate} />
    </Canvas>
  );
}
