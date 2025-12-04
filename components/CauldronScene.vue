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
  new Vector2(0.85, 0.0),
  new Vector2(0.7, -0.15),
  new Vector2(0.5, -0.25),
  new Vector2(0.3, -0.3),
  new Vector2(0.0, -0.32),
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
    return max(max(hLines, vLines), max(diag1, diag2)) * 0.35;
  }

  void main() {
    vec3 baseColor = vec3(0.03, 0.07, 0.07);
    vec3 glowColor = vec3(0.0, 0.75, 0.6);
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
    float angle = atan(center.y, center.x) + uTime * 0.2;
    float dist = length(center);
    
    vec2 swirlUv = vec2(
      cos(angle) * dist + 0.5,
      sin(angle) * dist + 0.5
    );
    
    float swirl = sin(swirlUv.x * 10.0 + uTime * 0.5) * sin(swirlUv.y * 10.0 + uTime * 0.3);
    swirl = swirl * 0.5 + 0.5;
    
    float glow = 1.0 - dist * 1.8;
    glow = max(0.0, glow);
    
    vec3 baseColor = vec3(0.4, 0.25, 0.0);
    vec3 glowColor = vec3(1.0, 0.8, 0.0);
    vec3 finalColor = baseColor + glowColor * (swirl * 0.3 + glow * 0.6);
    
    float alpha = smoothstep(0.5, 0.25, dist);
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

const emberVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const emberFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec2 center = (vUv - 0.5) * 2.3;
    float dist = length(center);
    
    float n1 = noise(center * 4.0 + uTime * 0.18);
    float n2 = noise(center * 8.0 - uTime * 0.12);
    float n3 = noise(center * 2.0 + vec2(uTime * 0.08, -uTime * 0.1));
    float combined = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    
    float pulse = 0.85 + 0.15 * sin(uTime * 1.2 + dist * 2.5);
    float flicker = 0.92 + 0.08 * sin(uTime * 4.0 + combined * 7.0);
    
    vec3 hotCore = vec3(1.0, 0.3, 0.5);
    vec3 midGlow = vec3(0.9, 0.1, 0.3);
    vec3 outerGlow = vec3(0.6, 0.0, 0.15);
    vec3 darkCoal = vec3(0.2, 0.0, 0.05);
    
    float intensity = combined * pulse * flicker;
    intensity *= smoothstep(1.2, 0.4, dist);
    
    vec3 color = mix(darkCoal, outerGlow, smoothstep(0.2, 0.4, intensity));
    color = mix(color, midGlow, smoothstep(0.4, 0.6, intensity));
    color = mix(color, hotCore, smoothstep(0.7, 0.9, intensity));
    
    float edgeFade = smoothstep(1.2, 0.7, dist);
    float alpha = edgeFade * (0.8 + intensity * 0.4);
    
    gl_FragColor = vec4(color * (0.8 + intensity * 0.5), alpha);
  }
`

const emberGeometry = new CircleGeometry(1.15, 32)
const emberMaterial = new ShaderMaterial({
  vertexShader: emberVertexShader,
  fragmentShader: emberFragmentShader,
  uniforms: {
    uTime: { value: 0 }
  },
  transparent: true,
  blending: AdditiveBlending,
  depthWrite: false
})
const emberMesh = new Mesh(emberGeometry, emberMaterial)
emberMesh.rotation.x = -Math.PI / 2
emberMesh.position.y = -0.35

const SPARK_COUNT = 50

const sparkVertexShader = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uTime;
  varying float vAlpha;
  varying float vPhase;
  
  void main() {
    vec3 pos = position;
    float t = uTime * aSpeed + aPhase;
    vPhase = aPhase;
    
    float cycle = mod(t, 4.0);
    float rise = cycle / 4.0;
    
    pos.y += rise * 0.35;
    pos.x += sin(t * 3.0 + aPhase * 5.0) * 0.12 * (1.0 - rise * 0.5);
    pos.z += cos(t * 2.5 + aPhase * 3.0) * 0.12 * (1.0 - rise * 0.5);
    
    float fadeIn = smoothstep(0.0, 0.1, rise);
    float fadeOut = 1.0 - smoothstep(0.6, 1.0, rise);
    float flicker = 0.7 + 0.3 * sin(t * 12.0 + aPhase * 7.0);
    vAlpha = fadeIn * fadeOut * flicker;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float pulse = 0.8 + 0.4 * sin(t * 8.0 + aPhase * 5.0);
    gl_PointSize = aSize * (800.0 / -mvPosition.z) * pulse * 1.5;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const sparkFragmentShader = `
  uniform float uTime;
  varying float vAlpha;
  varying float vPhase;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    float core = 1.0 - smoothstep(0.0, 0.15, dist);
    float innerGlow = 1.0 - smoothstep(0.0, 0.3, dist);
    float outerGlow = 1.0 - smoothstep(0.0, 0.5, dist);
    
    vec3 coreColor = vec3(1.0, 0.9, 0.6);
    vec3 glowColor = vec3(1.0, 0.5, 0.2);
    vec3 outerColor = vec3(0.8, 0.2, 0.1);
    
    vec3 color = coreColor * core + glowColor * innerGlow * 0.6 + outerColor * outerGlow * 0.3;
    float alpha = (core + innerGlow * 0.7 + outerGlow * 0.3) * vAlpha;
    
    gl_FragColor = vec4(color, alpha);
  }
`

const sparkPositions = new Float32Array(SPARK_COUNT * 3)
const sparkSizes = new Float32Array(SPARK_COUNT)
const sparkPhases = new Float32Array(SPARK_COUNT)
const sparkSpeeds = new Float32Array(SPARK_COUNT)

for (let i = 0; i < SPARK_COUNT; i++) {
  const angle = Math.random() * Math.PI * 2
  const radius = Math.random() * 0.55
  sparkPositions[i * 3] = Math.cos(angle) * radius
  sparkPositions[i * 3 + 1] = 1.15
  sparkPositions[i * 3 + 2] = Math.sin(angle) * radius
  sparkSizes[i] = 0.04 + Math.random() * 0.06
  sparkPhases[i] = Math.random() * Math.PI * 2
  sparkSpeeds[i] = 0.25 + Math.random() * 0.35
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
sparkPoints.position.y = -0.02
sparkPoints.renderOrder = 1

function onLoop({ elapsed }: { elapsed: number }) {
  liquidMaterial.uniforms.uTime.value = elapsed
  sparkMaterial.uniforms.uTime.value = reducedMotion.value ? 0 : elapsed
  emberMaterial.uniforms.uTime.value = reducedMotion.value ? 0 : elapsed
}
</script>

<template>
  <ClientOnly>
    <TresCanvas :clear-color="'#0c1414'" @loop="onLoop">
      <TresPerspectiveCamera :position="[0, 3.5, 5]" :look-at="[0, 0.5, 0]" />
      <OrbitControls :enable-damping="true" :enable-zoom="false" :target="[0, 0.5, 0]" />

      <TresAmbientLight :intensity="0.08" />
      <TresPointLight :position="[0, 2.5, 0]" :color="'#ffaa00'" :intensity="1.5" />
      <TresPointLight :position="[0, -0.3, 0]" :color="'#ff1a4d'" :intensity="2" :distance="2" />

      <primitive :object="emberMesh" />
      <primitive :object="cauldronMesh" />
      <primitive :object="liquidMesh" />
      <primitive :object="sparkPoints" />
    </TresCanvas>
  </ClientOnly>
</template>
