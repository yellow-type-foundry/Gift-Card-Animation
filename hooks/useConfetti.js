import { useEffect, useRef } from 'react'

/**
 * Custom hook for confetti animation on canvas
 * @param {boolean} isHovered - Whether the card is hovered
 * @param {boolean} allAccepted - Whether all items are accepted
 * @param {React.RefObject} confettiCanvasRef - Ref to the canvas element
 * @param {React.RefObject} cardRef - Ref to the card element
 */
export default function useConfetti(isHovered, allAccepted, confettiCanvasRef, cardRef) {
  useEffect(() => {
    if (!isHovered || !allAccepted) return
    const canvas = confettiCanvasRef.current
    const headerEl = cardRef.current?.querySelector('[data-name="Header"]')
    if (!canvas || !headerEl) return
    
    const ctx = canvas.getContext('2d')
    let animId
    const dpr = window.devicePixelRatio || 1
    const rect = headerEl.getBoundingClientRect()
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    
    // Colorful confetti palette (multi-hue, soft pastels)
    const colors = ['#7C66FF', '#5AD3FF', '#FF7AD9', '#FFD166', '#8CE99A']
    const maxParticles = 120
    
    const spawnParticle = () => {
      const speed = 2 + Math.random() * 3
      return {
        // Start near bottom with slight horizontal randomness across width
        x: Math.random() * (rect.width * dpr),
        y: (rect.height * dpr) - 2 * dpr,
        // Shoot upwards with slight horizontal drift
        vx: (Math.random() * 2 - 1) * 1.5 * dpr,
        vy: -speed * dpr,
        // Gravity pulls down a bit so confetti slows as it rises
        ay: 0.06 * dpr,
        rot: Math.random() * Math.PI,
        vr: (Math.random() * 0.3 - 0.15),
        size: (4 + Math.random() * 4) * dpr,
        color: colors[(Math.random() * colors.length) | 0],
        shape: Math.random() < 0.5 ? 'rect' : 'tri'
      }
    }
    
    const particles = Array.from({ length: maxParticles }).map(spawnParticle)
    
    const recycleIfOut = (p) => {
      const outOfBounds = p.y < -20 * dpr || p.y > canvas.height + 20 * dpr || p.x < -20 * dpr || p.x > canvas.width + 20 * dpr
      if (outOfBounds) {
        const np = spawnParticle()
        p.x = np.x
        p.y = np.y
        p.vx = np.vx
        p.vy = np.vy
        p.ay = np.ay
        p.rot = np.rot
        p.vr = np.vr
        p.size = np.size
        p.color = np.color
        p.shape = np.shape
      }
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.vy += p.ay
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        recycleIfOut(p)
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        // Draw circle only
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      })
      animId = requestAnimationFrame(draw)
    }
    
    animId = requestAnimationFrame(draw)
    
    return () => {
      if (animId) cancelAnimationFrame(animId)
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [isHovered, allAccepted, confettiCanvasRef, cardRef])
}

