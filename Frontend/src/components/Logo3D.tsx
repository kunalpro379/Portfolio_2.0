import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useMemo, Suspense } from "react";
import * as THREE from "three";
import { Edges, Text } from "@react-three/drei";

// Default dark colors — can be overridden via props
const DEFAULT_BG_HEX = "#0e0e10";
const DEFAULT_LINE_HEX = "#58585e";
const LINE_WIDTH = 1.2;

// Module-level color refs so inner components can read them
let activeBgHex = DEFAULT_BG_HEX;
let activeLineHex = DEFAULT_LINE_HEX;
let activeStripeOpacityBase = 0.35;

// Generate a horizontal-line texture via canvas
function makeStripeTexture(opacity = 0.35) {
  const size = 64;
  const lineSpacing = 4;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = `rgba(${activeLineHex === DEFAULT_LINE_HEX ? '88, 88, 94' : '120, 120, 130'}, ${opacity})`;
  ctx.lineWidth = 1;
  for (let y = 0; y < size; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(size, y + 0.5);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

function useStripeMaterial(opacity = 0.35) {
  const texture = useMemo(() => makeStripeTexture(opacity), [opacity]);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false,
      }),
    [texture]
  );
  return mat;
}

// Shared slow rotation
function SlowSpin({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.3;
  });
  return <group ref={ref}>{children}</group>;
}

// Helper: a face mesh that uses canvas-based stripes
function StripeFace({
  position,
  rotation,
  args,
  opacity = 0.35,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  args?: [number, number];
  opacity?: number;
}) {
  const texture = useMemo(() => makeStripeTexture(opacity), [opacity]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={args || [1.3, 1.3]} />
      <meshBasicMaterial map={texture} transparent side={THREE.FrontSide} depthWrite={false} />
    </mesh>
  );
}

// Helper: text on cube face
function TextFace({
  text,
  position,
  rotation,
  fontSize = 0.15,
}: {
  text: string;
  position: [number, number, number];
  rotation: [number, number, number];
  fontSize?: number;
}) {
  return (
    <Text
      position={position}
      rotation={rotation}
      fontSize={fontSize}
      color={activeLineHex}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

// Box with stripes on all 6 faces
function StripedBox({
  width = 1.3,
  height = 1.3,
  depth = 1.3,
  opacity = 0.25,
  showText = false,
}: {
  width?: number;
  height?: number;
  depth?: number;
  opacity?: number;
  showText?: boolean;
}) {
  const hx = width / 2 + 0.01;
  const hy = height / 2 + 0.01;
  const hz = depth / 2 + 0.01;
  const faces: { pos: [number, number, number]; rot: [number, number, number]; args: [number, number] }[] = [
    { pos: [0, 0, hz], rot: [0, 0, 0], args: [width, height] },
    { pos: [0, 0, -hz], rot: [0, Math.PI, 0], args: [width, height] },
    { pos: [hx, 0, 0], rot: [0, Math.PI / 2, 0], args: [depth, height] },
    { pos: [-hx, 0, 0], rot: [0, -Math.PI / 2, 0], args: [depth, height] },
    { pos: [0, hy, 0], rot: [-Math.PI / 2, 0, 0], args: [width, depth] },
    { pos: [0, -hy, 0], rot: [Math.PI / 2, 0, 0], args: [width, depth] },
  ];

  const textData = [
    { text: "ADAPTABILITY", pos: [0, 0, hz + 0.02], rot: [0, 0, 0] },
    { text: "COMPETENCE", pos: [0, 0, -hz - 0.02], rot: [0, Math.PI, 0] },
    { text: "RESILIENCE", pos: [hx + 0.02, 0, 0], rot: [0, Math.PI / 2, 0] },
    { text: "INTEGRITY", pos: [-hx - 0.02, 0, 0], rot: [0, -Math.PI / 2, 0] },
    { text: "EXCELLENCE", pos: [0, hy + 0.02, 0], rot: [-Math.PI / 2, 0, 0] },
    { text: "DISCIPLINE", pos: [0, -hy - 0.02, 0], rot: [Math.PI / 2, 0, 0] },
  ];

  return (
    <>
      {faces.map((f, i) => (
        <StripeFace key={i} position={f.pos} rotation={f.rot} args={f.args} opacity={opacity} />
      ))}
      {showText && textData.map((t, i) => (
        <TextFace key={i} text={t.text} position={t.pos} rotation={t.rot} fontSize={0.12} />
      ))}
    </>
  );
}

// 1. Single cube with one highlighted face
function CubeHighlight() {
  return (
    <SlowSpin>
      <group rotation={[Math.PI * 0.15, Math.PI * 0.25, 0]}>
        <mesh>
          <boxGeometry args={[1.3, 1.3, 1.3]} />
          <meshBasicMaterial transparent opacity={0} />
          <Edges lineWidth={LINE_WIDTH} color={activeLineHex} />
        </mesh>
        <StripedBox width={1.3} height={1.3} depth={1.3} opacity={0.3} showText={true} />
      </group>
    </SlowSpin>
  );
}

// 2. Three stacked offset cubes (priority tiers)
function StackedCubes() {
  const cubeTexts = [
    ["ADAPTABILITY", "COMPETENCE", "RESILIENCE", "INTEGRITY", "EXCELLENCE", "DISCIPLINE"],
    ["INNOVATION", "LEADERSHIP", "GROWTH", "VISION", "STRATEGY", "FOCUS"],
    ["AGILITY", "PRECISION", "QUALITY", "EFFICIENCY", "RELIABILITY", "TRUST"],
  ];

  return (
    <SlowSpin>
      <group rotation={[Math.PI * 0.15, Math.PI * 0.25, 0]}>
        {[0.5, 0, -0.5].map((y, i) => (
          <group key={i} position={[i * 0.12, y, -i * 0.12]}>
            <mesh>
              <boxGeometry args={[0.7, 0.35, 0.7]} />
              <meshBasicMaterial color={activeBgHex} toneMapped={false} />
              <Edges lineWidth={LINE_WIDTH} color={activeLineHex} />
            </mesh>
            <StripedBox width={0.7} height={0.35} depth={0.7} opacity={0.2} />
            {/* Text on all 6 faces */}
            {cubeTexts[i].map((text, faceIndex) => {
              const positions = [
                [0, 0, 0.36], // front
                [0, 0, -0.36], // back
                [0.36, 0, 0], // right
                [-0.36, 0, 0], // left
                [0, 0.18, 0], // top
                [0, -0.18, 0], // bottom
              ];
              const rotations = [
                [0, 0, 0],
                [0, Math.PI, 0],
                [0, Math.PI / 2, 0],
                [0, -Math.PI / 2, 0],
                [-Math.PI / 2, 0, 0],
                [Math.PI / 2, 0, 0],
              ];
              return (
                <TextFace
                  key={faceIndex}
                  text={text}
                  position={positions[faceIndex] as [number, number, number]}
                  rotation={rotations[faceIndex] as [number, number, number]}
                  fontSize={0.08}
                />
              );
            })}
          </group>
        ))}
      </group>
    </SlowSpin>
  );
}

// 3. Triangular prism
function Prism() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const s = 0.75;
    shape.moveTo(0, s);
    shape.lineTo(-s * 0.866, -s * 0.5);
    shape.lineTo(s * 0.866, -s * 0.5);
    shape.closePath();
    const extrudeSettings = { depth: 0.8, bevelEnabled: false };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  const mat = useStripeMaterial(0.25);

  return (
    <SlowSpin>
      <group rotation={[Math.PI * 0.15, Math.PI * 0.25, 0]}>
        <mesh geometry={geometry} position={[0, 0, -0.4]} material={mat} />
        <mesh geometry={geometry} position={[0, 0, -0.4]}>
          <meshBasicMaterial transparent opacity={0} />
          <Edges lineWidth={LINE_WIDTH} color={activeLineHex} />
        </mesh>
      </group>
    </SlowSpin>
  );
}

// 4. Open cube with inner diagonal plane
function OpenCube() {
  const diagMat = useStripeMaterial(0.15);
  const cubeTexts = ["ADAPTABILITY", "COMPETENCE", "RESILIENCE", "INTEGRITY", "EXCELLENCE", "DISCIPLINE"];
  
  return (
    <SlowSpin>
      <group rotation={[Math.PI * 0.15, Math.PI * 0.25, 0]}>
        <mesh>
          <boxGeometry args={[1.3, 1.3, 1.3]} />
          <meshBasicMaterial transparent opacity={0} />
          <Edges lineWidth={LINE_WIDTH} color={activeLineHex} />
        </mesh>
        <StripedBox width={1.3} height={1.3} depth={1.3} opacity={0.2} />
        <mesh rotation={[0, Math.PI * 0.25, 0]} material={diagMat}>
          <planeGeometry args={[1.8, 1.3]} />
        </mesh>
        {/* Text on all 6 faces */}
        {cubeTexts.map((text, faceIndex) => {
          const positions = [
            [0, 0, 0.66], // front
            [0, 0, -0.66], // back
            [0.66, 0, 0], // right
            [-0.66, 0, 0], // left
            [0, 0.66, 0], // top
            [0, -0.66, 0], // bottom
          ];
          const rotations = [
            [0, 0, 0],
            [0, Math.PI, 0],
            [0, Math.PI / 2, 0],
            [0, -Math.PI / 2, 0],
            [-Math.PI / 2, 0, 0],
            [Math.PI / 2, 0, 0],
          ];
          return (
            <TextFace
              key={faceIndex}
              text={text}
              position={positions[faceIndex] as [number, number, number]}
              rotation={rotations[faceIndex] as [number, number, number]}
              fontSize={0.1}
            />
          );
        })}
      </group>
    </SlowSpin>
  );
}

// 5. Three converging planes
function ConvergingPlanes() {
  const planeTexts = ["COLLABORATION", "TEAMWORK", "SOLIDARITY"];
  return (
    <SlowSpin>
      <group rotation={[Math.PI * 0.1, Math.PI * 0.2, 0]}>
        {[0, 1, 2].map((i) => (
          <group key={i}>
            <StripeFace
              rotation={[0, (Math.PI * 2 * i) / 3, 0]}
              position={[
                Math.sin((Math.PI * 2 * i) / 3) * 0.15,
                0,
                Math.cos((Math.PI * 2 * i) / 3) * 0.15,
              ]}
              args={[1, 1.3]}
              opacity={i === 0 ? 0.35 : i === 1 ? 0.2 : 0.1}
            />
            <TextFace
              text={planeTexts[i]}
              position={[
                Math.sin((Math.PI * 2 * i) / 3) * 0.3,
                0,
                Math.cos((Math.PI * 2 * i) / 3) * 0.3,
              ]}
              rotation={[0, (Math.PI * 2 * i) / 3, 0]}
              fontSize={0.12}
            />
          </group>
        ))}
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 1.3, 8]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.5} />
        </mesh>
      </group>
    </SlowSpin>
  );
}

const LOGOS = [
  { name: "Cube", component: CubeHighlight },
  { name: "Stacked", component: StackedCubes },
  { name: "Prism", component: Prism },
  { name: "Open Cube", component: OpenCube },
  { name: "Planes", component: ConvergingPlanes },
];

function CameraZoomController({ zoom }: { zoom: number }) {
  const { camera } = useThree();

  useEffect(() => {
    const ortho = camera as THREE.OrthographicCamera;
    ortho.zoom = zoom;
    ortho.updateProjectionMatrix();
  }, [camera, zoom]);

  return null;
}

export function Logo3D({ variant = 0, size = 28, zoom: zoomOverride, bgHex, lineHex }: { variant?: number; size?: number; zoom?: number; bgHex?: string; lineHex?: string }) {
  const LogoComponent = LOGOS[variant]?.component || CubeHighlight;

  // Update module-level colors so inner components pick them up
  activeBgHex = bgHex || DEFAULT_BG_HEX;
  activeLineHex = lineHex || DEFAULT_LINE_HEX;

  const zoom = zoomOverride ?? size * (200 / 28);

  return (
    <div style={{ width: size, height: size }} className="shrink-0">
      <Canvas
        flat
        orthographic
        dpr={[2, 3]}
        camera={{ position: [0, 0, 4], zoom: zoom }}
        style={{ background: "transparent", outline: "none" }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <CameraZoomController zoom={zoom} />
          <LogoComponent />
        </Suspense>
      </Canvas>
    </div>
  );
}