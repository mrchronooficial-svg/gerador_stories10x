export interface KBEntry {
  id: string
  title: string
  keywords: string[]
  brands: string[]
  facts: string[]
  snippets: Partial<Record<string, string[]>>
}
