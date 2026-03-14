# STORIES_GENERATOR_SPEC.md

> Feature: Gerador de Sequências de Stories 10x para Instagram
> Última atualização: Março 2026
> Rota: `/stories-generator`

---

## 1. VISÃO GERAL

Ferramenta interna para gerar sequências de Instagram Stories baseadas na metodologia Stories 10x. O sistema monta prompts otimizados com toda a metodologia embutida, e depois renderiza as imagens prontas para download (1080x1920) com texto sobre fotos de relógios escurecidas.

**Fluxo do usuário:**
1. Configura tipo de sequência, tema, tamanho e sobe fotos de fundo
2. Sistema gera prompt completo com metodologia Stories 10x
3. Usuário copia prompt → cola no Claude → recebe JSON de volta
4. Usuário cola JSON no sistema → sistema renderiza imagens
5. Usuário baixa imagens prontas e posta no Instagram

**NÃO depende de API externa** — a inteligência vem do prompt que é colado manualmente no Claude. O sistema é um gerador de prompts + renderizador de imagens via Canvas.

---

## 2. PRISMA SCHEMA

```prisma
// Adicionar ao schema.prisma existente

model StorySequence {
  id            String   @id @default(cuid())
  title         String
  type          String   // aquecimento | engajamento | consciencia | caixinha | venda
  theme         String
  size          String   // curta | completa
  extraPrompt   String?  // instruções adicionais do usuário
  storiesJson   Json     // JSON completo da resposta do Claude
  devicesSummary String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
  @@index([createdAt])
}

model StoryBackground {
  id        String   @id @default(cuid())
  filename  String
  url       String   // URL no storage (Supabase Storage ou base64)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@index([userId])
}
```

**Relação com User:** Adicionar ao model User existente:
```prisma
// No model User, adicionar:
storySequences   StorySequence[]
storyBackgrounds StoryBackground[]
```

---

## 3. tRPC ROUTES

### Router: `storiesRouter`

```
src/server/trpc/routers/stories.ts
```

#### Procedures:

**`stories.generatePrompt`** — Mutation
- Input: `{ type: string, theme: string, size: string, extra?: string }`
- Output: `{ prompt: string }`
- Lógica: Chama função `buildPrompt()` no server e retorna o prompt completo
- Auth: obrigatória

**`stories.saveSequence`** — Mutation
- Input: `{ title: string, type: string, theme: string, size: string, extraPrompt?: string, storiesJson: Json, devicesSummary?: string }`
- Output: `{ id: string }`
- Lógica: Salva sequência no banco vinculada ao userId da sessão
- Auth: obrigatória

**`stories.listSequences`** — Query
- Input: `{ type?: string, limit?: number, cursor?: string }`
- Output: `{ sequences: StorySequence[], nextCursor?: string }`
- Lógica: Lista sequências do usuário com paginação cursor-based, ordenada por createdAt desc
- Auth: obrigatória

**`stories.getSequence`** — Query
- Input: `{ id: string }`
- Output: `StorySequence`
- Lógica: Retorna sequência pelo id (validar que pertence ao userId)
- Auth: obrigatória

**`stories.deleteSequence`** — Mutation
- Input: `{ id: string }`
- Output: `{ success: boolean }`
- Auth: obrigatória

**`stories.uploadBackground`** — Mutation
- Input: `{ filename: string, base64: string }`
- Output: `{ id: string, url: string }`
- Lógica: Salva imagem no Supabase Storage bucket "story-backgrounds", grava registro no banco
- Auth: obrigatória

**`stories.listBackgrounds`** — Query
- Input: nenhum
- Output: `StoryBackground[]`
- Lógica: Lista backgrounds do usuário
- Auth: obrigatória

**`stories.deleteBackground`** — Mutation
- Input: `{ id: string }`
- Output: `{ success: boolean }`
- Auth: obrigatória

---

## 4. PROMPT ENGINE (Server-Side)

### Arquivo: `src/lib/stories-prompt-engine.ts`

Este é o coração do sistema. Contém a função `buildPrompt()` que monta o prompt completo com toda a metodologia Stories 10x.

**O prompt gerado deve conter (nesta ordem):**

1. **Briefing** — tipo, tema, tamanho, instruções extras
2. **Contexto Mr. Chrono** — quem é, modelo de negócio, drop diário 19:30, comunidade WhatsApp
3. **Tipo de sequência** — objetivo específico + dispositivos prioritários para aquele tipo
4. **Tom de voz** — regras + 4 exemplos de certo vs errado adaptados à relojoaria
5. **38 dispositivos** — lista completa com nome e lógica de cada um
6. **Estrutura story-por-story** — instrução específica para cada posição (1 a N) com função, tipo de CTA e o que deve acontecer
7. **Regras de CTA** — posições de link externo vs interação
8. **Regras de texto** — max 50 palavras, 3-5 destaques, legibilidade
9. **Regras de qualidade** — fatos específicos, arco narrativo, zero genérico
10. **Formato JSON** — schema exato do JSON esperado com campos obrigatórios

### Tipos de sequência e seus dispositivos prioritários:

```typescript
const SEQUENCE_CONFIGS = {
  aquecimento: {
    label: "Aquecimento Pré-Drop",
    objective: "Criar curiosidade crescente para o drop das 19:30",
    priorityDevices: [35, 10, 14, 9, 38, 24],
    lastStoryRule: "Criar expectativa direta para o drop das 19:30"
  },
  engajamento: {
    label: "Engajamento Puro",
    objective: "Gerar conversa, debate, conexão com a audiência",
    priorityDevices: [6, 33, 19, 35, 5, 23, 37],
    lastStoryRule: "Fechar com reflexão forte ou pedido de compartilhamento"
  },
  consciencia: {
    label: "Geração de Consciência",
    objective: "Posicionar como autoridade em relojoaria vintage",
    priorityDevices: [24, 14, 15, 6, 25],
    lastStoryRule: "Print valioso ou CTA para comunidade"
  },
  caixinha: {
    label: "Caixinha por Tema",
    objective: "Q&A com profundidade sobre tema específico",
    priorityDevices: [14, 35, 15, 3],
    lastStoryRule: "Resumo do que foi respondido + CTA"
  },
  venda: {
    label: "Venda de Produto Físico",
    objective: "Criar desejo sem parecer anúncio",
    priorityDevices: [6, 34, 22, 23, 3, 29],
    lastStoryRule: "Levante a mão ou link para peça"
  }
};
```

### Schema do JSON de resposta esperado do Claude:

```typescript
interface StorySequenceResponse {
  title: string;
  stories: {
    number: number;
    text: string;                    // max ~50 palavras, texto visual do story
    highlighted_words: string[];     // 3-5 palavras para destacar em dourado
    devices_used: number[];          // IDs dos dispositivos usados
    device_names: string[];          // nomes dos dispositivos
    cta_type: "interaction" | "external_link";
    cta_text: string;               // texto do CTA
    has_poll: boolean;
    poll_question: string | null;
    poll_options: string[] | null;   // sempre 2 opções se has_poll=true
  }[];
  devices_summary: string;
}
```

---

## 5. COMPONENTES UI

### Estrutura de arquivos:

```
src/app/(dashboard)/stories-generator/
├── page.tsx                        # Página principal com os 4 steps
├── _components/
│   ├── StepConfig.tsx              # Step 1: Configuração (tipo, tema, tamanho, backgrounds)
│   ├── StepPrompt.tsx              # Step 2: Exibição do prompt + botão copiar
│   ├── StepPaste.tsx               # Step 3: Colar JSON + parse
│   ├── StepPreview.tsx             # Step 4: Preview + download
│   ├── StoryCanvas.tsx             # Renderização Canvas 1080x1920
│   ├── StoryGrid.tsx               # Grid de miniaturas dos stories
│   ├── StoryInfoPanel.tsx          # Painel lateral com detalhes do story selecionado
│   ├── BackgroundUploader.tsx      # Upload de fotos de fundo
│   ├── SequenceHistory.tsx         # Lista de sequências salvas (sidebar ou modal)
│   └── ThemeSuggestions.tsx        # Chips de sugestão de temas
```

### 4 States da Página:

#### State 1 — Configuração (`StepConfig`)
- Upload de fotos de fundo (drag & drop, múltiplas)
- Seletor de tipo de sequência (5 opções, cards clicáveis)
- Toggle de tamanho (Curta ~8 / Completa ~15)
- Input de tema (texto livre + chips de sugestão)
- Textarea de instruções extras (opcional)
- Botão "Gerar Prompt →"
- Sidebar/botão para acessar histórico de sequências salvas

#### State 2 — Prompt Gerado (`StepPrompt`)
- Exibição do prompt em bloco monospace (read-only, scroll)
- Botão "📋 Copiar Prompt" (com feedback visual "✓ Copiado!")
- Botão "Colar Resposta →" (avança para step 3)
- Botão "← Voltar"
- Card de instrução: "1. Copie → 2. Cole no Claude → 3. Copie a resposta → 4. Cole aqui"

#### State 3 — Colar Resposta (`StepPaste`)
- Textarea grande (monospace) para colar JSON
- Tratamento de erro visível (se JSON inválido)
- Auto-limpeza de backticks markdown do JSON
- Botão "Gerar Imagens →"
- Botão "← Voltar ao Prompt"

#### State 4 — Preview & Download (`StepPreview`)
- Header com título da sequência + resumo de dispositivos
- Grid de miniaturas (clicáveis, com borda dourada no selecionado)
- Preview do story selecionado renderizado no Canvas (proporção 9:16)
- Painel lateral com: número, texto, palavras destacadas, dispositivos usados, tipo de CTA, enquete
- Botão "⬇ Baixar Story X" (PNG individual)
- Botão "⬇ Baixar Todos" (downloads sequenciais)
- Botão "💾 Salvar Sequência" (persiste no banco)
- Botão "Nova Sequência" (volta ao step 1)
- Navegação: "← Anterior" / "Próximo →"

---

## 6. CANVAS RENDERER

### Arquivo: `src/lib/story-canvas-renderer.ts`

Renderiza cada story como imagem 1080x1920 usando HTML Canvas API.

### Especificações visuais:

**Canvas:** 1080 x 1920px (formato Instagram Stories 9:16)

**Fundo:**
- Imagem de relógio uploadada pelo usuário
- Cover/fill para preencher todo o canvas (crop central)
- Overlay preto com `rgba(0,0,0,0.67)` por cima

**Tipografia:**
- Font: `Montserrat` (Google Fonts — weights 500, 700, 800, 900)
- Carregar via `@import` ou `<link>` no layout da página
- Texto principal: branco `#FFFFFF`, weight 800
- Palavras destacadas: dourado `#D4A853`, weight 800
- Tamanho adaptativo: 56px (texto curto), 50px (médio), 44px (longo > 150 chars)
- Alinhamento: centralizado horizontalmente, cada linha centralizada individualmente
- Line-height: 1.4x

**Número do story:**
- Canto superior esquerdo (40px, 50px)
- Badge com fundo `rgba(255,255,255,0.08)`, 90x90px, border-radius 20px
- Número em dourado `#D4A853`, font 800 38px

**Enquete (quando has_poll = true):**
- Poll question: branco, 700, 36px, centralizado
- 2 botões lado a lado: 420x72px cada, gap 24px
- Fundo dos botões: `rgba(255,255,255,0.12)`, border `rgba(255,255,255,0.25)`, border-radius 14px
- Texto dos botões: branco, 700, 30px

**CTA:**
- Botão centralizado na parte inferior
- Se `external_link`: fundo dourado `#D4A853`, texto preto `#0A0A0A`
- Se `interaction`: fundo `rgba(255,255,255,0.1)`, texto branco
- Border-radius: 34px, padding horizontal 40px, height 68px

**Tags de dispositivos:**
- Rodapé do story (y = H - 60px)
- `rgba(255,255,255,0.2)`, font 500, 22px, centralizado
- Formato: `#NomeDevice  #NomeDevice`

### Posicionamento do texto:
- Se tem enquete: texto começa em y=350
- Se não tem enquete: texto começa em y=480
- Padding lateral: 80px de cada lado (maxWidth = 920px)

### Função principal:
```typescript
async function renderStory(
  canvas: HTMLCanvasElement,
  story: StoryData,
  backgroundImage: HTMLImageElement | null
): Promise<void>
```

### Função de export:
```typescript
function downloadStoryAsPNG(canvas: HTMLCanvasElement, storyNumber: number): void
// Gera data URL e faz download como story_N.png
```

---

## 7. SUGESTÕES DE TEMAS

### Arquivo: `src/lib/stories-theme-suggestions.ts`

Array de ~12 sugestões que aparecem como chips clicáveis:

```typescript
const THEME_SUGGESTIONS = [
  "História da Omega e a corrida espacial",
  "Como identificar um mostrador original vs restaurado",
  "Por que relógios vintage valorizam mais que carros",
  "Os 5 erros mais comuns ao comprar relógio vintage",
  "Bastidores: o que acontece quando uma peça chega do leilão",
  "Rolex Submarino — o relógio mais icônico já feito",
  "Cartier Tank — o relógio que mudou a relojoaria",
  "Movimento automático vs manual — qual vale mais?",
  "Pátina: como o tempo transforma um relógio em obra de arte",
  "Cristal safira vs acrílico — a verdade que ninguém conta",
  "Relógio como investimento: dados reais de valorização",
  "A história secreta por trás do Rolex Daytona",
];
```

---

## 8. REGRAS DE NEGÓCIO

1. O prompt gerado DEVE conter no mínimo a instrução de usar 5 dispositivos de engenharia social por sequência
2. O dispositivo #16 (Identidade do Comunicador) é SEMPRE ativo — não precisa ser contado
3. CTAs de link externo APENAS nas posições estratégicas: stories 4 e 8 (curta) ou 7 e 15 (completa)
4. O prompt DEVE incluir exemplos concretos de tom certo vs errado adaptados à relojoaria
5. O parser de JSON deve aceitar resposta com ou sem backticks markdown (auto-limpeza)
6. Backgrounds são persistidos por usuário (não precisa subir toda vez)
7. Sequências salvas podem ser re-abertas e re-renderizadas com backgrounds diferentes
8. O texto de cada story não deve ultrapassar ~50 palavras (instrução no prompt)
9. O destino dos CTAs externos é sempre: link da comunidade WhatsApp OU link de peça do catálogo
10. As sequências NÃO são o drop da peça — são conteúdo de engajamento complementar

---

## 9. ⛔ NÃO FAZER

- NÃO usar API do Claude no client-side (o prompt é copiado manualmente)
- NÃO salvar o prompt gerado no banco (é efêmero, gerado on-demand)
- NÃO criar página pública — só acessível com autenticação
- NÃO comprimir as imagens PNG — manter qualidade máxima para Instagram
- NÃO limitar upload de backgrounds (o usuário decide quantas fotos quer)
- NÃO renderizar stories antes do JSON ser colado e parseado com sucesso
- NÃO usar Canvas offscreen em Web Worker (complicação desnecessária — renderizar no main thread)

---

## 10. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1 — Schema e Rotas Base
- [ ] Adicionar models `StorySequence` e `StoryBackground` ao schema.prisma
- [ ] Rodar `npm run db:push`
- [ ] Criar `src/server/trpc/routers/stories.ts` com todas as procedures
- [ ] Registrar router no `appRouter`
- [ ] Testar procedures via Prisma Studio

### Fase 2 — Prompt Engine
- [ ] Criar `src/lib/stories-prompt-engine.ts`
- [ ] Implementar `buildPrompt()` com toda a metodologia (copiar conteúdo do prompt do artifact JSX que já existe)
- [ ] Implementar configs por tipo de sequência (5 tipos)
- [ ] Implementar geração de estrutura story-by-story (curta e completa)
- [ ] Testar: gerar prompt, colar no Claude, verificar se JSON volta correto

### Fase 3 — Canvas Renderer
- [ ] Criar `src/lib/story-canvas-renderer.ts`
- [ ] Importar font Montserrat no layout
- [ ] Implementar `renderStory()` com: background, overlay, texto com highlights, enquete, CTA, badges
- [ ] Implementar `downloadStoryAsPNG()` e `downloadAllStories()`
- [ ] Testar com JSON mockado: verificar qualidade visual em 1080x1920

### Fase 4 — UI Completa
- [ ] Criar rota `/stories-generator` com page.tsx
- [ ] Implementar `StepConfig` (tipo, tema, tamanho, upload de backgrounds)
- [ ] Implementar `StepPrompt` (exibir prompt, botão copiar com clipboard API)
- [ ] Implementar `StepPaste` (textarea + parser JSON com tratamento de erro)
- [ ] Implementar `StepPreview` (grid, canvas preview, painel info, downloads)
- [ ] Implementar `BackgroundUploader` com Supabase Storage
- [ ] Implementar `SequenceHistory` (listar sequências salvas, re-abrir)
- [ ] Adicionar link na sidebar/nav do sistema de gestão

### Fase 5 — Polish e Testes
- [ ] Testar fluxo completo end-to-end: config → prompt → Claude → JSON → imagens → download
- [ ] Testar com diferentes tamanhos de texto (curto, médio, longo)
- [ ] Testar com diferentes quantidades de backgrounds (0, 1, 3, 8)
- [ ] Verificar que imagens baixadas ficam 1080x1920 e legíveis no celular
- [ ] Verificar que enquetes ficam posicionadas corretamente
- [ ] Testar parse de JSON com e sem backticks
- [ ] Testar salvamento e re-abertura de sequência
- [ ] Responsividade da página (funcionar em tela menor, mas prioridade é desktop)

---

## 11. DEPENDÊNCIAS

**Novas dependências necessárias:** Nenhuma. Tudo usa:
- Canvas API (nativo do browser)
- Clipboard API (nativo do browser)
- Supabase Storage (já configurado no projeto)
- Google Fonts — Montserrat (via `<link>` no layout)

**Já existente no projeto:**
- tRPC + Prisma + Better Auth (rotas protegidas)
- Supabase (storage para backgrounds)
- Tailwind CSS (estilização dos componentes)

---

## 12. REFERÊNCIA: CONTEÚDO DO PROMPT ENGINE

O conteúdo completo do prompt que o `buildPrompt()` deve gerar está no arquivo `stories_10x_generator.jsx` (artifact). A função `buildPrompt()` nesse arquivo contém o texto integral com:

- Contexto da Mr. Chrono
- 5 tipos de sequência com dispositivos prioritários
- Tom de voz com 4 exemplos certo vs errado
- Lista dos 38 dispositivos
- Estrutura story-by-story (curta e completa)
- Regras de CTA, texto, qualidade
- Schema JSON de resposta

**Instrução para Claude Code:** Copiar o conteúdo da função `buildPrompt()` do JSX e adaptar para TypeScript, mantendo TODO o texto do prompt idêntico. A qualidade do sistema depende 100% da qualidade desse prompt.
