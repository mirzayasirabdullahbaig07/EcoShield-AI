import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, MeshBasicMaterial, MeshStandardMaterial, type Mesh } from "three";
import { COLOUR } from "@/components/twin/geo";
import { BUILDINGS, LOT_D, LOT_W, SCALE, colourFor, demoWaterMetres, tint, type Building, type Layer } from "@/data/twin";
import { getHouseParts, getLotFrame } from "@/components/twin/houseGeometry";
import { getColony } from "@/components/twin/colonyGeometry";

export type WorldProps = {
  layer: Layer; waterM: number; selectedId: string | null; hoveredId: string | null;
  onSelect: (id: string | null) => void; onHover: (id: string | null) => void;
  demoLoop?: boolean; // landing page: water slowly rises and falls on its own
};

const VERTEX = new MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
const PLINTH = new MeshStandardMaterial({ color: COLOUR.plinth });
const GROUND_MAT = new MeshStandardMaterial({ color: "#dcd6c3" });
const FRAME = new MeshBasicMaterial({ color: "#0f6b4c" });
const UNIT = new BoxGeometry(1, 1, 1);
const GROUND = new BoxGeometry(90, 0.2, 90);

function Water({ level, loop }: { level: number; loop?: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame((state, dt) => {
    const m = ref.current;
    if (!m) return;
    const metres = loop ? demoWaterMetres(state.clock.elapsedTime) : level;
    m.position.y += (metres * SCALE - m.position.y) * Math.min(1, dt * 4); // eased rise
    m.visible = m.position.y > 0.03;
  });
  return (
    <mesh ref={ref} name="scenario-water">
      <boxGeometry args={[90, 0.1, 90]} />
      <meshStandardMaterial color="#3b82c4" transparent opacity={0.55} />
    </mesh>
  );
}

function Colony() {
  const c = getColony();
  return c.statics ? <mesh name="colony" geometry={c.statics} material={VERTEX} castShadow receiveShadow /> : null;
}

function House({ b, layer, selected, hovered, onSelect, onHover }: { b: Building; layer: Layer; selected: boolean; hovered: boolean } & Pick<WorldProps, "onSelect" | "onHover">) {
  const parts = getHouseParts(b);
  const base = b.elevation * SCALE;
  const full = colourFor(b, layer);
  const glow = selected ? 0.5 : hovered ? 0.25 : 0;
  return (
    <group
      name={`building-${b.id}`} position={[b.x, 0, b.z]}
      onClick={(e) => { e.stopPropagation(); onSelect(b.id); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover(b.id); }}
      onPointerOut={() => onHover(null)}
    >
      <mesh geometry={UNIT} material={PLINTH} position={[0, base / 2, 0]} scale={[LOT_W, base, LOT_D]} castShadow receiveShadow />
      <group position={[0, base, 0]}>
        {parts.walls && <mesh geometry={parts.walls} castShadow receiveShadow><meshStandardMaterial color={tint(full, 0.42)} emissive={full} emissiveIntensity={glow * 0.4} /></mesh>}
        {parts.band && <mesh geometry={parts.band} castShadow receiveShadow><meshStandardMaterial color={full} emissive={full} emissiveIntensity={glow * 0.6} /></mesh>}
        {parts.statics && <mesh geometry={parts.statics} material={VERTEX} castShadow receiveShadow />}
        {selected && <mesh geometry={getLotFrame()} material={FRAME} />}
      </group>
    </group>
  );
}

export function TwinWorld({ layer, waterM, selectedId, hoveredId, onSelect, onHover, demoLoop }: WorldProps) {
  return (
    <group>
      <mesh geometry={GROUND} material={GROUND_MAT} position={[0, -0.1, 2]} receiveShadow />
      <Colony />
      {BUILDINGS.map((b) => (
        <House key={b.id} b={b} layer={layer} selected={b.id === selectedId} hovered={b.id === hoveredId} onSelect={onSelect} onHover={onHover} />
      ))}
      <Water level={waterM} loop={demoLoop} />
    </group>
  );
}
