export interface Particle {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  size: number
  opacity: number
  color: string
  velocity: { x: number; y: number }
}

export interface UseParticlesReturn {
  particles: Ref<Particle[]>
  spawnDissolutionParticles: (
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    count?: number
  ) => void
  updateParticles: () => void
  clearParticles: () => void
}

const MAX_PARTICLES = 50
const PARTICLE_COLORS = ['#9575cd', '#b39ddb', '#7e57c2', '#d1c4e9', '#ede7f6']

let particleIdCounter = 0

export function useParticles(): UseParticlesReturn {
  const particles = ref<Particle[]>([])
  let animationFrameId: number | null = null

  function spawnDissolutionParticles(
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    count: number = 20
  ): void {
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const spread = Math.random() * 30

      newParticles.push({
        id: particleIdCounter++,
        x: sourceX + Math.cos(angle) * spread,
        y: sourceY + Math.sin(angle) * spread,
        targetX,
        targetY,
        size: 3 + Math.random() * 5,
        opacity: 0.8 + Math.random() * 0.2,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        }
      })
    }

    const combined = [...particles.value, ...newParticles]
    if (combined.length > MAX_PARTICLES) {
      particles.value = combined.slice(-MAX_PARTICLES)
    } else {
      particles.value = combined
    }

    if (!animationFrameId) {
      startAnimationLoop()
    }
  }

  function updateParticles(): void {
    const driftSpeed = 0.03
    const fadeSpeed = 0.015

    particles.value = particles.value
      .map((particle) => {
        const dx = particle.targetX - particle.x
        const dy = particle.targetY - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 5) {
          return { ...particle, opacity: particle.opacity - fadeSpeed * 3 }
        }

        const dirX = dx / distance
        const dirY = dy / distance

        return {
          ...particle,
          x: particle.x + dirX * distance * driftSpeed + particle.velocity.x,
          y: particle.y + dirY * distance * driftSpeed + particle.velocity.y,
          opacity: particle.opacity - fadeSpeed,
          size: particle.size * 0.995,
          velocity: {
            x: particle.velocity.x * 0.98,
            y: particle.velocity.y * 0.98
          }
        }
      })
      .filter((particle) => particle.opacity > 0 && particle.size > 0.5)
  }

  function startAnimationLoop(): void {
    const loop = () => {
      updateParticles()

      if (particles.value.length > 0) {
        animationFrameId = requestAnimationFrame(loop)
      } else {
        animationFrameId = null
      }
    }

    animationFrameId = requestAnimationFrame(loop)
  }

  function clearParticles(): void {
    particles.value = []
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  onUnmounted(() => {
    clearParticles()
  })

  return {
    particles,
    spawnDissolutionParticles,
    updateParticles,
    clearParticles
  }
}
