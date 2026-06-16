'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Sparkles } from 'lucide-react'
import { ParticleCanvas } from './ParticleCanvas'
import { PortalLight } from './PortalLight'

// ── Floating star ────────────────────────────────────────────
function FloatingStar({
  x, y, size, delay, duration,
}: {
  x: number; y: number; size: number; delay: number; duration: number
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        boxShadow: `0 0 ${size * 3}px ${size}px rgba(255,255,255,0.3)`,
      }}
      animate={{
        opacity: [0.2, 1, 0.2],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// ── Shimmer ring ─────────────────────────────────────────────
function ShimmerRing({ size, delay }: { size: number; delay: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: size,
        height: size,
        border: '1px solid',
        borderColor: `rgba(168, 85, 247, 0.2)`,
      }}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.15, 0.35, 0.15],
        borderColor: [
          'rgba(168,85,247,0.1)',
          'rgba(168,85,247,0.4)',
          'rgba(168,85,247,0.1)',
        ],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// ── Energy orb ───────────────────────────────────────────────
function EnergyOrb({
  color, x, y, size, delay,
}: {
  color: string; x: number; y: number; size: number; delay: number
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 30, -10, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
        opacity: [0.4, 0.7, 0.4, 0.6, 0.4],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// ── Title word animation ──────────────────────────────────────
function AnimatedTitle({
  line1, line2, highlight,
}: {
  line1: string; line2: string; highlight: string
}) {
  const words1 = line1.split(' ')
  const words2 = line2.split(' ')

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.5 },
    },
  }

  const wordVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -30 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  }

  return (
    <div className="overflow-hidden py-4 -my-4 perspective-1000">
      <motion.h1
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="leading-tight rtl:leading-normal"
      >
        {/* Line 1 */}
        <div className="flex flex-wrap justify-center gap-x-4 mb-1">
          {words1.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className="inline-block text-white font-display font-bold"
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
                WebkitTextStroke: '1px rgba(10, 5, 22, 0.7)',
                textShadow: '0 4px 12px rgba(10, 5, 22, 0.6)',
              }}
            >
              {word}
            </motion.span>
          ))}
        </div>
        {/* Line 2 + highlight */}
        <div className="flex flex-wrap justify-center gap-x-4 mb-1">
          {words2.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className="inline-block text-white font-display font-bold"
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
                WebkitTextStroke: '1px rgba(10, 5, 22, 0.7)',
                textShadow: '0 4px 12px rgba(10, 5, 22, 0.6)',
              }}
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            variants={wordVariants}
            className="inline-block font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffe17d] via-[#f59e0b] to-[#d97706]"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
              filter: 'drop-shadow(0 2px 8px rgba(10, 5, 22, 0.8)) drop-shadow(0 0 20px rgba(245,158,11,0.4))',
            }}
          >
            {highlight}
          </motion.span>
        </div>
      </motion.h1>
    </div>
  )
}

// ── Main HeroSection ─────────────────────────────────────────
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 2,
}))

export function HeroSection() {
  const t = useTranslations('hero')
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })

  // Parallax transforms
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const yTitle = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  // Mouse parallax
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 30, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20 })

  useEffect(() => {
    let rect: DOMRect | null = null

    const handleMouse = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!rect) {
        rect = containerRef.current.getBoundingClientRect()
      }
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      mouseX.set((e.clientX - cx) / rect.width * 30)
      mouseY.set((e.clientY - cy) / rect.height * 20)
    }

    const resetRect = () => {
      rect = null
    }

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('resize', resetRect)
    window.addEventListener('scroll', resetRect, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', resetRect)
      window.removeEventListener('scroll', resetRect)
    }
  }, [mouseX, mouseY])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Deep cosmic background ── */}
      <motion.div
        className="absolute inset-0 select-none pointer-events-none overflow-hidden"
        style={{ scale }}
      >
        <Image
          src="/images/hero-cosmic.jpg"
          alt="Cosmic space portal background"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover opacity-85"
        />
        {/* Ambient overlay to smooth and blend edges */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 35%, transparent 20%, rgba(15, 7, 40, 0.3) 60%, #0f0728 100%)',
          }}
        />
      </motion.div>

      {/* ── Background overlay vignette ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-[#0f0728] pointer-events-none" />

      {/* ── Particle canvas ── */}
      <ParticleCanvas />

      {/* ── Background glow orbs ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ y: yBg }}
      >
        <EnergyOrb color="rgba(147,51,234,0.3)"  x={15} y={20} size={600} delay={0} />
        <EnergyOrb color="rgba(79,70,229,0.2)"   x={75} y={60} size={500} delay={2} />
        <EnergyOrb color="rgba(217,70,239,0.15)"  x={50} y={80} size={400} delay={4} />
        <EnergyOrb color="rgba(236,72,153,0.1)" x={85} y={15} size={350} delay={1} />
        <EnergyOrb color="rgba(139,92,246,0.2)"  x={5}  y={65} size={450} delay={3} />
      </motion.div>

      {/* ── Stars ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {STARS.map((star) => (
          <FloatingStar key={star.id} {...star} />
        ))}
      </div>

      {/* ── Shimmer rings around portal ── */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-full h-full">
          <ShimmerRing size={300} delay={0} />
          <ShimmerRing size={500} delay={1} />
          <ShimmerRing size={700} delay={2} />
          <ShimmerRing size={900} delay={0.5} />
          <ShimmerRing size={1100} delay={1.5} />
        </div>
      </div>

      {/* ── Light mist overlay ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(147,51,234,0.12) 0%, transparent 70%)',
        }}
      />

      {/* ── Divine light beam ── */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        animate={{ opacity: [0.4, 0.7, 0.4], scaleX: [0.8, 1, 0.8] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 3,
          height: '60%',
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(168,85,247,0.5), transparent)',
          filter: 'blur(4px)',
          boxShadow: '0 0 30px 10px rgba(168,85,247,0.4)',
        }}
      />

      {/* ── Portal light ── */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ x: springX, y: springY }}
      >
        <PortalLight />
      </motion.div>

      {/* ── Main content ── */}
      <motion.div
        className="relative z-10 container mx-auto px-4 text-center"
        style={{ y: yTitle, opacity }}
      >
        {/* Title */}
        <AnimatedTitle
          line1={t('title_line1')}
          line2={t('title_line2')}
          highlight={t('title_highlight')}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mt-8 mb-12"
        >
          {t('subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="flex items-center justify-center"
        >
          <Link
            href="/blog"
            className="group relative px-10 py-4 rounded-full font-display font-semibold text-white tracking-widest text-xs transition-all duration-500 hover:-translate-y-1 overflow-hidden"
          >
            {/* Glowing border backdrop */}
            <span className="absolute inset-0 rounded-full border border-purple-500/60 group-hover:border-fuchsia-400 transition-colors duration-500" />
            
            {/* Inner background with glassmorphism */}
            <span className="absolute inset-0 bg-purple-950/40 backdrop-blur-md group-hover:bg-purple-900/60 transition-all duration-500" />
            
            {/* Glow shadow behind button */}
            <div className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]" style={{ zIndex: -1 }} />

            {/* Content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span>{t('cta_primary')}</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" style={{ animationDirection: 'reverse' }} />
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
