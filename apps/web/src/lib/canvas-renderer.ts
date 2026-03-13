import type { StorySlide } from '@/types/stories'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1920
const PADDING_X = 80
const CONTENT_WIDTH = CANVAS_WIDTH - PADDING_X * 2

const COLOR_WHITE = '#FFFFFF'
const COLOR_GOLD = '#D4A853'
const COLOR_OVERLAY = 'rgba(0, 0, 0, 0.65)'
const COLOR_DARK_BG_TOP = '#1a1a2e'
const COLOR_DARK_BG_BOTTOM = '#0a0a14'
const COLOR_POLL_BG = 'rgba(255, 255, 255, 0.15)'
const COLOR_POLL_BORDER = 'rgba(255, 255, 255, 0.3)'
const COLOR_QUESTION_BG = 'rgba(255, 255, 255, 0.12)'
const COLOR_SLIDER_TRACK = 'rgba(255, 255, 255, 0.2)'
const COLOR_SLIDER_FILL = COLOR_GOLD

const FONT_FAMILY = '"Arial Black", "Impact", "Helvetica Neue", Arial, sans-serif'
const FONT_MAIN_SIZE = 52
const FONT_CTA_SIZE = 32
const FONT_WATERMARK_SIZE = 24
const FONT_INDICATOR_SIZE = 14
const FONT_POLL_SIZE = 36
const FONT_QUESTION_SIZE = 28

const LINE_HEIGHT_MULTIPLIER = 1.35

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Word-wrap text onto the canvas, switching colour for highlighted words.
 * Returns the Y position after the last line.
 */
function renderWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  highlightWords: string[],
  x: number,
  startY: number,
  maxWidth: number,
  fontSize: number,
  lineHeight: number
): number {
  ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  // Normalise highlight words to lowercase for matching
  const highlightLower = highlightWords.map((w) => w.toLowerCase())

  // Split text into words
  const words = text.split(/\s+/)

  // Build lines with word wrapping
  const lines: { word: string; isHighlight: boolean }[][] = []
  let currentLine: { word: string; isHighlight: boolean }[] = []
  let currentLineWidth = 0

  for (const word of words) {
    const wordWidth = ctx.measureText(word + ' ').width
    if (currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = []
      currentLineWidth = 0
    }

    // Check if this word (or phrase containing it) should be highlighted
    const isHighlight = highlightLower.some((h) => {
      const wordLower = word.toLowerCase().replace(/[.,!?;:]/g, '')
      // Check if the word is part of a highlight phrase
      return h.split(/\s+/).some((hw) => wordLower === hw.toLowerCase().replace(/[.,!?;:]/g, ''))
    })

    currentLine.push({ word, isHighlight })
    currentLineWidth += wordWidth
  }
  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  // Render lines centered
  let y = startY
  for (const line of lines) {
    // Calculate total line width
    const lineText = line.map((w) => w.word).join(' ')
    const totalWidth = ctx.measureText(lineText).width
    let drawX = x - totalWidth / 2

    for (let i = 0; i < line.length; i++) {
      const { word, isHighlight } = line[i]!
      ctx.fillStyle = isHighlight ? COLOR_GOLD : COLOR_WHITE

      // Add text shadow for readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      ctx.fillText(word, drawX, y)
      const wordWidth = ctx.measureText(word + ' ').width
      drawX += wordWidth
    }

    y += lineHeight
  }

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  return y
}

/** Render Instagram-style dots indicator at the top */
function renderSlideIndicator(
  ctx: CanvasRenderingContext2D,
  current: number,
  total: number
): void {
  const dotSize = 6
  const dotGap = 8
  const totalWidth = total * dotSize + (total - 1) * dotGap
  const startX = (CANVAS_WIDTH - totalWidth) / 2
  const y = 60

  for (let i = 0; i < total; i++) {
    const x = startX + i * (dotSize + dotGap)
    ctx.beginPath()
    ctx.arc(x + dotSize / 2, y, dotSize / 2, 0, Math.PI * 2)
    ctx.fillStyle =
      i + 1 === current ? COLOR_WHITE : 'rgba(255, 255, 255, 0.35)'
    ctx.fill()
  }
}

/** Render poll buttons (Instagram-style) */
function renderPollButtons(
  ctx: CanvasRenderingContext2D,
  options: [string, string],
  y: number
): void {
  const buttonWidth = CONTENT_WIDTH / 2 - 15
  const buttonHeight = 72
  const radius = 20
  const leftX = PADDING_X
  const rightX = CANVAS_WIDTH / 2 + 15

  for (let i = 0; i < 2; i++) {
    const bx = i === 0 ? leftX : rightX

    // Rounded rectangle
    ctx.beginPath()
    ctx.roundRect(bx, y, buttonWidth, buttonHeight, radius)
    ctx.fillStyle = COLOR_POLL_BG
    ctx.fill()
    ctx.strokeStyle = COLOR_POLL_BORDER
    ctx.lineWidth = 2
    ctx.stroke()

    // Text
    ctx.font = `bold ${FONT_POLL_SIZE}px ${FONT_FAMILY}`
    ctx.fillStyle = COLOR_WHITE
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      options[i]!,
      bx + buttonWidth / 2,
      y + buttonHeight / 2
    )
  }
}

/** Render a question box visual */
function renderQuestionBox(
  ctx: CanvasRenderingContext2D,
  placeholder: string,
  y: number
): void {
  const boxWidth = CONTENT_WIDTH
  const boxHeight = 80
  const radius = 16
  const bx = PADDING_X

  // Box background
  ctx.beginPath()
  ctx.roundRect(bx, y, boxWidth, boxHeight, radius)
  ctx.fillStyle = COLOR_QUESTION_BG
  ctx.fill()
  ctx.strokeStyle = COLOR_POLL_BORDER
  ctx.lineWidth = 2
  ctx.stroke()

  // Placeholder text
  ctx.font = `${FONT_QUESTION_SIZE}px ${FONT_FAMILY}`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(placeholder, bx + 24, y + boxHeight / 2)

  // Label above
  ctx.font = `bold ${FONT_QUESTION_SIZE}px ${FONT_FAMILY}`
  ctx.fillStyle = COLOR_WHITE
  ctx.textAlign = 'center'
  ctx.fillText('Faça uma pergunta...', CANVAS_WIDTH / 2, y - 30)
}

/** Render an emoji slider visual */
function renderEmojiSlider(
  ctx: CanvasRenderingContext2D,
  y: number
): void {
  const trackWidth = CONTENT_WIDTH
  const trackHeight = 12
  const tx = PADDING_X

  // Track background
  ctx.beginPath()
  ctx.roundRect(tx, y + 20, trackWidth, trackHeight, 6)
  ctx.fillStyle = COLOR_SLIDER_TRACK
  ctx.fill()

  // Filled portion (~60%)
  const fillWidth = trackWidth * 0.6
  ctx.beginPath()
  ctx.roundRect(tx, y + 20, fillWidth, trackHeight, 6)
  ctx.fillStyle = COLOR_SLIDER_FILL
  ctx.fill()

  // Emoji at the fill point
  ctx.font = `48px ${FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.fillText('🔥', tx + fillWidth, y + 2)
}

/** Render CTA text at the bottom */
function renderCTAText(
  ctx: CanvasRenderingContext2D,
  ctaText: string,
  ctaType: 'interacao' | 'link-externo'
): void {
  const y = CANVAS_HEIGHT - 220

  if (ctaType === 'link-externo') {
    // Render a link-style CTA with arrow
    const boxWidth = 400
    const boxHeight = 60
    const bx = (CANVAS_WIDTH - boxWidth) / 2
    const radius = 30

    ctx.beginPath()
    ctx.roundRect(bx, y, boxWidth, boxHeight, radius)
    ctx.fillStyle = COLOR_GOLD
    ctx.fill()

    ctx.font = `bold ${FONT_CTA_SIZE}px ${FONT_FAMILY}`
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ctaText, CANVAS_WIDTH / 2, y + boxHeight / 2)
  } else {
    // Simple text CTA
    ctx.font = `bold ${FONT_CTA_SIZE}px ${FONT_FAMILY}`
    ctx.fillStyle = COLOR_GOLD
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    ctx.fillText(ctaText, CANVAS_WIDTH / 2, y)
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }
}

/** Render watermark at the very bottom */
function renderWatermark(ctx: CanvasRenderingContext2D): void {
  ctx.font = `${FONT_WATERMARK_SIZE}px ${FONT_FAMILY}`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('@mr.chrono', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40)
}

// ---------------------------------------------------------------------------
// Main render function
// ---------------------------------------------------------------------------

export async function renderStoryToCanvas(
  slide: StorySlide,
  backgroundImage: string | null,
  slideNumber: number,
  totalSlides: number
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const ctx = canvas.getContext('2d')!

  // ---- Background ----
  if (backgroundImage) {
    try {
      const img = await loadImage(backgroundImage)
      // Cover the canvas (crop to fill)
      const scale = Math.max(
        CANVAS_WIDTH / img.width,
        CANVAS_HEIGHT / img.height
      )
      const w = img.width * scale
      const h = img.height * scale
      const dx = (CANVAS_WIDTH - w) / 2
      const dy = (CANVAS_HEIGHT - h) / 2
      ctx.drawImage(img, dx, dy, w, h)
    } catch {
      // If image fails, fall through to gradient
      backgroundImage = null
    }
  }

  if (!backgroundImage) {
    // Dark gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    grad.addColorStop(0, COLOR_DARK_BG_TOP)
    grad.addColorStop(1, COLOR_DARK_BG_BOTTOM)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }

  // Dark overlay on top of background image
  if (backgroundImage) {
    ctx.fillStyle = COLOR_OVERLAY
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }

  // ---- Slide indicator dots ----
  renderSlideIndicator(ctx, slideNumber, totalSlides)

  // ---- Main text ----
  // Calculate vertical center in the middle third of canvas
  const textAreaTop = CANVAS_HEIGHT * 0.25
  const textAreaBottom = CANVAS_HEIGHT * 0.65
  const lineHeight = Math.round(FONT_MAIN_SIZE * LINE_HEIGHT_MULTIPLIER)

  // Estimate number of lines to vertically center
  ctx.font = `bold ${FONT_MAIN_SIZE}px ${FONT_FAMILY}`
  const words = slide.text.split(/\s+/)
  let estimatedLines = 1
  let tempWidth = 0
  for (const word of words) {
    const ww = ctx.measureText(word + ' ').width
    if (tempWidth + ww > CONTENT_WIDTH && tempWidth > 0) {
      estimatedLines++
      tempWidth = ww
    } else {
      tempWidth += ww
    }
  }
  const totalTextHeight = estimatedLines * lineHeight
  const startY = Math.max(
    textAreaTop,
    textAreaTop + (textAreaBottom - textAreaTop - totalTextHeight) / 2
  )

  const textEndY = renderWrappedText(
    ctx,
    slide.text,
    slide.highlightWords,
    CANVAS_WIDTH / 2,
    startY,
    CONTENT_WIDTH,
    FONT_MAIN_SIZE,
    lineHeight
  )

  // ---- Interaction visuals ----
  const interactionY = Math.min(textEndY + 60, CANVAS_HEIGHT - 400)

  if (slide.interactionType === 'enquete' && slide.pollOptions) {
    renderPollButtons(ctx, slide.pollOptions, interactionY)
  } else if (
    slide.interactionType === 'caixinha-perguntas' &&
    slide.questionBoxPlaceholder
  ) {
    renderQuestionBox(ctx, slide.questionBoxPlaceholder, interactionY)
  } else if (slide.interactionType === 'slider-reacao') {
    renderEmojiSlider(ctx, interactionY)
  }

  // ---- CTA text ----
  renderCTAText(ctx, slide.ctaText, slide.ctaType)

  // ---- Watermark ----
  renderWatermark(ctx)

  return canvas
}
