import { useEffect, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'

const CUTE_QUOTES = [
  'Gõ code vui ghê! 💻✨',
  'Bug ở đâu chui ra vậy nè? 🐛🔍',
  'Cà phê vào, Code ra! ☕🚀',
  'Anh Khoa đẹp trai ghê! 😎🔥',
  'Deploy thứ 6 không sợ gì! 🚀✨',
  'Ctrl + Z cứu cả thế giới! 🦸‍♂️',
  'Lại 200 OK rồi, xịn chưa! 🎉',
  'Nhấp vào tớ làm gì đấy? 🙈💕',
  'System All Green nè! 🟢✨',
  '100% Bug-free (chắc vậy)! 😜✌️',
]

export function PageHero({
  eyebrow,
  title,
  description,
  tone = 'primary',
  characterImage = '/images/user_character.svg',
  backdropImage = '/images/projects_3d_cover.png',
}) {
  const stageRef = useRef(null)
  const [transform, setTransform] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [bubbleKey, setBubbleKey] = useState(0)

  // Tự động xoay chuyển câu nói hài hước đáng yêu mỗi 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % CUTE_QUOTES.length)
      setBubbleKey(prev => prev + 1)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  function handleCharacterClick() {
    // Đổi câu thoại đáng yêu lập tức khi người dùng nhấp vào nhân vật
    setQuoteIndex(prev => (prev + 1) % CUTE_QUOTES.length)
    setBubbleKey(prev => prev + 1)
  }

  function handleMouseMove(e) {
    if (!stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    const rotateX = (-y / rect.height) * 22
    const rotateY = (x / rect.width) * 22
    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.06, 1.06, 1.06)`)
  }

  function handleMouseLeave() {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
  }

  return (
    <section 
      className={`page-hero 3d-hero tone-${tone}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Background Overlay & Ambient Glow */}
      <div className="hero-3d-backdrop">
        {backdropImage && <img src={backdropImage} alt="Backdrop" className="hero-3d-bg-img" />}
        <div className="hero-3d-mesh" />
        <div className="hero-3d-glow" />
      </div>

      <div className="content-shell hero-3d-grid">
        <div className="hero-copy reveal">
          <span className="hero-eyebrow">
            <Sparkles className="sparkle-icon" /> {eyebrow}
          </span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        {/* Interactive 3D Character Model Stage */}
        <div className="hero-3d-model-stage reveal" ref={stageRef}>
          {/* Bong bóng lời thoại đáng yêu */}
          <div 
            key={bubbleKey}
            className="cute-speech-bubble"
            onClick={handleCharacterClick}
            title="Click để nghe lời nhắn đáng yêu tiếp theo!"
          >
            <span>{CUTE_QUOTES[quoteIndex]}</span>
            <div className="bubble-tail" />
          </div>

          <div className="model-aura-glow" />
          <div 
            className="model-frame character-clickable"
            onClick={handleCharacterClick}
            style={{ 
              transform: transform || 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)', 
              transition: transform.includes('0deg') ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.1s ease-out' 
            }}
          >
            <img src={characterImage} alt="3D Character Mascot" className="hero-3d-model-img floating-character" />
          </div>
        </div>
      </div>
    </section>
  )
}
