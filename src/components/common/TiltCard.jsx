import { useRef, useState } from 'react'

export function TiltCard({
  children,
  className = '',
  maxTilt = 7,
  glowColor = 'rgba(16, 185, 129, 0.55)',
  secondaryGlow = 'rgba(6, 182, 212, 0.35)',
  as: Component = 'article',
  ...props
}) {
  const cardRef = useRef(null)
  const [transformStyle, setTransformStyle] = useState({})
  const [mousePos, setMousePos] = useState({ x: -500, y: -500, opacity: 0 })

  function handleMouseMove(e) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -maxTilt
    const rotateY = ((x - centerX) / centerX) * maxTilt

    setMousePos({ x, y, opacity: 1 })
    setTransformStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    })
  }

  function handleMouseLeave() {
    setMousePos(prev => ({ ...prev, opacity: 0 }))
    setTransformStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    })
  }

  return (
    <Component
      ref={cardRef}
      className={`tilt-spotlight-card ${className}`}
      style={transformStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Gradient Border Beam that follows mouse */}
      <div
        className="card-spotlight-beam"
        style={{
          opacity: mousePos.opacity,
          background: `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, ${secondaryGlow}, transparent 70%)`,
        }}
      />
      {/* Surface Ambient Glow reflection */}
      <div
        className="card-spotlight-surface"
        style={{
          opacity: mousePos.opacity * 0.1,
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 60%)`,
        }}
      />
      {children}
    </Component>
  )
}
