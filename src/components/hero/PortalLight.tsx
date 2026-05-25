'use client'

import { motion } from 'framer-motion'

export function PortalLight() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 320, height: 320 }}>
      {/* Outer rings */}
      {[320, 260, 200, 150].map((size, i) => (
        <motion.div
          key={size}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            border: `1px solid rgba(168,85,247,${0.08 + i * 0.04})`,
          }}
          animate={{
            rotate: i % 2 === 0 ? 360 : -360,
            scale: [1, 1 + i * 0.02, 1],
          }}
          transition={{
            rotate: { duration: 20 + i * 8, repeat: Infinity, ease: 'linear' },
            scale: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      ))}

      {/* Aura glow layers */}
      {[240, 180, 130, 90].map((size, i) => (
        <motion.div
          key={`aura-${size}`}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            background: `radial-gradient(circle, rgba(${i < 2 ? '168,85,247' : '217,70,239'},${0.15 - i * 0.02}) 0%, transparent 70%)`,
            filter: `blur(${6 + i * 4}px)`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3 + i,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Silhouettes are rendered directly in the generated background image */}

      {/* Central divine light */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 60,
          height: 60,
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(216,180,254,0.7) 30%, rgba(168,85,247,0.3) 60%, transparent 100%)',
          filter: 'blur(2px)',
        }}
        animate={{
          scale: [0.9, 1.2, 0.9],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Sparkles around portal */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const r = 130
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: Math.cos(angle) * r - 2,
              marginTop: Math.sin(angle) * r - 2,
              boxShadow: '0 0 6px 2px rgba(255,255,255,0.6)',
            }}
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              delay: i * 0.25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}
