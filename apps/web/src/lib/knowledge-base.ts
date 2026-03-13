import { knowledgeBase } from "@/data/knowledge"
import type { KBEntry } from "@/types/knowledge"

export type { KBEntry }

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

/** Remove accents and lowercase */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

/** Tokenize input into words */
function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[\s,;.!?]+/)
    .filter((t) => t.length > 1)
}

/**
 * Match user input against the knowledge base.
 * Returns the best matching KBEntry, or the "generico" fallback.
 */
export function matchKB(theme: string, customPrompt?: string): KBEntry {
  const input = normalize(`${theme} ${customPrompt || ""}`)
  const tokens = tokenize(`${theme} ${customPrompt || ""}`)

  let bestScore = 0
  let bestEntry: KBEntry | null = null
  let fallback: KBEntry | null = null

  for (const entry of knowledgeBase) {
    // The generic entry is the fallback
    if (entry.id === "generico") {
      fallback = entry
      continue
    }

    let score = 0

    // Keyword matching
    for (const kw of entry.keywords) {
      const kwNorm = normalize(kw)
      // Exact keyword in input
      if (input.includes(kwNorm)) {
        score += 10
      } else {
        // Partial: any token starts with keyword or vice-versa
        for (const token of tokens) {
          if (token.startsWith(kwNorm) || kwNorm.startsWith(token)) {
            score += 3
            break
          }
        }
      }
    }

    // Brand matching
    for (const brand of entry.brands) {
      if (input.includes(normalize(brand))) {
        score += 8
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestEntry = entry
    }
  }

  return bestEntry && bestScore >= 3 ? bestEntry : fallback!
}
