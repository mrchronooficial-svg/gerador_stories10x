"use client"

import { useState, useCallback } from "react"
import type {
  SequenceType,
  SequenceLength,
  StorySequence,
  GeneratorConfig,
} from "@/types/stories"
import { generateSequence } from "@/lib/stories-engine"
import { downloadAllAsZIP } from "@/lib/export"
import { renderSlideToCanvas } from "./story-canvas"
import { ImageUploader } from "./image-uploader"
import { StoryGrid } from "./story-grid"
import { StoryPreview } from "./story-preview"
import { Button } from "@criator_stories/ui/components/button"
import { Input } from "@criator_stories/ui/components/input"
import { Label } from "@criator_stories/ui/components/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@criator_stories/ui/components/card"
import {
  Sparkles,
  Download,
  RefreshCw,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import devices from "@/data/devices.json"
import sequenceTypesData from "@/data/sequence-types.json"

const sequenceTypes = sequenceTypesData as {
  id: SequenceType
  name: string
  description: string
  cadence: string
  objective: string
  recommendedDevices: number[]
}[]

export function SequenceGenerator() {
  // Config state
  const [sequenceType, setSequenceType] = useState<SequenceType>("aquecimento")
  const [theme, setTheme] = useState("")
  const [length, setLength] = useState<SequenceLength>("curta")
  const [customPrompt, setCustomPrompt] = useState("")
  const [backgroundImages, setBackgroundImages] = useState<string[]>([])

  // Result state
  const [sequence, setSequence] = useState<StorySequence | null>(null)
  const [selectedSlide, setSelectedSlide] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)

  const selectedTypeInfo = sequenceTypes.find((t) => t.id === sequenceType)

  const handleGenerate = useCallback(() => {
    setGenerating(true)

    setTimeout(() => {
      const config: GeneratorConfig = {
        sequenceType,
        theme: theme || customPrompt || "Cultura relojoeira e curiosidades",
        length,
        customPrompt: customPrompt || undefined,
        backgroundImages,
      }
      const result = generateSequence(config)
      setSequence(result)
      setSelectedSlide(0)
      setGenerating(false)
    }, 300)
  }, [sequenceType, theme, length, customPrompt, backgroundImages])

  const handleRegenerate = useCallback(() => {
    handleGenerate()
  }, [handleGenerate])

  const handleDownloadAll = useCallback(async () => {
    if (!sequence) return
    setExporting(true)

    try {
      const canvases: HTMLCanvasElement[] = []
      for (let i = 0; i < sequence.slides.length; i++) {
        const bg = backgroundImages[i % backgroundImages.length] || null
        const canvas = await renderSlideToCanvas(
          sequence.slides[i],
          bg,
          i + 1,
          sequence.totalSlides
        )
        canvases.push(canvas)
      }
      await downloadAllAsZIP(canvases, `mr-chrono-${sequence.type}`)
    } finally {
      setExporting(false)
    }
  }, [sequence, backgroundImages])

  const handleBack = () => {
    setSequence(null)
    setSelectedSlide(0)
  }

  // Result view
  if (sequence) {
    const currentSlide = sequence.slides[selectedSlide]
    const currentBg = backgroundImages[selectedSlide % backgroundImages.length] || null
    const slideDevices = devices as { id: number; name: string; logic: string; example: string }[]

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-1 size-3" />
              Voltar
            </Button>
            <div>
              <h2 className="text-sm font-semibold">
                {selectedTypeInfo?.name} — {sequence.theme}
              </h2>
              <p className="text-[10px] text-muted-foreground">
                {sequence.totalSlides} stories · {sequence.devicesUsed.length} dispositivos
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRegenerate}>
              <RefreshCw className="mr-1 size-3" />
              Regenerar
            </Button>
            <Button size="sm" onClick={handleDownloadAll} disabled={exporting}>
              {exporting ? (
                <Loader2 className="mr-1 size-3 animate-spin" />
              ) : (
                <Download className="mr-1 size-3" />
              )}
              Baixar Todos (ZIP)
            </Button>
          </div>
        </div>

        {/* Grid */}
        <StoryGrid
          slides={sequence.slides}
          backgroundImages={backgroundImages}
          selectedIndex={selectedSlide}
          onSelect={setSelectedSlide}
        />

        {/* Preview */}
        <Card>
          <CardContent className="pt-4">
            <StoryPreview
              slide={currentSlide}
              backgroundImage={currentBg}
              slideNumber={selectedSlide + 1}
              totalSlides={sequence.totalSlides}
              devices={slideDevices}
              onPrev={selectedSlide > 0 ? () => setSelectedSlide((s) => s - 1) : undefined}
              onNext={
                selectedSlide < sequence.totalSlides - 1
                  ? () => setSelectedSlide((s) => s + 1)
                  : undefined
              }
            />
          </CardContent>
        </Card>

        {/* Devices used summary */}
        <Card>
          <CardHeader>
            <CardTitle>Dispositivos utilizados ({sequence.devicesUsed.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {sequence.devicesUsed.map((id) => {
                const device = slideDevices.find((d) => d.id === id)
                if (!device) return null
                return (
                  <div
                    key={id}
                    className="flex items-start gap-2 rounded-md bg-muted/50 p-2"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      {id}
                    </span>
                    <div>
                      <p className="text-xs font-medium">{device.name}</p>
                      <p className="text-[10px] text-muted-foreground">{device.logic}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Generator form
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-bold">Stories 10x Generator</h1>
        <p className="text-xs text-muted-foreground">
          Gere sequências de stories com engenharia social para a Mr. Chrono
        </p>
      </div>

      {/* Sequence type */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de sequência</CardTitle>
          <CardDescription>Escolha o objetivo da sequência</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sequenceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSequenceType(type.id)}
                className={`flex flex-col gap-1 rounded-lg border p-3 text-left transition-all ${
                  sequenceType === type.id
                    ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30"
                    : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{type.name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                      type.cadence === "Alta"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {type.cadence}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {type.description}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
          <CardDescription>Descreva o tema ou use um prompt livre</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="theme">Tema da sequência</Label>
            <Input
              id="theme"
              placeholder="Ex: História da Omega no espaço, Erros ao comprar vintage..."
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="prompt">Prompt livre (opcional)</Label>
            <textarea
              id="prompt"
              placeholder="Ex: Cria uma sequência sobre a história da Omega no espaço, com enquetes e terminando com CTA pra comunidade"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Length */}
      <Card>
        <CardHeader>
          <CardTitle>Tamanho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLength("curta")}
              className={`rounded-lg border p-3 text-left transition-all ${
                length === "curta"
                  ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <p className="text-xs font-semibold">Curta</p>
              <p className="text-[10px] text-muted-foreground">~8 stories</p>
            </button>
            <button
              onClick={() => setLength("completa")}
              className={`rounded-lg border p-3 text-left transition-all ${
                length === "completa"
                  ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <p className="text-xs font-semibold">Completa</p>
              <p className="text-[10px] text-muted-foreground">~15 stories</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Background images */}
      <Card>
        <CardHeader>
          <CardTitle>Fotos de fundo</CardTitle>
          <CardDescription>
            Upload de fotos de relógios (o sistema alterna entre elas)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader
            images={backgroundImages}
            onImagesChange={setBackgroundImages}
          />
        </CardContent>
      </Card>

      {/* Generate button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleGenerate}
        disabled={generating}
      >
        {generating ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 size-4" />
        )}
        {generating ? "Gerando sequência..." : "Gerar Sequência"}
      </Button>
    </div>
  )
}
