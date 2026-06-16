'use client'

import { useEffect, useState } from 'react'

const MESSAGES = [
  'Connecting to the cosmos...',
  'Awakening consciousness...',
  'Aligning energies...',
  'Synchronizing chakras...',
  'Illumination in progress...',
]

export function SpiritLoader() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length)
        setFade(true)
      }, 400)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0f0728]">
      {/* Ambient glow backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-violet-800/20 blur-[80px] animate-pulse-slow2" />
      </div>

      {/* Spirit orb container */}
      <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>

        {/* Outer ring — slow clockwise rotation */}
        <div
          className="absolute rounded-full border border-purple-500/30"
          style={{
            width: 176,
            height: 176,
            animation: 'spirit-rotate 8s linear infinite',
            borderStyle: 'dashed',
          }}
        />

        {/* Outer ring 2 — counter-clockwise */}
        <div
          className="absolute rounded-full border border-violet-400/20"
          style={{
            width: 156,
            height: 156,
            animation: 'spirit-rotate-reverse 6s linear infinite',
          }}
        />

        {/* Middle ring — pulsing + rotating */}
        <div
          className="absolute rounded-full border border-purple-400/50"
          style={{
            width: 130,
            height: 130,
            animation: 'spirit-rotate 4s linear infinite',
            borderTopColor: 'rgba(168, 85, 247, 0.9)',
            borderRightColor: 'rgba(168, 85, 247, 0.4)',
            borderBottomColor: 'rgba(168, 85, 247, 0.1)',
            borderLeftColor: 'rgba(168, 85, 247, 0.4)',
          }}
        />

        {/* Inner ring */}
        <div
          className="absolute rounded-full border border-indigo-400/60"
          style={{
            width: 100,
            height: 100,
            animation: 'spirit-rotate-reverse 3s linear infinite',
            borderTopColor: 'rgba(129, 140, 248, 0.9)',
            borderRightColor: 'rgba(129, 140, 248, 0.2)',
            borderBottomColor: 'rgba(129, 140, 248, 0.6)',
            borderLeftColor: 'rgba(129, 140, 248, 0.2)',
          }}
        />

        {/* Orbiting particles */}
        <div
          className="absolute"
          style={{
            width: 148,
            height: 148,
            animation: 'spirit-rotate 5s linear infinite',
          }}
        >
          <span
            className="absolute w-2 h-2 rounded-full bg-purple-300 shadow-[0_0_8px_rgba(216,180,254,0.9)]"
            style={{ top: -4, left: '50%', transform: 'translateX(-50%)' }}
          />
        </div>
        <div
          className="absolute"
          style={{
            width: 148,
            height: 148,
            animation: 'spirit-rotate-reverse 7s linear infinite',
          }}
        >
          <span
            className="absolute w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_6px_rgba(165,180,252,0.9)]"
            style={{ bottom: -3, left: '50%', transform: 'translateX(-50%)' }}
          />
        </div>
        <div
          className="absolute"
          style={{
            width: 170,
            height: 170,
            animation: 'spirit-rotate 11s linear infinite',
          }}
        >
          <span
            className="absolute w-1 h-1 rounded-full bg-violet-200 shadow-[0_0_5px_rgba(221,214,254,0.9)]"
            style={{ top: -2, right: 20 }}
          />
        </div>

        {/* Central orb */}
        <div
          className="absolute rounded-full"
          style={{
            width: 68,
            height: 68,
            background:
              'radial-gradient(circle at 38% 38%, rgba(255,255,255,0.95) 0%, rgba(216,180,254,0.9) 25%, rgba(147,51,234,0.8) 55%, rgba(109,40,217,0.5) 80%, transparent 100%)',
            boxShadow:
              '0 0 20px rgba(168, 85, 247, 0.8), 0 0 50px rgba(147, 51, 234, 0.5), 0 0 90px rgba(109, 40, 217, 0.3)',
            animation: 'spirit-pulse 2.5s ease-in-out infinite',
          }}
        />

        {/* Inner light spark */}
        <div
          className="absolute rounded-full bg-white"
          style={{
            width: 18,
            height: 18,
            boxShadow: '0 0 12px 4px rgba(255,255,255,0.9), 0 0 24px 8px rgba(216,180,254,0.6)',
            animation: 'spirit-spark 2.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Loading text */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <p
          className="text-sm font-light tracking-[0.25em] text-purple-200/90 uppercase transition-opacity duration-400"
          style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease' }}
        >
          {MESSAGES[msgIndex]}
        </p>

        {/* Dot loader */}
        <div className="flex items-center gap-2 mt-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-purple-400/70"
              style={{ animation: `spirit-dot 1.4s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spirit-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spirit-rotate-reverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes spirit-pulse {
          0%, 100% { transform: scale(1);    opacity: 1; }
          50%       { transform: scale(1.12); opacity: 0.85; }
        }
        @keyframes spirit-spark {
          0%, 100% { transform: scale(1) translate(-1px, -1px); opacity: 0.9; }
          50%       { transform: scale(1.3) translate(-1px, -1px); opacity: 1; }
        }
        @keyframes spirit-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
        .animate-pulse-slow  { animation: spirit-pulse 4s ease-in-out infinite; }
        .animate-pulse-slow2 { animation: spirit-pulse 3s ease-in-out 1s infinite; }
      `}</style>
    </div>
  )
}
