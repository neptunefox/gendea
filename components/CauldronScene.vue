<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import {
  LatheGeometry,
  ShaderMaterial,
  Vector2,
  Mesh,
  DoubleSide,
  CircleGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
  AdditiveBlending
} from 'three'

const reducedMotion = useReducedMotion()

const cauldronProfile = [
  new Vector2(0.8, 1.2),
  new Vector2(0.85, 1.15),
  new Vector2(0.9, 1.1),
  new Vector2(0.85, 1.0),
  new Vector2(0.95, 0.8),
  new Vector2(1.0, 0.5),
  new Vector2(0.95, 0.2),
  new Vector2(0.8, 0.0),
  new Vector2(0.6, -0.2),
  new Vector2(0.4, -0.3),
  new Vector2(0.3, -0.35),
  new Vector2(0.25, -0.4),
  new Vector2(0.15, -0.5),
  new Vector2(0.2, -0.55),
  new Vector2(0.2, -0.7),
  new Vector2(0.15, -0.75),
  new Vector2(0.0, -0.75),
]

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  varying vec2 vUv;

  float circuitLine(float coord, float width, float spacing) {
    float line = mod(coord, spacing);
    return smoothstep(width, 0.0, abs(line - spacing * 0.5));
  }

  float circuitPattern(vec2 uv) {
    float hLines = circuitLine(uv.y * 12.0, 0.02, 1.0);
    float vLines = circuitLine(uv.x * 8.0, 0.02, 1.0);
    float diag1 = circuitLine((uv.x + uv.y) * 6.0, 0.015, 1.0);
    float diag2 = circuitLine((uv.x - uv.y) * 6.0, 0.015, 1.0);
    float nodes = smoothstep(0.08, 0.0, length(fract(uv * 4.0) - 0.5));
    return max(max(max(hLines, vLines), max(diag1, diag2)), nodes) * 0.6;
  }

  void main() {
    vec3 baseColor = vec3(0.04, 0.1, 0.1);
    vec3 glowColor = vec3(0.0, 1.0, 0.8);
    float circuit = circuitPattern(vUv);
    vec3 finalColor = baseColor + glowColor * circuit;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

const liquidVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const liquidFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 center = vUv - 0.5;
    float angle = atan(center.y, center.x) + uTime * 0.3;
    float dist = length(center);
    
    vec2 swirlUv = vec2(
      cos(angle) * dist + 0.5,
      sin(angle) * dist + 0.5
    );
    
    float swirl = sin(swirlUv.x * 10.0 + uTime * 0.6) * sin(swirlUv.y * 10.0 + uTime * 0.4);
    swirl = swirl * 0.5 + 0.5;
    
    float glow = 1.0 - dist * 1.5;
    glow = max(0.0, glow);
    
    vec3 baseColor = vec3(0.0, 0.3, 0.3);
    vec3 glowColor = vec3(0.0, 1.0, 0.8);
    vec3 finalColor = baseColor + glowColor * (swirl * 0.4 + glow * 0.6);
    
    float alpha = smoothstep(0.5, 0.3, dist);
    gl_FragColor = vec4(finalColor, alpha);
  }
`

const cauldronGeometry = new LatheGeometry(cauldronProfile, 32)
const cauldronMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: DoubleSide,
})
const cauldronMesh = new Mesh(cauldronGeometry, cauldronMaterial)

const liquidGeometry = new CircleGeometry(0.75, 32)
const liquidMaterial = new ShaderMaterial({
  vertexShader: liquidVertexShader,
  fragmentShader: liquidFragmentShader,
  uniforms: {
    uTime: { value: 0 },
  },
  transparent: true,
  side: DoubleSide,
})
const liquidMesh = new Mesh(liquidGeometry, liquidMaterial)
liquidMesh.rotation.x = -Math.PI / 2
liquidMesh.position.y = 1.1

const SPARK_COUNT = 50

const sparkVertexShader = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uTime;
  varying float vAlpha;
  
  void main() {
    vec3 pos = position;
    float t = uTime * aSpeed + aPhase;
    
    float cycle = mod(t, 4.0);
    float rise = cycle / 4.0;
    
    pos.y += rise * 0.35;
    pos.x += sin(t * 3.0 + aPhase * 5.0) * 0.12 * (1.0 - rise * 0.5);
    pos.z += cos(t * 2.5 + aPhase * 3.0) * 0.12 * (1.0 - rise * 0.5);
    
    float fadeIn = smoothstep(0.0, 0.1, rise);
    float fadeOut = 1.0 - smoothstep(0.6, 1.0, rise);
    vAlpha = fadeIn * fadeOut;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float sizeScale = 0.7 + 0.3 * sin(t * 5.0 + aPhase);
    gl_PointSize = aSize * (800.0 / -mvPosition.z) * sizeScale;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const sparkFragmentShader = `
  varying float vAlpha;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = max(abs(center.x), abs(center.y));
    
    if (dist > 0.35) discard;
    
    float glow = 1.0 - smoothstep(0.0, 0.35, dist);
    vec3 color = vec3(1.0, 1.0, 1.0);
    
    gl_FragColor = vec4(color, glow * vAlpha);
  }
`

const sparkPositions = new Float32Array(SPARK_COUNT * 3)
const sparkSizes = new Float32Array(SPARK_COUNT)
const sparkPhases = new Float32Array(SPARK_COUNT)
const sparkSpeeds = new Float32Array(SPARK_COUNT)

for (let i = 0; i < SPARK_COUNT; i++) {
  const angle = Math.random() * Math.PI * 2
  const radius = Math.random() * 0.45
  sparkPositions[i * 3] = Math.cos(angle) * radius
  sparkPositions[i * 3 + 1] = 1.12
  sparkPositions[i * 3 + 2] = Math.sin(angle) * radius
  sparkSizes[i] = 0.04 + Math.random() * 0.06
  sparkPhases[i] = Math.random() * Math.PI * 2
  sparkSpeeds[i] = 0.4 + Math.random() * 0.6
}

const sparkGeometry = new BufferGeometry()
sparkGeometry.setAttribute('position', new Float32BufferAttribute(sparkPositions, 3))
sparkGeometry.setAttribute('aSize', new Float32BufferAttribute(sparkSizes, 1))
sparkGeometry.setAttribute('aPhase', new Float32BufferAttribute(sparkPhases, 1))
sparkGeometry.setAttribute('aSpeed', new Float32BufferAttribute(sparkSpeeds, 1))

const sparkMaterial = new ShaderMaterial({
  vertexShader: sparkVertexShader,
  fragmentShader: sparkFragmentShader,
  uniforms: {
    uTime: { value: 0 }
  },
  transparent: true,
  blending: AdditiveBlending,
  depthWrite: false
})

const sparkPoints = new Points(sparkGeometry, sparkMaterial)

function onLoop({ elapsed }: { elapsed: number }) {
  liquidMaterial.uniforms.uTime.value = elapsed
  if (!reducedMotion.value) {
    sparkMaterial.uniforms.uTime.value = elapsed
  }
}
</script>

<template>
  <ClientOnly>
    <TresCanvas :clear-color="'#0a0f0f'" @loop="onLoop">
      <TresPerspectiveCamera :position="[0, 3.5, 5]" :look-at="[0, 0.5, 0]" />
      <OrbitControls :enable-damping="true" :enable-zoom="false" :target="[0, 0.5, 0]" />

      <TresAmbientLight :intensity="0.1" />
      <TresPointLight :position="[0, 2.5, 0]" :color="'#00ffcc'" :intensity="2" />

      <primitive :object="cauldronMesh" />
      <primitive :object="liquidMesh" />
      <primitive :object="sparkPoints" />
    </TresCanvas>
  </ClientOnly>
</template>
