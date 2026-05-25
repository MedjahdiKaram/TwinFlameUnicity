'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  decay: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  type: 'star' | 'circle' | 'spark'
}

export function FairyCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const hasMovedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Palette of magical fairy colors
    const colors = [
      '#ffe17d', // Gold
      '#e879f9', // Fuchsia
      '#a855f7', // Purple
      '#c084fc', // Lavender
      '#67e8f9', // Cyan
      '#ffffff', // Sparkle white
    ]

    // Create a new sparkle particle
    const createParticle = (x: number, y: number) => {
      const typeRand = Math.random()
      let type: 'star' | 'circle' | 'spark' = 'circle'
      if (typeRand < 0.4) {
        type = 'star'
      } else if (typeRand < 0.7) {
        type = 'spark'
      }

      const particle: Particle = {
        x,
        y,
        // Small initial explosion velocity
        vx: (Math.random() - 0.5) * 1.5,
        // Floating slightly upwards (negative vy) or drifting
        vy: (Math.random() - 0.5) * 1.0 - 0.5,
        alpha: 1.0,
        decay: Math.random() * 0.015 + 0.01, // fade speed
        size: Math.random() * 6 + 3, // particle size
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        type,
      }
      particlesRef.current.push(particle)
    }

    // Draw a 4-point star
    const drawStar = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      rotation: number
    ) => {
      c.save()
      c.translate(cx, cy)
      c.rotate(rotation)
      c.beginPath()
      for (let i = 0; i < 4; i++) {
        c.lineTo(0, -size)
        c.lineTo(size * 0.25, -size * 0.25)
        c.rotate(Math.PI / 2)
      }
      c.closePath()
      c.fill()
      c.restore()
    }

    // Draw a 4-point light spark (cross)
    const drawSpark = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      rotation: number
    ) => {
      c.save()
      c.translate(cx, cy)
      c.rotate(rotation)
      c.beginPath()
      c.moveTo(-size, 0)
      c.lineTo(size, 0)
      c.moveTo(0, -size)
      c.lineTo(0, size)
      c.strokeStyle = c.fillStyle // use fillStyle as color
      c.lineWidth = 1.5
      c.stroke()
      c.restore()
    }

    // Animation Loop
    let animationFrameId: number

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        // Update positions
        p.x += p.vx
        p.y += p.vy
        // Add gravity-like float
        p.vy += 0.01 // slowly fall down
        p.alpha -= p.decay
        p.rotation += p.rotationSpeed
        p.size *= 0.98 // slowly shrink

        // Remove dead particles
        if (p.alpha <= 0 || p.size < 0.5) {
          particles.splice(i, 1)
          continue
        }

        // Set drawing properties
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.shadowBlur = p.size * 2
        ctx.shadowColor = p.color

        // Draw particle based on type
        if (p.type === 'star') {
          drawStar(ctx, p.x, p.y, p.size, p.rotation)
        } else if (p.type === 'spark') {
          drawSpark(ctx, p.x, p.y, p.size, p.rotation)
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.shadowBlur = 0 // reset shadow blur
      animationFrameId = requestAnimationFrame(updateAndDraw)
    }

    updateAndDraw()

    // Mouse & Touch event handlers
    const handleMove = (clientX: number, clientY: number) => {
      const lastPos = lastMousePosRef.current

      if (!hasMovedRef.current) {
        lastMousePosRef.current = { x: clientX, y: clientY }
        hasMovedRef.current = true
        return
      }

      const dx = clientX - lastPos.x
      const dy = clientY - lastPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Only spawn particles if moved beyond threshold to prevent overcrowding
      if (distance > 5) {
        // Linear interpolation to fill gaps when moving fast
        const steps = Math.min(Math.floor(distance / 5), 8)
        for (let i = 0; i < steps; i++) {
          const t = i / steps
          const x = lastPos.x + dx * t
          const y = lastPos.y + dy * t
          createParticle(x, y)
        }
        lastMousePosRef.current = { x: clientX, y: clientY }
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
