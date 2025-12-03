<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { LatheGeometry, ShaderMaterial, Vector2, Mesh, DoubleSide } from 'three'

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

const cauldronGeometry = new LatheGeometry(cauldronProfile, 32)
const cauldronMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: DoubleSide,
})
const cauldronMesh = new Mesh(cauldronGeometry, cauldronMaterial)
</script>

<template>
  <ClientOnly>
    <TresCanvas :clear-color="'#0a0f0f'">
      <TresPerspectiveCamera :position="[0, 2, 5]" :look-at="[0, 0, 0]" />
      <OrbitControls :enable-damping="true" />

      <TresAmbientLight :intensity="0.1" />
      <TresPointLight :position="[0, 2, 0]" :color="'#00ffcc'" :intensity="2" />

      <primitive :object="cauldronMesh" />
    </TresCanvas>
  </ClientOnly>
</template>
