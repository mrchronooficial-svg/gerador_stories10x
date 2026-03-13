"use client"

import { useRef, useEffect } from "react"
import type { StorySlide } from "@/types/stories"
import { cn } from "@criator_stories/ui/lib/utils"

interface StoryGridProps {
  slides: StorySlide[]
  backgroundImages: string[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export function StoryGrid({
  slides,
  backgroundImages,
  selectedIndex,
  onSelect,
}: StoryGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-8">
      {slides.map((slide, i) => (
        <StoryThumbnail
          key={i}
          slide={slide}
          backgroundImage={backgroundImages[i % backgroundImages.length] || null}
          slideNumber={i + 1}
          isSelected={i === selectedIndex}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  )
}

function renderThumbnail(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  slide: StorySlide,
  slideNumber: number
) {
  // Dark overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)"
  ctx.fillRect(0, 0, w, h)

  // Slide number
  ctx.font = "bold 24px Arial, sans-serif"
  ctx.fillStyle = "#FFFFFF"
  ctx.textAlign = "center"
  ctx.fillText(`${slideNumber}`, w / 2, 36)

  // Abbreviated text
  const text = slide.text.length > 40 ? slide.text.slice(0, 40) + "..." : slide.text
  ctx.font = "bold 16px Arial, sans-serif"
  ctx.fillStyle = "#FFFFFF"
  ctx.textAlign = "center"

  const words = text.split(" ")
  let line = ""
  let y = h / 2 - 40
  for (const word of words) {
    const test = line + word + " "
    if (ctx.measureText(test).width > w - 24) {
      ctx.fillText(line.trim(), w / 2, y)
      line = word + " "
      y += 22
    } else {
      line = test
    }
  }
  ctx.fillText(line.trim(), w / 2, y)

  // CTA type indicator
  ctx.fillStyle = slide.ctaType === "link-externo" ? "#D4A853" : "rgba(255,255,255,0.5)"
  ctx.beginPath()
  ctx.arc(w / 2, h - 30, 6, 0, Math.PI * 2)
  ctx.fill()
}

function drawGradient(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const gradient = ctx.createLinearGradient(0, 0, w, h)
  gradient.addColorStop(0, "#1a1a2e")
  gradient.addColorStop(0.5, "#16213e")
  gradient.addColorStop(1, "#0f0f23")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)
}

function StoryThumbnail({
  slide,
  backgroundImage,
  slideNumber,
  isSelected,
  onClick,
}: {
  slide: StorySlide
  backgroundImage: string | null
  slideNumber: number
  isSelected: boolean
  onClick: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cw = 270
    const ch = 480
    canvas.width = cw
    canvas.height = ch

    if (backgroundImage) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const scale = Math.max(cw / img.width, ch / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
        renderThumbnail(ctx, cw, ch, slide, slideNumber)
      }
      img.onerror = () => {
        drawGradient(ctx, cw, ch)
        renderThumbnail(ctx, cw, ch, slide, slideNumber)
      }
      img.src = backgroundImage
    } else {
      drawGradient(ctx, cw, ch)
      renderThumbnail(ctx, cw, ch, slide, slideNumber)
    }
  }, [slide, backgroundImage, slideNumber])

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-md border-2 transition-all hover:opacity-90",
        isSelected
          ? "border-amber-500 ring-2 ring-amber-500/30"
          : "border-transparent opacity-75 hover:opacity-100"
      )}
    >
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ aspectRatio: "9/16" }}
      />
      <span
        className={cn(
          "absolute top-0.5 left-0.5 rounded-sm px-1 py-0.5 text-[9px] font-bold text-white",
          slide.ctaType === "link-externo" ? "bg-amber-600" : "bg-black/60"
        )}
      >
        {slideNumber}
      </span>
    </button>
  )
}
