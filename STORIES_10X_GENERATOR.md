# Stories 10x Generator — Mr. Chrono

Aplicativo gerador de sequências de Instagram Stories para a Mr. Chrono (relojoaria vintage), baseado na metodologia Stories 10x. Gera imagens prontas para download (1080x1920) com texto sobre fotos de relógios escurecidas, seguindo estruturas de engenharia social comprovadas para maximizar engajamento.

---

## Sobre a Empresa

- **Mr. Chrono** — maior página de relojoaria vintage no Instagram do Brasil
- Modelo de negócio: compra e venda de relógios vintage/segunda mão com curadoria
- Sede: Rio de Janeiro, RJ
- Sócios: Rafael (conteúdo, estratégia, filmagens) e João (atendimento, sourcing)
- Comunidade WhatsApp: ~8.000–9.000 membros em ~9 grupos
- Instagram: ~4.000 visualizações por story
- Drop diário: 1 peça por dia, sempre às 19:30, primeiro no WhatsApp, depois Instagram
- Marcas principais: Cartier, Omega, Rolex (só suíças)
- Objetivo: escalar de ~25-30 para 50-60 peças/mês antes de vender a empresa em 2-3 anos

---

## Objetivo do Sistema

Gerar sequências completas de stories (8-20 stories) com **imagens prontas para download** no formato 1080x1920. O usuário seleciona o tipo de sequência + tema (ou escreve um prompt livre) e recebe os stories prontos com:
- Foto de fundo de relógio escurecida
- Texto branco bold sobreposto
- Palavras-chave destacadas em cor de destaque
- Enquetes estilizadas (para o usuário recriar por cima com o botão real do Instagram)
- CTAs estrategicamente posicionados

**IMPORTANTE:** As sequências NÃO são o drop da peça do dia. São conteúdo de engajamento publicado durante o dia para aquecer a audiência ANTES do drop das 19:30.

---

## Stack Técnica

- **Framework:** React (JSX artifact no Claude.ai)
- **Geração de imagens:** HTML Canvas API (1080x1920px)
- **Fontes:** Bold sans-serif (similar às referências — texto grande, impactante)
- **Storage:** Fotos de fundo em base64 (upload pelo usuário)
- **Export:** Download de imagens PNG individuais ou pacote ZIP

---

## Especificações Visuais

### Dimensões
- **Canvas:** 1080 x 1920 pixels (formato Stories Instagram 9:16)

### Fundo
- Foto de relógio vintage (uploadada pelo usuário)
- Filtro escuro aplicado por cima (overlay preto ~60-70% opacidade)
- Objetivo: texto branco se destacar sobre fundo escuro

### Tipografia
- **Cor principal do texto:** Branco (#FFFFFF)
- **Palavras-chave destacadas:** Cor de destaque (sugestão: dourado/âmbar #D4A853 ou laranja #FF6B35 — testar)
- **Tamanho:** Grande e bold (legível em tela de celular)
- **Estilo:** Sem serifa, impactante, similar ao padrão dos stories de referência
- **Posicionamento:** Varia conforme tipo de story (centralizado para perguntas/enquetes, terço inferior para narrativas)

### Elementos Interativos (representação visual)
- **Enquetes:** Botões estilo Instagram (o usuário vai recriar por cima com botão real)
- **Caixinha de perguntas:** Visual de caixinha do Instagram
- **Reações/emojis:** Slider de reação quando aplicável
- **CTAs:** Texto com seta ou indicação visual (ex: "↓ Responde aqui", "→ Link na bio")

### Referência Visual (padrão dos exemplos analisados)
- Fundo escuro com imagem por trás
- Texto bold branco dominante
- Palavras-chave em cor de destaque (laranja, vermelho ou dourado)
- Layout limpo, poucos elementos por story
- Enquetes com 2 opções (Sim/Não, Opção A/Opção B) em botões arredondados

---

## Tom de Voz — Identidade do Comunicador (#16)

### Estilo Mr. Chrono nos Stories
- **Tom:** Descontraído e acessível, para o público se identificar
- **Formalidade:** Informal, mas sem gírias agressivas
- **Emojis:** Uso moderado e estratégico (não exagerar)
- **Pessoa:** Primeira pessoa do plural ("a gente", "nós") ou direta com o seguidor ("você")
- **Abordagem:** Como se estivesse conversando com um amigo que curte relógios
- **Evitar:** Linguagem excessivamente técnica, tom de vendedor, formalidade corporativa

### Exemplos de tom adequado
- ✅ "Você sabia que esse movimento foi usado em missões espaciais da NASA?"
- ✅ "A gente recebe muita pergunta sobre isso... e a resposta vai te surpreender"
- ✅ "Confessa: você já ficou olhando um relógio numa vitrine por mais de 5 minutos? 😅"
- ❌ "Prezado seguidor, informamos que o calibre em questão possui..."
- ❌ "COMPRE AGORA!!! ÚLTIMA UNIDADE!!!"

---

## Metodologia Stories 10x — Resumo Completo

### Tripé Fundamental
Toda sequência considera:
1. **Contexto** — cenário e situação da audiência
2. **Intenção** — objetivo de cada story e da sequência
3. **Interesse** — o que prende atenção e faz querer continuar

### Regra de Ouro
- Mínimo **5 dispositivos de engenharia social** por sequência
- **Frequência baixa** (poucos dias/semana) + **Cadência alta** (muitos stories/dia) para sequências fechadas
- Stories soltos sem narrativa = PROIBIDO

---

## Os 12 Tipos de Sequência

### Tipos Prioritários para Mr. Chrono

#### 1. Venda de Produto Físico
- **Cadência:** Baixa
- **Objetivo:** Vender relógios específicos
- **Dispositivos recomendados:** (22) Nome esquisito, (34) Demonstração curta, (06) História com gancho, (03) Conversa sem privacidade
- **Uso Mr. Chrono:** Para peças premium ou drops especiais

#### 2. Geração de Consciência
- **Cadência:** Baixa
- **Objetivo:** Educar sobre cultura relojoeira sem vender diretamente
- **Dispositivos recomendados:** (14) B.I apurado, (35) Enquete com curiosidade real, (06) História com gancho, (03) Conversa sem privacidade
- **Uso Mr. Chrono:** Conteúdo sobre história de marcas, movimentos, cuidados com relógio

#### 3. Engajamento Puro
- **Cadência:** Alta
- **Objetivo:** Conectar com audiência, gerar conversa, viciar nos stories
- **Dispositivos recomendados:** (06) História com gancho, (25) Micro influência, (31) Os 7 erros, (23) Espetacularização, (32) Diário, (05) Meta coletiva
- **Uso Mr. Chrono:** Temas sobre estilo, investimento, curiosidades do mundo vintage

#### 4. Aquecimento / Pré-abertura (Drop Diário)
- **Cadência:** Alta
- **Objetivo:** Gerar antecipação para o drop das 19:30
- **Dispositivos recomendados:** (35) Enquete com curiosidade real, (03) Conversa sem privacidade, (09) Pânico pelo conteúdo, (01) Combustível extra, (14) B.I apurado, (38) Levante a mão
- **Uso Mr. Chrono:** Sequências durante o dia para aquecer antes do drop noturno — TIPO MAIS FREQUENTE

#### 5. Caixinha de Pergunta por Tema
- **Cadência:** Alta
- **Objetivo:** Gerar valor respondendo dúvidas sobre tema específico de relojoaria
- **Dispositivos recomendados:** (35) Enquete com curiosidade real, (14) B.I apurado, (15) Print valioso
- **Uso Mr. Chrono:** "Pergunte sobre Omega", "Dúvidas sobre relógios automáticos", etc.

### Tipos Secundários (usar ocasionalmente)
- **Divulgação de conteúdo** — Para divulgar reels ou vídeos novos
- **Evento** — Para coberturas de feiras de relógio, visitas a relojoeiros
- **Caixinha geral** — Tema livre, qualquer pergunta

---

## Os 38 Dispositivos de Engenharia Social

### Referência Completa

| # | Dispositivo | Lógica | Exemplo Adaptado (Relojoaria) |
|---|------------|--------|-------------------------------|
| 1 | **Combustível Extra** | Trazer audiência de outro canal para stories | "Quem é da comunidade do WhatsApp já sabe... mas hoje vou compartilhar aqui também" |
| 2 | **Desafio Curto c/ Promessa de Análise** | Propor desafio + analisar resultado | "Me manda foto do seu relógio que eu digo quanto vale hoje no mercado" |
| 3 | **Conversa sem Privacidade** | Compartilhar print de DM nos stories | Print de cliente perguntando sobre uma peça + comentário público |
| 4 | **Hotseat** | Audiência ajuda uma pessoa | "Esse seguidor quer comprar o primeiro relógio vintage. O que vocês recomendam?" |
| 5 | **Meta Coletiva** | Ação coletiva em troca de conteúdo | "500 reações e eu mostro a peça mais rara que já passou pela Mr. Chrono" |
| 6 | **História com Gancho** | Narrativa real com produto na história | "Em 1969, esse relógio foi pra lua no pulso de um astronauta. E semana passada, um parecido apareceu num leilão..." |
| 7 | **Cultura de Resultado** | Incentivar depoimentos | "Se você comprou um relógio com a gente, manda uma foto no pulso! Quero ver" |
| 8 | **Piada Interna** | Repetição de piada da comunidade | Referências que só a comunidade entende (criar ao longo do tempo) |
| 9 | **Pânico pelo Conteúdo** | Conteúdo extremamente valioso + escasso | "Vou mostrar como identificar um mostrador original vs restaurado. Mas só até meia-noite" |
| 10 | **Ansiedade pela Abertura** | Gerar expectativa pelo drop/oferta | "Hoje às 19:30 vai cair uma peça que vocês pediram faz MESES. Ativa a notificação" |
| 11 | **Abertura de Carrinho** | Foco total em vendas | "Peça disponível AGORA. Primeiro que chamar no WhatsApp leva" |
| 12 | **Ativador de Notificações** | Gerar curiosidade para ativar notificação | "Amanhã vai ter uma coisa diferente aqui nos stories. Ativa a notificação pra não perder" |
| 13 | **Alerta para Voltar** | Fazer voltar nos stories anteriores | "Volta 3 stories e me diz qual informação foi mais útil pra você" |
| 14 | **B.I Apurado** | Coletar informações via enquetes/perguntas | "Qual marca vocês mais querem ver aqui? Omega / Cartier / Rolex / Outra" |
| 15 | **Print Valioso** | Incentivar print do conteúdo | "Salva esse story. Na próxima vez que for comprar relógio, confere essa lista" |
| 16 | **Identidade do Comunicador** | Manter tom consistente (USAR SEMPRE) | Tom descontraído e acessível em 100% dos stories |
| 17 | **Identidade do Produto** | Nomes e termos únicos do produto | Vocabulário próprio da Mr. Chrono (criar termos memoráveis) |
| 18 | **Identidade do Consumidor** | Conectar com perfil do cliente ideal | Falar para quem aprecia relógios com história, não só status |
| 19 | **Desabafo** | Estimular público a compartilhar histórias | "Quem já comprou um relógio e se arrependeu? Me conta a história" |
| 20 | **Opinião de Quem Comprou** | Pedir depoimentos de clientes | "Você comprou com a Mr. Chrono? Me conta o que achou da experiência" |
| 21 | **Peça Compartilhamento** | CTA de compartilhamento | "Se esse conteúdo te ajudou, compartilha com aquele amigo que curte relógio" |
| 22 | **Nome Esquisito** | Nomes criativos e memoráveis | "O Teste do Tique-Taque" (para verificar autenticidade), "Efeito Pátina" (para valorização vintage) |
| 23 | **Espetacularização** | Exagerar situação simples | "Acabou de chegar uma peça que fez TODO MUNDO do escritório parar pra olhar" |
| 24 | **Você Sabia?** | Fato curioso para abrir sequência | "Você sabia que um Rolex Submarino leva 1 ANO pra ser fabricado?" |
| 25 | **Micro Influência** | Recomendar algo incomum | Indicar livros, filmes, documentários sobre relojoaria que poucos conhecem |
| 26 | **Presente Difícil** | Gincana com prêmio para quem engajar | "Quem acertar o ano de fabricação dessa peça ganha frete grátis na próxima compra" |
| 27 | **Resposta Escondida** | Easter egg na sequência | "Tem uma curiosidade escondida nos stories de hoje. Quem achar me manda no direct" |
| 28 | **Tarja de Curiosidade** | Esconder parte do conteúdo | Foto de peça rara com preço coberto por tarja: "Com 300 reações eu revelo o preço" |
| 29 | **Psicologia Reversa** | Dizer o contrário do esperado | "Não compre um relógio vintage se você não aguenta receber elogio toda vez que sai de casa" |
| 30 | **Resumo** | Pedir resumo de conteúdo em troca de prêmio | "Quem fizer o melhor resumo do nosso último reel ganha um cupom" |
| 31 | **Os 7 Erros** | Achar erros (nichos visuais) | "Tem algo errado nessa peça. Quem consegue identificar? Me manda no direct" |
| 32 | **Diário** | Compartilhar bastidores pessoais | "Hoje chegou uma caixa de peças do leilão. Vem ver comigo o que veio" |
| 33 | **Crítica** | Abrir espaço para opinião/crítica | "Qual relógio famoso vocês acham FEIO? Quero honestidade aqui 😂" |
| 34 | **Demonstração Curta** | Mostrar produto em funcionamento | Vídeo curto mostrando detalhes do mostrador, movimento, acabamento |
| 35 | **Enquete com Curiosidade Real** | Perguntas que todo mundo quer saber | "Quanto vocês acham que custa um Rolex dos anos 70?" com enquete de faixas de preço |
| 36 | **Link Oculto** | Link inesperado no meio da narrativa | Link para comunidade WhatsApp inserido no meio de uma história |
| 37 | **Indicação Pretensiosa** | Pedir indicações da audiência | "Me indica um filme/série sobre relógios que você curtiu" |
| 38 | **Levante a Mão** | Termômetro — filtrar interessados | "Se você quer ser avisado primeiro quando cair peça Cartier, me manda 'Cartier' no direct" |

---

## Combinações de Dispositivos Recomendadas

| Combinação | Dispositivos | Uso Mr. Chrono |
|---|---|---|
| Curiosidade + Escassez | (12) Ativador de notificações + (9) Pânico pelo conteúdo | Aquecimento para drop especial |
| Narrativa + Vulnerabilidade | (6) História com gancho + (19) Desabafo | Histórias de clientes, bastidores |
| Engajamento + Inteligência | Sequência de engajamento + (14) B.I Apurado | Pesquisa sobre preferências de marcas |
| Storytelling completo | (6) História com gancho + (16) Identidade comunicador + (17) Identidade produto + (18) Identidade consumidor | Narrativa da marca Mr. Chrono |
| Gamificação | (31) Os 7 erros + (26) Presente difícil | Quiz visual de relógios |
| Pesquisa + Vendas | (35) Enquete com curiosidade real + Inbox lucrativo | Segmentar interessados antes do drop |
| Funil de drop | (1) Combustível extra + (10) Ansiedade pela abertura + (38) Levante a mão | Aquecimento diário pré-drop 19:30 |

---

## Esqueleto da Sequência (Template Estrutural)

### Sequência Completa (~15 stories)

| Story | Função | CTA | Dispositivos Típicos |
|-------|--------|-----|----------------------|
| 1 | Abertura — definir tema, gerar curiosidade | Interação (enquete/reação) | Você sabia?, Enquete curiosidade |
| 2-3 | Desenvolvimento — aprofundar tema | Interação | B.I Apurado, História com gancho |
| 4-5 | Conteúdo de valor — educar/entreter | Interação | Print valioso, Demonstração curta |
| 6 | Ponto de virada / surpresa | Interação | Tarja curiosidade, Espetacularização |
| **7** | **CTA externo** (link comunidade ou peça) | **Link externo** | Link oculto, Levante a mão |
| 8-9 | Mais conteúdo / responder audiência | Interação | Conversa sem privacidade, Piada interna |
| 10-11 | Aprofundamento / prova social | Interação | Opinião de quem comprou, Cultura resultado |
| 12-13 | Construção final / tensão | Interação | Pânico conteúdo, Meta coletiva |
| 14 | Encerramento com valor | Interação | Alerta para voltar, Peça compartilhamento |
| **15** | **CTA final** (link comunidade ou peça) | **Link externo** | Levante a mão, Combustível extra |

### Sequência Curta (~8 stories)

| Story | Função | CTA |
|-------|--------|-----|
| 1 | Abertura — curiosidade/pergunta | Interação |
| 2-3 | Desenvolvimento do tema | Interação |
| **4** | **CTA externo** | **Link externo** |
| 5-6 | Mais conteúdo/valor | Interação |
| 7 | Encerramento com valor | Interação |
| **8** | **CTA final** | **Link externo** |

---

## Territórios Temáticos (Banco de Temas)

### Cultura Relojoeira
- História de marcas (Omega e a NASA, Rolex e o Everest, Cartier e a aviação)
- Tipos de movimentos (automático, manual, quartzo) — como funcionam
- Complicações (cronógrafo, moonphase, GMT, tourbillon)
- Tipos de cristal (acrílico, mineral, safira) — prós e contras
- Evolução dos designs ao longo das décadas
- Materiais (aço, ouro, titânio, cerâmica)
- Termos técnicos explicados de forma simples

### Mercado Vintage
- Por que relógios vintage valorizam
- Como identificar peça original vs falsa
- Marcas que mais valorizam
- Erros comuns ao comprar relógio vintage
- O que observar numa compra (mostrador, caixa, movimento, pulseira)
- Comparativos: vintage vs novo — investimento

### Bastidores Mr. Chrono
- Recebimento de peças de leilão (unboxing)
- Processo de revisão no relojoeiro
- Como funciona autenticação
- Histórias de peças que passaram pela loja
- Dia a dia da operação

### Histórias de Clientes
- Presente que marcou (noivo, pai, formatura)
- Primeiro relógio vintage
- Colecionadores e suas histórias
- Depoimentos e fotos no pulso

### Curiosidades e Entretenimento
- Relógios de famosos / personagens de filme
- Recordes de leilão (peças mais caras já vendidas)
- Fatos surpreendentes sobre marcas
- "Você sabia?" do mundo relojoeiro
- Mitos vs verdades sobre relógios

### Estilo e Lifestyle
- Como combinar relógio com roupa
- Relógio para cada ocasião
- Tendências do mercado
- O relógio como investimento vs acessório

---

## CTAs e Destinos

### CTA de Interação (stories normais)
- Enquete com 2 opções
- Caixinha de perguntas
- Slider de reação (emoji)
- "Responde esse story"
- "Me manda no direct"
- "Reage com 🔥"

### CTA de Link Externo (stories 7 e 15)
- **Link da Comunidade WhatsApp** — destino principal para captar novos membros
- **Link de peça específica do catálogo** — quando a sequência se conecta com o drop do dia
- Formato: link clicável no story (adesivo de link do Instagram)

---

## Regras de Geração

### Obrigatórias
1. Toda sequência deve usar **mínimo 5 dispositivos** de engenharia social
2. O dispositivo #16 (Identidade do Comunicador) é **SEMPRE ativo** — tom descontraído em 100% dos stories
3. CTAs de link externo **apenas nos stories 7 e 15** (sequência longa) ou **4 e 8** (curta)
4. Todos os outros stories devem ter **CTA de interação** (enquete, reação, resposta)
5. A sequência deve ter **narrativa coesa** — cada story conecta com o anterior
6. **Nunca** parecer anúncio ou spam — o conteúdo deve gerar valor genuíno
7. Cada story deve ser **autocontido visualmente** — funcionar mesmo se visto isolado

### Diretrizes de Conteúdo
- Informações factuais sobre relógios devem ser precisas
- Não inventar dados ou estatísticas — usar fatos reais do mundo relojoeiro
- Quando usar "Você sabia?", o fato precisa ser surpreendente de verdade
- Enquetes devem ter opções genuinamente interessantes (não óbvias)
- A sequência não substitui o drop diário — é conteúdo complementar de aquecimento

### Diretrizes Visuais
- Máximo ~40-50 palavras por story (precisa ser legível em celular)
- Palavras-chave em destaque (cor diferente) — máximo 3-5 palavras destacadas por story
- Se o story tem enquete, o texto acima deve ser curto (pergunta + contexto mínimo)
- Manter consistência visual em toda sequência (mesma família de fontes, cores, estilo)

---

## Interface do Sistema (Features)

### Tela Principal
1. **Seletor de tipo de sequência** — dropdown com os 5 tipos prioritários
2. **Campo de tema** — texto livre para o usuário descrever o tema/prompt
3. **Seletor de tamanho** — Curta (~8 stories) ou Completa (~15 stories)
4. **Upload de fotos de fundo** — arrastar fotos de relógios (o sistema alterna entre elas)
5. **Botão "Gerar Sequência"**

### Tela de Resultado
1. **Preview de todos os stories** em grid (miniaturas clicáveis)
2. **Preview individual** em tamanho real (1080x1920 simulado)
3. **Painel lateral** com: número do story, dispositivos usados, tipo de CTA, texto da copy
4. **Botão "Baixar Story"** (PNG individual)
5. **Botão "Baixar Todos"** (ZIP com todos os stories numerados)
6. **Botão "Regenerar"** — gerar variação da mesma sequência

### Prompt Livre
- Campo de texto onde o usuário pode descrever livremente o que quer
- Ex: "Cria uma sequência sobre a história da Omega no espaço, com enquetes e terminando com CTA pra comunidade"
- O sistema interpreta o prompt e gera a sequência seguindo a metodologia

---

## Estrutura de Pastas (se buildado com Claude Code)

```
src/
├── app/
│   └── page.tsx              # Tela principal do gerador
├── components/
│   ├── SequenceGenerator.tsx  # Form de configuração
│   ├── StoryPreview.tsx       # Preview individual do story
│   ├── StoryGrid.tsx          # Grid de miniaturas
│   ├── StoryCanvas.tsx        # Renderização Canvas 1080x1920
│   ├── ImageUploader.tsx      # Upload de fotos de fundo
│   └── DeviceTag.tsx          # Tag visual do dispositivo usado
├── lib/
│   ├── stories-engine.ts      # Motor de geração de sequências
│   ├── devices.ts             # Base de dados dos 38 dispositivos
│   ├── sequence-types.ts      # Tipos de sequência + regras
│   ├── themes.ts              # Banco de temas relojoaria
│   ├── canvas-renderer.ts     # Renderização de imagens
│   └── export.ts              # Export PNG/ZIP
├── data/
│   ├── devices.json           # 38 dispositivos com lógica e exemplos
│   ├── sequence-templates.json # Templates de sequência
│   └── watch-facts.json       # Banco de fatos/curiosidades sobre relógios
└── types/
    └── index.ts               # Tipos TypeScript
```

---

## ⛔ NÃO Fazer

- NÃO gerar stories com cara de anúncio/spam
- NÃO usar menos de 5 dispositivos por sequência
- NÃO colocar CTA de link em todos os stories (apenas posições estratégicas)
- NÃO inventar fatos sobre relógios — usar informações verificáveis
- NÃO gerar texto longo demais por story (máx ~50 palavras)
- NÃO usar tom formal/corporativo — sempre descontraído
- NÃO misturar a sequência de engajamento com o drop da peça (são coisas separadas)
- NÃO gerar stories soltos sem narrativa — toda sequência deve ter começo, meio e fim

---

## Workflow de Uso

1. Usuário sobe fotos de relógios como fundo
2. Seleciona tipo de sequência (ou usa prompt livre)
3. Define tema e tamanho (curta/completa)
4. Sistema gera sequência completa com imagens
5. Usuário revisa stories no preview
6. Baixa imagens individuais ou pacote ZIP
7. Posta no Instagram Stories (recriando enquetes/botões por cima das imagens)

---

## Links de Referência

- Catálogo Mr. Chrono: gestaomrchrono.vercel.app
- Site: www.mrchrono.com.br
- Metodologia: Stories 10x (Leandro Ladeira / VTSD)
