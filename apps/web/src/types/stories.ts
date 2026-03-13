export type SequenceType =
  | "venda-produto"
  | "consciencia"
  | "engajamento"
  | "aquecimento"
  | "caixinha-pergunta"

export type SequenceLength = "curta" | "completa"

export type CTAType = "interacao" | "link-externo"

export type InteractionCTA =
  | "enquete"
  | "caixinha-perguntas"
  | "slider-reacao"
  | "responde-story"
  | "manda-direct"
  | "reage-fogo"

export interface Device {
  id: number
  name: string
  logic: string
  example: string
}

export interface StorySlide {
  number: number
  text: string
  highlightWords: string[]
  ctaType: CTAType
  ctaText: string
  interactionType?: InteractionCTA
  pollOptions?: [string, string]
  questionBoxPlaceholder?: string
  devices: number[]
  function: string
}

export interface StorySequence {
  type: SequenceType
  theme: string
  length: SequenceLength
  slides: StorySlide[]
  devicesUsed: number[]
  totalSlides: number
}

export interface GeneratorConfig {
  sequenceType: SequenceType
  theme: string
  length: SequenceLength
  customPrompt?: string
  backgroundImages: string[]
}

export interface SequenceTypeInfo {
  id: SequenceType
  name: string
  description: string
  cadence: string
  objective: string
  recommendedDevices: number[]
}
