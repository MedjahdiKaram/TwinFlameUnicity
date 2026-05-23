'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: 'star' | 'sparkle' | 'dust'
}

const COLORS = [
  'rgba(168,85,247,',   // purple
  'rgba(139,92,246,',   // violet
  'rgba(99,102,241,',   // indigo
  'rgba(217,70,239,',   // fuchsia
  'rgba(236,72,153,',   // pink
  'rgba(255,255,255,',  // white
  'rgba(251,191,36,',   // gold
]

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particles = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const spawnParticle = (): Particle => {
      const type = Math.random() < 0.6 ? 'dust' : Math.random() < 0.7 ? 'star' : 'sparkle'
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]

      // Spawn from center portal or random
      const fromCenter = Math.random() < 0.4
      const cx = canvas.width / 2
      const cy = canvas.height * 0.35
      const spread = fromCenter ? 80 : canvas.width

      return {
        x: fromCenter ? cx + (Math.random() - 0.5) * spread : Math.random() * canvas.width,
        y: fromCenter ? cy + (Math.random() - 0.5) * spread : Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (fromCenter ? 1.5 : 0.3),
        vy: fromCenter ? (Math.random() - 0.7) * 1.5 : (Math.random() - 0.5) * 0.3,
        life: 0,
        maxLife: Math.random() * 180 + 60,
        size: type === 'star' ? Math.random() * 2 + 0.5 : type === 'sparkle' ? Math.random() * 1.5 + 0.3 : Math.random() * 1 + 0.2,
        color,
        type,
      }
    }

    // Initial particles
    for (let i = 0; i < 120; i++) {
      const p = spawnParticle()
      p.life = Math.random() * p.maxLife
      particles.current.push(p)
    }

    const drawStar = (ctx: CanvasRenderingContext2D, p: Particle, alpha: number) => {
      const { x, y, size, color } = p
      ctx.save()
      ctx.translate(x, y)

      // Glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 6)
      gradient.addColorStop(0, `${color}${alpha})`)
      gradient.addColorStop(1, `${color}0)`)
      ctx.beginPath()
      ctx.arc(0, 0, size * 6, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Core
      ctx.beginPath()
      ctx.arc(0, 0, size, 0, Math.PI * 2)
      ctx.fillStyle = `${color}${alpha})`
      ctx.fill()

      // Cross sparkle
      ctx.strokeStyle = `${color}${alpha * 0.6})`
      ctx.lineWidth = 0.5
      const arm = size * 4
      ctx.beginPath()
      ctx.moveTo(-arm, 0); ctx.lineTo(arm, 0)
      ctx.moveTo(0, -arm); ctx.lineTo(0, arm)
      ctx.stroke()

      ctx.restore()
    }

    const drawDust = (ctx: CanvasRenderingContext2D, p: Particle, alpha: number) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `${p.color}${alpha * 0.6})`
      ctx.fill()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn new
      if (particles.current.length < 150 && Math.random() < 0.4) {
        particles.current.push(spawnParticle())
      }

      // Update & draw
      particles.current = particles.current.filter((p) => {
        p.life++
        if (p.life >= p.maxLife) return false

        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.001 // slight upward drift

        const progress = p.life / p.maxLife
        const alpha = progress < 0.2
          ? progress / 0.2
          : progress > 0.8
          ? (1 - progress) / 0.2
          : 1

        if (p.type === 'star') drawStar(ctx, p, alpha)
        else drawDust(ctx, p, alpha)

        return true
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}
