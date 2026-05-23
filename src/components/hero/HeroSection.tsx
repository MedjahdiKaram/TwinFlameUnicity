'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ArrowDown, Sparkles } from 'lucide-react'
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
    <div className="overflow-hidden perspective-1000">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="leading-tight"
      >
        {/* Line 1 */}
        <div className="flex flex-wrap justify-center gap-x-4 mb-1">
          {words1.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className="inline-block text-white font-display font-black"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
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
              className="inline-block text-white font-display font-black"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            variants={wordVariants}
            className="inline-block text-shimmer font-display font-black"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          >
            {highlight}
          </motion.span>
        </div>
      </motion.div>
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
    const handleMouse = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      mouseX.set((e.clientX - cx) / rect.width * 30)
      mouseY.set((e.clientY - cy) / rect.height * 20)
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [mouseX, mouseY])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Deep cosmic background ── */}
      <motion.div
        className="absolute inset-0 bg-cosmic-gradient"
        style={{ scale }}
      />

      {/* ── Particle canvas ── */}
      <ParticleCanvas />

      {/* ── Background glow orbs ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: yBg }}
      >
        <EnergyOrb color="rgba(147,51,234,0.6)"  x={15} y={20} size={600} delay={0} />
        <EnergyOrb color="rgba(79,70,229,0.4)"   x={75} y={60} size={500} delay={2} />
        <EnergyOrb color="rgba(217,70,239,0.3)"  x={50} y={80} size={400} delay={4} />
        <EnergyOrb color="rgba(236,72,153,0.25)" x={85} y={15} size={350} delay={1} />
        <EnergyOrb color="rgba(139,92,246,0.4)"  x={5}  y={65} size={450} delay={3} />
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

      {/* ── Cosmic mountains silhouette ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          className="w-full h-32 sm:h-48"
          fill="none"
        >
          <path
            d="M0 200 L0 120 L80 60 L180 140 L280 40 L380 100 L480 20 L580 90 L680 30 L780 110 L880 50 L980 130 L1080 35 L1180 95 L1280 55 L1380 115 L1440 70 L1440 200 Z"
            fill="url(#mountain-gradient)"
            opacity="0.6"
          />
          <path
            d="M0 200 L0 150 L120 100 L240 160 L360 80 L480 130 L600 70 L720 140 L840 90 L960 150 L1080 85 L1200 145 L1320 100 L1440 130 L1440 200 Z"
            fill="url(#mountain-gradient-2)"
            opacity="0.8"
          />
          <defs>
            <linearGradient id="mountain-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(88,28,135,0.5)" />
              <stop offset="100%" stopColor="rgba(15,7,40,0.9)" />
            </linearGradient>
            <linearGradient id="mountain-gradient-2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(49,10,81,0.7)" />
              <stop offset="100%" stopColor="rgba(15,7,40,1)" />
            </linearGradient>
          </defs>
        </svg>
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
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-purple-500/30 text-purple-300 text-xs font-medium tracking-widest uppercase mb-8"
        >
          <Sparkles className="w-3 h-3 animate-spin-slow" />
          <span>Flammes Jumelles · Éveil · Unité</span>
          <Sparkles className="w-3 h-3 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        </motion.div>

        {/* Title */}
        <AnimatedTitle
          line1={t('title_line1')}
          line2={t('title_line2')}
          highlight={t('title_highlight')}
        />

        {/* Divider shimmer */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="w-48 h-px mx-auto my-6 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-12"
        >
          {t('subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/blog"
            className="group relative px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden transition-all duration-300 hover:-translate-y-1"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 group-hover:from-purple-500 group-hover:to-indigo-500" />
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1)' }} />
            <span className="relative flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t('cta_primary')}
            </span>
            <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(99,102,241,0.2))', filter: 'blur(8px)', zIndex: -1 }} />
          </Link>

          <Link
            href="/about"
            className="group px-8 py-4 rounded-2xl font-semibold text-white/80 hover:text-white glass-card border border-white/15 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-sm"
          >
            {t('cta_secondary')}
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs"
        >
          <span className="tracking-widest uppercase text-[10px]">{t('scroll_hint')}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
