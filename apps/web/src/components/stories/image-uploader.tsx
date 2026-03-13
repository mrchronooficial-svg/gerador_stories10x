"use client"

import { Button } from "@criator_stories/ui/components/button"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { useCallback, useRef } from "react"

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUploader({ images, onImagesChange, maxImages = 10 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const remaining = maxImages - images.length
      const filesToProcess = Array.from(files).slice(0, remaining)

      filesToProcess.forEach((file) => {
        if (!file.type.startsWith("image/")) return
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (result) {
            onImagesChange([...images, result])
          }
        }
        reader.readAsDataURL(file)
      })
    },
    [images, onImagesChange, maxImages]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium">Fotos de fundo (relógios)</label>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
      >
        <Upload className="size-8 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Arraste fotos de relógios ou clique para selecionar
        </p>
        <p className="text-[10px] text-muted-foreground/70">
          {images.length}/{maxImages} imagens
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="group relative aspect-[9/16] overflow-hidden rounded-md">
              <img src={img} alt={`Fundo ${i + 1}`} className="size-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(i)
                }}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3 text-white" />
              </button>
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
          <ImageIcon className="size-4 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground">
            Sem imagens? Um fundo escuro gradiente será usado automaticamente.
          </p>
        </div>
      )}
    </div>
  )
}
