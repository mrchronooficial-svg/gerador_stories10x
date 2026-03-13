"use client"

import { useEffect, useRef, useCallback } from "react"
import type { StorySlide } from "@/types/stories"

const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1920
const HIGHLIGHT_COLOR = "#D4A853"
const TEXT_COLOR = "#FFFFFF"
const PADDING_X = 80
const MAX_TEXT_WIDTH = CANVAS_WIDTH - PADDING_X * 2

interface StoryCanvasProps {
  slide: StorySlide
  backgroundImage: string | null
  slideNumber: number
  totalSlides: number
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
  className?: string
}

export function StoryCanvas({
  slide,
  backgroundImage,
  slideNumber,
  totalSlides,
  onCanvasReady,
  className,
}: StoryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const render = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

    // Background
    if (backgroundImage) {
      await drawBackgroundImage(ctx, backgroundImage)
    } else {
      drawGradientBackground(ctx)
    }

    // Dark overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Slide progress dots
    drawProgressDots(ctx, slideNumber, totalSlides)

    // Main text with highlights
    const textBottomY = drawMainText(ctx, slide.text, slide.highlightWords)

    // Interactive elements
    if (slide.pollOptions) {
      drawPoll(ctx, slide.pollOptions, textBottomY + 60)
    } else if (slide.interactionType === "caixinha-perguntas" && slide.questionBoxPlaceholder) {
      drawQuestionBox(ctx, slide.questionBoxPlaceholder, textBottomY + 60)
    } else if (slide.interactionType === "slider-reacao") {
      drawSlider(ctx, textBottomY + 60)
    }

    // CTA text at bottom
    drawCTA(ctx, slide.ctaText, slide.ctaType)

    // Watermark
    ctx.font = "24px Arial, sans-serif"
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
    ctx.textAlign = "center"
    ctx.fillText("@mr.chrono", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40)

    onCanvasReady?.(canvas)
  }, [slide, backgroundImage, slideNumber, totalSlides, onCanvasReady])

  useEffect(() => {
    render()
  }, [render])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "auto", aspectRatio: "9/16" }}
    />
  )
}

async function drawBackgroundImage(ctx: CanvasRenderingContext2D, src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const scale = Math.max(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const x = (CANVAS_WIDTH - w) / 2
      const y = (CANVAS_HEIGHT - h) / 2
      ctx.drawImage(img, x, y, w, h)
      resolve()
    }
    img.onerror = () => {
      drawGradientBackground(ctx)
      resolve()
    }
    img.src = src
  })
}

function drawGradientBackground(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  gradient.addColorStop(0, "#1a1a2e")
  gradient.addColorStop(0.5, "#16213e")
  gradient.addColorStop(1, "#0f0f23")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}

function drawProgressDots(
  ctx: CanvasRenderingContext2D,
  current: number,
  total: number
) {
  const dotSize = 6
  const gap = 4
  const totalWidth = total * dotSize + (total - 1) * gap
  const startX = (CANVAS_WIDTH - totalWidth) / 2
  const y = 50

  for (let i = 0; i < total; i++) {
    const x = startX + i * (dotSize + gap)
    ctx.beginPath()
    ctx.roundRect(x, y, dotSize, dotSize, 3)
    ctx.fillStyle = i + 1 === current ? "#FFFFFF" : "rgba(255,255,255,0.35)"
    ctx.fill()
  }
}

function drawMainText(
  ctx: CanvasRenderingContext2D,
  text: string,
  highlightWords: string[]
): number {
  const fontSize = 56
  const lineHeight = fontSize * 1.4
  ctx.textAlign = "left"
  ctx.textBaseline = "top"

  const normalFont = `bold ${fontSize}px "Arial Black", "Helvetica Neue", Arial, sans-serif`
  const highlightSet = new Set(highlightWords.map((w) => w.toLowerCase()))

  // Word wrap
  ctx.font = normalFont
  const words = text.split(" ")
  const lines: { word: string; isHighlight: boolean }[][] = []
  let currentLine: { word: string; isHighlight: boolean }[] = []
  let currentWidth = 0
  const spaceWidth = ctx.measureText(" ").width

  for (const word of words) {
    const wordWidth = ctx.measureText(word).width
    if (currentWidth + wordWidth > MAX_TEXT_WIDTH && currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = []
      currentWidth = 0
    }
    const cleanWord = word.replace(/[.,!?;:'"()]/g, "").toLowerCase()
    currentLine.push({
      word,
      isHighlight: highlightSet.has(cleanWord),
    })
    currentWidth += wordWidth + spaceWidth
  }
  if (currentLine.length > 0) lines.push(currentLine)

  // Center vertically
  const totalHeight = lines.length * lineHeight
  let startY = (CANVAS_HEIGHT - totalHeight) / 2 - 60

  // Draw each line
  for (const line of lines) {
    let x = PADDING_X

    // Center line
    const lineWidth = line.reduce((w, item) => {
      return w + ctx.measureText(item.word + " ").width
    }, 0)
    x = (CANVAS_WIDTH - lineWidth) / 2

    for (const item of line) {
      ctx.font = normalFont
      ctx.fillStyle = item.isHighlight ? HIGHLIGHT_COLOR : TEXT_COLOR

      // Shadow for readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)"
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      ctx.fillText(item.word, x, startY)
      x += ctx.measureText(item.word + " ").width

      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }
    startY += lineHeight
  }

  return startY
}

function drawPoll(
  ctx: CanvasRenderingContext2D,
  options: [string, string],
  y: number
) {
  const btnWidth = 400
  const btnHeight = 70
  const gap = 24
  const totalWidth = btnWidth * 2 + gap
  const startX = (CANVAS_WIDTH - totalWidth) / 2

  for (let i = 0; i < 2; i++) {
    const x = startX + i * (btnWidth + gap)
    const color = i === 0 ? "rgba(212, 168, 83, 0.3)" : "rgba(255, 255, 255, 0.15)"
    const borderColor = i === 0 ? HIGHLIGHT_COLOR : "rgba(255, 255, 255, 0.4)"

    ctx.beginPath()
    ctx.roundRect(x, y, btnWidth, btnHeight, 35)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.font = "bold 28px Arial, sans-serif"
    ctx.fillStyle = TEXT_COLOR
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(options[i], x + btnWidth / 2, y + btnHeight / 2)
  }
}

function drawQuestionBox(
  ctx: CanvasRenderingContext2D,
  placeholder: string,
  y: number
) {
  const boxWidth = 820
  const boxHeight = 100
  const x = (CANVAS_WIDTH - boxWidth) / 2

  ctx.beginPath()
  ctx.roundRect(x, y, boxWidth, boxHeight, 16)
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)"
  ctx.fill()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.font = "24px Arial, sans-serif"
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(placeholder, CANVAS_WIDTH / 2, y + boxHeight / 2)
}

function drawSlider(ctx: CanvasRenderingContext2D, y: number) {
  const sliderWidth = 700
  const startX = (CANVAS_WIDTH - sliderWidth) / 2

  // Track
  ctx.beginPath()
  ctx.roundRect(startX, y + 20, sliderWidth, 8, 4)
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
  ctx.fill()

  // Filled portion
  ctx.beginPath()
  ctx.roundRect(startX, y + 20, sliderWidth * 0.6, 8, 4)
  const gradient = ctx.createLinearGradient(startX, 0, startX + sliderWidth * 0.6, 0)
  gradient.addColorStop(0, HIGHLIGHT_COLOR)
  gradient.addColorStop(1, "#FF6B35")
  ctx.fillStyle = gradient
  ctx.fill()

  // Emoji
  ctx.font = "48px Arial, sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("🔥", startX + sliderWidth * 0.6, y + 10)
}

function drawCTA(
  ctx: CanvasRenderingContext2D,
  text: string,
  type: "interacao" | "link-externo"
) {
  const y = CANVAS_HEIGHT - 160

  if (type === "link-externo") {
    // Link button style
    const btnWidth = 600
    const btnHeight = 64
    const x = (CANVAS_WIDTH - btnWidth) / 2

    ctx.beginPath()
    ctx.roundRect(x, y, btnWidth, btnHeight, 32)
    ctx.fillStyle = HIGHLIGHT_COLOR
    ctx.fill()

    ctx.font = "bold 28px Arial, sans-serif"
    ctx.fillStyle = "#000000"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, CANVAS_WIDTH / 2, y + btnHeight / 2)
  } else {
    // Interaction CTA
    ctx.font = "bold 30px Arial, sans-serif"
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    ctx.shadowColor = "rgba(0, 0, 0, 0.4)"
    ctx.shadowBlur = 4
    ctx.fillText(text, CANVAS_WIDTH / 2, y + 32)
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
  }
}

// Utility to render a slide to an offscreen canvas (for export)
export async function renderSlideToCanvas(
  slide: StorySlide,
  backgroundImage: string | null,
  slideNumber: number,
  totalSlides: number
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas")
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const ctx = canvas.getContext("2d")!

  if (backgroundImage) {
    await drawBackgroundImage(ctx, backgroundImage)
  } else {
    drawGradientBackground(ctx)
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.65)"
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  drawProgressDots(ctx, slideNumber, totalSlides)
  const textBottomY = drawMainText(ctx, slide.text, slide.highlightWords)

  if (slide.pollOptions) {
    drawPoll(ctx, slide.pollOptions, textBottomY + 60)
  } else if (slide.interactionType === "caixinha-perguntas" && slide.questionBoxPlaceholder) {
    drawQuestionBox(ctx, slide.questionBoxPlaceholder, textBottomY + 60)
  } else if (slide.interactionType === "slider-reacao") {
    drawSlider(ctx, textBottomY + 60)
  }

  drawCTA(ctx, slide.ctaText, slide.ctaType)

  ctx.font = "24px Arial, sans-serif"
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
  ctx.textAlign = "center"
  ctx.fillText("@mr.chrono", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40)

  return canvas
}
