import { useState, useEffect, useRef } from 'react'
import { RotateCcw, Sparkles, Wrench, CheckCircle2 } from 'lucide-react'

export function NotFound3DScene() {
  const [step, setStep] = useState(0) // 0: Start, 1: Place left 4, 2: Lift center 0, 3: Place right 4, 4: Complete lock
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Sequential 3D Assembly loop
  useEffect(() => {
    let timer
    if (step === 0) {
      timer = setTimeout(() => setStep(1), 600)
    } else if (step === 1) {
      timer = setTimeout(() => setStep(2), 1200)
    } else if (step === 2) {
      timer = setTimeout(() => setStep(3), 1600)
    } else if (step === 3) {
      timer = setTimeout(() => setStep(4), 1000)
    } else if (step === 4 && isAutoPlay) {
      // Hold complete state for 4.5s then smoothly restart
      timer = setTimeout(() => {
        setStep(0)
      }, 4500)
    }
    return () => clearTimeout(timer)
  }, [step, isAutoPlay])

  function restartAssembly() {
    setStep(0)
  }

  return (
    <div className="not-found-3d-stage-wrapper">
      {/* 3D Dynamic Stage Box (Stable, no tilt on mouse move) */}
      <div className="not-found-3d-canvas">
        {/* Background Grid Mesh */}
        <div className="canvas-grid-mesh" />
        <div className="canvas-glow-spot" />

        {/* Status Chip */}
        <div className="assembly-status-badge">
          {step === 4 ? (
            <span className="badge-complete">
              <CheckCircle2 size={13} /> Lắp ráp thành công, oh yeah!
            </span>
          ) : (
            <span className="badge-building">
              <Wrench size={13} className="spin-icon" />
              {step === 0 && 'Chuẩn bị lắp ráp...'}
              {step === 1 && 'Tôi gắn số 4 bên trái...'}
              {step === 2 && 'Tôi đẩy số 0 vào giữa...'}
              {step === 3 && 'Tôi gắn số 4 bên phải...'}
            </span>
          )}
        </div>

        {/* 3D Number Assembly Arena */}
        <div className="assembly-arena">
          {/* Floor Shadow Plane */}
          <div className="arena-floor-shadow" />

          {/* NUMBER 4 (LEFT) */}
          <div className={`num-3d-block num-left ${step >= 1 ? 'placed' : 'holding-in-air'}`}>
            <div className="num-front">4</div>
            <div className="num-shadow" />
            {step === 1 && <span className="snap-spark spark-1" />}
          </div>

          {/* NUMBER 0 (CENTER - LIFTED BY CHARACTER) */}
          <div
            className={`num-3d-block num-center ${
              step >= 3 ? 'locked' : step === 2 ? 'lifting' : 'floating'
            }`}
          >
            <div className="num-front">0</div>
            <div className="num-glow-pulse" />
            <div className="num-shadow" />
            {step === 2 && <span className="lift-guide-lines" />}
            {step >= 3 && <span className="snap-spark spark-2" />}
          </div>

          {/* NUMBER 4 (RIGHT) */}
          <div className={`num-3d-block num-right ${step >= 3 ? 'placed' : 'holding-in-air'}`}>
            <div className="num-front">4</div>
            <div className="num-shadow" />
            {step === 3 && <span className="snap-spark spark-3" />}
          </div>

          {/* THE DEVELOPER CHARACTER (ANIMATED) */}
          <div className={`character-engineer ${step === 2 ? 'pushing-up' : step >= 3 ? 'celebrating' : 'walking-in'}`}>
            {/* Developer SVG Silhouette / Detailed Art */}
            <svg
              viewBox="0 0 200 240"
              className="engineer-svg"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Drop shadow on ground */}
              <ellipse cx="100" cy="230" rx="35" ry="8" fill="rgba(0,0,0,0.3)" />

              {/* Legs */}
              <path
                d="M85 140 L80 215 L70 220"
                stroke="#1e293b"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M115 140 L120 215 L130 220"
                stroke="#1e293b"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Shoes */}
              <rect x="62" y="215" width="22" height="10" rx="5" fill="#ffffff" stroke="#059669" strokeWidth="2" />
              <rect x="116" y="215" width="22" height="10" rx="5" fill="#ffffff" stroke="#059669" strokeWidth="2" />

              {/* Body (T-shirt with Cyber Stripe) */}
              <path
                d="M75 90 C75 80 125 80 125 90 L120 145 C120 148 80 148 80 145 Z"
                fill="#1e3a8a"
              />
              {/* Cyber Cyan Accent on back of shirt */}
              <path d="M98 95 L98 135" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" />
              <circle cx="98" cy="115" r="4" fill="#10b981" />

              {/* Head & Hair (Back View) */}
              <circle cx="100" cy="65" r="16" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
              {/* Hair */}
              <path
                d="M85 64 C85 46 115 46 115 64 C115 68 85 68 85 64 Z"
                fill="#0f172a"
              />
              <path
                d="M86 64 C86 52 98 48 108 52"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Arms - Dynamically Lifting Number 0 */}
              {step === 2 ? (
                // Pushing up with both hands
                <g className="arms-pushing">
                  <path
                    d="M78 92 L62 55 L78 35"
                    stroke="#1e3a8a"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M122 92 L138 55 L122 35"
                    stroke="#1e3a8a"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Hands */}
                  <circle cx="78" cy="35" r="6" fill="#f8fafc" stroke="#10b981" strokeWidth="2" />
                  <circle cx="122" cy="35" r="6" fill="#f8fafc" stroke="#10b981" strokeWidth="2" />
                </g>
              ) : step >= 3 ? (
                // Celebrating hands up or on waist
                <g className="arms-celebrating">
                  <path
                    d="M78 92 L55 75 L52 50"
                    stroke="#1e3a8a"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M122 92 L145 75 L148 50"
                    stroke="#1e3a8a"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="52" cy="50" r="6" fill="#f8fafc" stroke="#10b981" strokeWidth="2" />
                  <circle cx="148" cy="50" r="6" fill="#f8fafc" stroke="#10b981" strokeWidth="2" />
                </g>
              ) : (
                // Holding positions
                <g className="arms-holding">
                  <path
                    d="M78 92 L68 115 L78 125"
                    stroke="#1e3a8a"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M122 92 L132 115 L122 125"
                    stroke="#1e3a8a"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="78" cy="125" r="6" fill="#f8fafc" />
                  <circle cx="122" cy="125" r="6" fill="#f8fafc" />
                </g>
              )}
            </svg>
          </div>

          {/* Laser Align Guiding Beam */}
          {step < 4 && <div className="laser-align-beam" />}
        </div>

        {/* Bottom Replay Action Bar */}
        <div className="stage-action-bar">
          <button
            className="replay-assembly-btn"
            onClick={restartAssembly}
            title="Lắp ráp lại từ đầu"
          >
            <RotateCcw size={14} className={step === 0 ? 'spin-fast' : ''} />
            <span>Ráp lại</span>
          </button>
        </div>
      </div>
    </div>
  )
}
