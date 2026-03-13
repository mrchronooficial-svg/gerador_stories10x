"use client"

import { useRef, useCallback } from "react"
import type { StorySlide } from "@/types/stories"
import { StoryCanvas } from "./story-canvas"
import { DeviceTag } from "./device-tag"
import { Button } from "@criator_stories/ui/components/button"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"
import { downloadStoryAsPNG } from "@/lib/export"

interface StoryPreviewProps {
  slide: StorySlide
  backgroundImage: string | null
  slideNumber: number
  totalSlides: number
  devices: { id: number; name: string }[]
  onPrev?: () => void
  onNext?: () => void
}

export function StoryPreview({
  slide,
  backgroundImage,
  slideNumber,
  totalSlides,
  devices,
  onPrev,
  onNext,
}: StoryPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas
  }, [])

  const handleDownload = async () => {
    if (canvasRef.current) {
      await downloadStoryAsPNG(canvasRef.current, `story-${slideNumber}`)
    }
  }

  const slideDevices = devices.filter((d) => slide.devices.includes(d.id))
  const ctaLabel =
    slide.ctaType === "link-externo"
      ? "CTA Link Externo"
      : slide.interactionType
        ? `CTA: ${slide.interactionType.replace(/-/g, " ")}`
        : "CTA Interação"

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Canvas preview */}
      <div className="relative mx-auto w-full max-w-[320px] flex-shrink-0">
        <StoryCanvas
          slide={slide}
          backgroundImage={backgroundImage}
          slideNumber={slideNumber}
          totalSlides={totalSlides}
          onCanvasReady={handleCanvasReady}
        />

        {/* Navigation arrows */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          {onPrev && (
            <button
              onClick={onPrev}
              className="ml-1 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          {onNext && (
            <button
              onClick={onNext}
              className="mr-1 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
            >
              <ChevronRight className="size-5" />
            </button>
          )}
        </div>
      </div>

      {/* Info panel */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Story {slideNumber}/{totalSlides}
          </h3>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="mr-1 size-3" />
            Baixar PNG
          </Button>
        </div>

        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Função
          </p>
          <p className="text-xs">{slide.function}</p>
        </div>

        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Texto
          </p>
          <p className="text-xs leading-relaxed">{slide.text}</p>
        </div>

        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {ctaLabel}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">{slide.ctaText}</p>
          {slide.pollOptions && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Opções: {slide.pollOptions[0]} / {slide.pollOptions[1]}
            </p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Dispositivos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {slideDevices.map((d) => (
              <DeviceTag key={d.id} id={d.id} name={d.name} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Palavras destacadas
          </p>
          <div className="flex flex-wrap gap-1">
            {slide.highlightWords.map((w, i) => (
              <span
                key={i}
                className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
