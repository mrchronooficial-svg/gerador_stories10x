import type {
  GeneratorConfig,
  StorySequence,
  StorySlide,
  SequenceType,
  SequenceLength,
  CTAType,
  InteractionCTA,
  SequenceTypeInfo,
} from "@/types/stories"

import devicesData from "@/data/devices.json"
import sequenceTypesData from "@/data/sequence-types.json"
import watchFacts from "@/data/watch-facts.json"
import { matchKB } from "@/lib/knowledge-base"
import type { KBEntry } from "@/types/knowledge"

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface WatchFact {
  fact: string
  category: string
  brands: string[]
}

interface SlideTemplate {
  text: string
  highlightWords: string[]
  interactionType?: InteractionCTA
  pollOptions?: [string, string]
  questionBoxPlaceholder?: string
  devices: number[]
  function: string
}

interface SlotDefinition {
  slot: string
  ctaType: CTAType
}

// ---------------------------------------------------------------------------
// AQUECIMENTO Templates
// ---------------------------------------------------------------------------

const AQUECIMENTO_TEMPLATES: Record<string, SlideTemplate[]> = {
  abertura: [
    {
      text: "Hoje as 19:30 vai cair uma peca que voces pediram faz MESES. Preparados?",
      highlightWords: ["19:30", "MESES"],
      interactionType: "enquete",
      pollOptions: ["Preparado!", "Nem sabia"],
      devices: [10, 16],
      function: "Abertura - gerar curiosidade para o drop",
    },
    {
      text: "Voces nao fazem ideia do que chegou hoje no escritorio da Mr. Chrono",
      highlightWords: ["ideia", "Mr. Chrono"],
      interactionType: "slider-reacao",
      devices: [23, 16],
      function: "Abertura - espetacularizacao",
    },
    {
      text: "A gente recebeu tantas mensagens pedindo essa marca que decidiu: hoje e o dia",
      highlightWords: ["tantas mensagens", "hoje"],
      interactionType: "enquete",
      pollOptions: ["Qual marca?", "Ja sei qual e!"],
      devices: [35, 16],
      function: "Abertura - enquete com curiosidade",
    },
    {
      text: "Bom dia pra quem acorda e ja confere o relogio no pulso antes do celular. Hoje tem conteudo especial",
      highlightWords: ["conteudo especial", "relogio no pulso"],
      interactionType: "reage-fogo",
      devices: [23, 16],
      function: "Abertura - conexao com seguidor",
    },
    {
      text: "Para tudo. A gente acabou de receber uma informacao que muda o jogo pra quem ta de olho numa peca especial",
      highlightWords: ["muda o jogo", "peca especial"],
      interactionType: "reage-fogo",
      devices: [10, 16],
      function: "Abertura - gatilho de curiosidade",
    },
    {
      text: "Voces sabiam que {KB_FACT}? Hoje a gente vai falar sobre {BRAND_NAME}",
      highlightWords: [],
      interactionType: "enquete",
      pollOptions: ["Sabia!", "Nao fazia ideia"],
      devices: [23, 16],
      function: "Abertura - fato contextual do KB",
    },
    {
      text: "Fato que 90% das pessoas nao sabem: {KB_FACT}. E a historia por tras e ainda mais impressionante",
      highlightWords: [],
      interactionType: "reage-fogo",
      devices: [10, 16],
      function: "Abertura - curiosidade com fato KB",
    },
  ],
  desenvolvimento: [
    {
      text: "Quem e da comunidade do WhatsApp ja viu o spoiler... mas aqui vai um detalhe que ninguem percebeu",
      highlightWords: ["comunidade", "WhatsApp", "detalhe"],
      interactionType: "reage-fogo",
      devices: [1, 16],
      function: "Desenvolvimento - combustivel extra",
    },
    {
      text: "Essa peca tem uma historia incrivel. O dono anterior usou por 30 anos sem trocar de relogio",
      highlightWords: ["historia", "30 anos"],
      interactionType: "responde-story",
      devices: [6, 16],
      function: "Desenvolvimento - historia com gancho",
    },
    {
      text: "Olha o que um seguidor me mandou no direct sobre essa peca. Autorizado a compartilhar!",
      highlightWords: ["direct", "compartilhar"],
      interactionType: "slider-reacao",
      devices: [3, 16],
      function: "Desenvolvimento - conversa sem privacidade",
    },
    {
      text: "Antes de mostrar a peca, me diz: qual faixa de preco voces esperam pra um relogio assim?",
      highlightWords: ["faixa de preco"],
      interactionType: "enquete",
      pollOptions: ["Ate R$ 5 mil", "Acima de R$ 5 mil"],
      devices: [14, 35, 16],
      function: "Desenvolvimento - B.I apurado",
    },
    {
      text: "Se voce quer ser avisado primeiro quando cair peca Cartier, me manda Cartier no direct",
      highlightWords: ["primeiro", "Cartier", "direct"],
      interactionType: "manda-direct",
      devices: [38, 16],
      function: "Desenvolvimento - levante a mao",
    },
    {
      text: "Um detalhe que pouca gente sabe sobre {BRAND_NAME}: {KB_FACT}. E isso muda tudo na hora de avaliar uma peca",
      highlightWords: [],
      interactionType: "reage-fogo",
      devices: [6, 16],
      function: "Desenvolvimento - fato contextual KB",
    },
  ],
  valor: [
    {
      text: "Dica rapida: sempre confira o numero de serie ANTES de fechar qualquer negocio. Salva esse story",
      highlightWords: ["numero de serie", "ANTES", "Salva"],
      interactionType: "reage-fogo",
      devices: [15, 9, 16],
      function: "Conteudo de valor - dica pratica",
    },
    {
      text: "3 sinais de que um relogio vintage e um bom investimento: mostrador original, caixa sem polimento, documentacao completa",
      highlightWords: ["3 sinais", "bom investimento"],
      interactionType: "responde-story",
      devices: [9, 15, 16],
      function: "Conteudo de valor - educacao",
    },
    {
      text: "Vou mostrar como identificar um mostrador original vs restaurado. Mas so ate meia-noite esse conteudo fica disponivel",
      highlightWords: ["original", "restaurado", "meia-noite"],
      interactionType: "slider-reacao",
      devices: [9, 16],
      function: "Conteudo de valor - panico pelo conteudo",
    },
    {
      text: "Um relogio nao e so um acessorio. E uma decisao. E as melhores decisoes vem com informacao",
      highlightWords: ["decisao", "informacao"],
      interactionType: "reage-fogo",
      devices: [9, 16],
      function: "Conteudo de valor - reflexao",
    },
  ],
  virada: [
    {
      text: "Ta, mas por que a gente ta contando tudo isso? Porque hoje a noite vai rolar algo que voces vao querer ver",
      highlightWords: ["hoje a noite", "vao querer ver"],
      interactionType: "reage-fogo",
      devices: [10, 16],
      function: "Virada - criar expectativa",
    },
    {
      text: "Agora vem a parte boa. Tudo que a gente falou ate aqui e o contexto pro que vai acontecer nas proximas horas",
      highlightWords: ["parte boa", "proximas horas"],
      interactionType: "slider-reacao",
      devices: [10, 16],
      function: "Virada - revelar contexto",
    },
    {
      text: "E se eu te dissesse que da pra ter acesso a pecas que normalmente so colecionador consegue? A gente ta tornando isso possivel",
      highlightWords: ["acesso a pecas", "tornando isso possivel"],
      interactionType: "manda-direct",
      devices: [38, 16],
      function: "Virada - abrir possibilidade",
    },
  ],
  interacao: [
    {
      text: "Qual marca voces mais querem ver aqui? Omega, Cartier, Rolex ou outra?",
      highlightWords: ["Omega", "Cartier", "Rolex"],
      interactionType: "enquete",
      pollOptions: ["Omega / Cartier", "Rolex / Outra"],
      devices: [14, 35, 16],
      function: "Interacao - coleta de preferencias",
    },
    {
      text: "Numa escala de 0 a 10, quanto voce e viciado em relogio? Arrasta o emoji pra me contar",
      highlightWords: ["viciado em relogio", "Arrasta o emoji"],
      interactionType: "slider-reacao",
      devices: [35, 16],
      function: "Interacao - slider engajamento",
    },
    {
      text: "Se voce pudesse ter UM relogio pro resto da vida, qual seria? Me conta nos direct",
      highlightWords: ["UM relogio", "resto da vida"],
      interactionType: "manda-direct",
      devices: [14, 16],
      function: "Interacao - pergunta pessoal",
    },
  ],
  "cta-externo": [
    {
      text: "Quer ser avisado PRIMEIRO quando a peca cair? Entra na comunidade do WhatsApp",
      highlightWords: ["PRIMEIRO", "comunidade", "WhatsApp"],
      devices: [38, 36, 16],
      function: "CTA externo - link comunidade WhatsApp",
    },
    {
      text: "A peca de hoje vai pro WhatsApp antes do Instagram. Link aqui embaixo pra entrar no grupo",
      highlightWords: ["WhatsApp", "antes", "Instagram"],
      devices: [1, 36, 16],
      function: "CTA externo - link comunidade",
    },
    {
      text: "A gente montou uma pagina exclusiva com todos os detalhes. Clica no link e confere com calma",
      highlightWords: ["pagina exclusiva", "todos os detalhes"],
      devices: [36, 16],
      function: "CTA externo - pagina de detalhes",
    },
  ],
  encerramento: [
    {
      text: "Compartilha com aquele amigo que ia pirar com essa peca. Ele vai te agradecer depois!",
      highlightWords: ["Compartilha", "amigo"],
      interactionType: "reage-fogo",
      devices: [21, 16],
      function: "Encerramento - peca compartilhamento",
    },
    {
      text: "Volta nos stories anteriores e me diz: qual informacao foi mais util pra voce?",
      highlightWords: ["Volta", "mais util"],
      interactionType: "manda-direct",
      devices: [13, 16],
      function: "Encerramento - alerta para voltar",
    },
    {
      text: "19:30 no WhatsApp. Ativa a notificacao pra nao perder. A gente se ve la!",
      highlightWords: ["19:30", "WhatsApp", "notificacao"],
      devices: [12, 10, 16],
      function: "Encerramento - ativador de notificacoes",
    },
  ],
}

// ---------------------------------------------------------------------------
// ENGAJAMENTO Templates
// ---------------------------------------------------------------------------

const ENGAJAMENTO_TEMPLATES: Record<string, SlideTemplate[]> = {
  abertura: [
    {
      text: "Confessa: voce ja ficou olhando um relogio numa vitrine por mais de 5 minutos?",
      highlightWords: ["Confessa", "5 minutos"],
      interactionType: "enquete",
      pollOptions: ["Ja sim", "Nunca"],
      devices: [24, 16],
      function: "Abertura - pergunta de identificacao",
    },
    {
      text: "Voce sabia que um Rolex Submariner leva quase 1 ANO pra ser fabricado do zero?",
      highlightWords: ["Rolex Submariner", "1 ANO"],
      interactionType: "slider-reacao",
      devices: [24, 16],
      function: "Abertura - voce sabia?",
    },
    {
      text: "Chegou a hora de um debate serio aqui nos stories. Prontos?",
      highlightWords: ["debate serio", "Prontos"],
      interactionType: "enquete",
      pollOptions: ["Bora!", "Sobre o que?"],
      devices: [23, 16],
      function: "Abertura - espetacularizacao",
    },
    {
      text: "Vamos jogar um jogo? Eu mostro, voce opina. Sem certo ou errado. So opiniao de quem entende",
      highlightWords: ["jogar um jogo", "quem entende"],
      interactionType: "reage-fogo",
      devices: [23, 16],
      function: "Abertura - convite interativo",
    },
    {
      text: "{KB_FACT}. Voce sabia disso? Me conta aqui nos stories",
      highlightWords: [],
      interactionType: "enquete",
      pollOptions: ["Ja sabia", "Nossa, nao sabia!"],
      devices: [24, 16],
      function: "Abertura - fato contextual KB",
    },
  ],
  desenvolvimento: [
    {
      text: "Tem algo errado nessa peca. Quem consegue identificar me manda no direct. O primeiro que acertar ganha um premio",
      highlightWords: ["errado", "direct", "premio"],
      interactionType: "manda-direct",
      devices: [31, 26, 16],
      function: "Desenvolvimento - os 7 erros + presente dificil",
    },
    {
      text: "Hoje chegou uma caixa de pecas de um leilao na Suica. Vem ver comigo o que veio",
      highlightWords: ["leilao", "Suica"],
      interactionType: "slider-reacao",
      devices: [32, 16],
      function: "Desenvolvimento - diario bastidores",
    },
    {
      text: "500 reacoes nesse story e eu mostro a peca mais rara que ja passou pela Mr. Chrono",
      highlightWords: ["500 reacoes", "mais rara", "Mr. Chrono"],
      interactionType: "reage-fogo",
      devices: [5, 16],
      function: "Desenvolvimento - meta coletiva",
    },
    {
      text: "Um documentario que mudou minha visao sobre relogios: Keeper of Time. Ja assistiram?",
      highlightWords: ["Keeper of Time"],
      interactionType: "enquete",
      pollOptions: ["Ja vi!", "Vou assistir"],
      devices: [25, 16],
      function: "Desenvolvimento - micro influencia",
    },
    {
      text: "Quem ja comprou um relogio e se arrependeu? Me conta a historia. Sem julgamento aqui",
      highlightWords: ["arrependeu", "historia"],
      interactionType: "caixinha-perguntas",
      questionBoxPlaceholder: "Conta sua historia aqui...",
      devices: [19, 16],
      function: "Desenvolvimento - desabafo",
    },
    {
      text: "Mostrador preto ou mostrador branco? Parece simples, mas essa escolha diz MUITO sobre seu estilo",
      highlightWords: ["preto ou branco", "seu estilo"],
      interactionType: "enquete",
      pollOptions: ["Preto", "Branco"],
      devices: [35, 16],
      function: "Desenvolvimento - enquete estilo",
    },
  ],
  valor: [
    {
      text: "Qual relogio famoso voces acham FEIO? Quero honestidade aqui. Sem medo de julgamento",
      highlightWords: ["FEIO", "honestidade"],
      interactionType: "caixinha-perguntas",
      questionBoxPlaceholder: "Qual relogio famoso voce acha feio?",
      devices: [33, 16],
      function: "Conteudo de valor - critica aberta",
    },
    {
      text: "Nao compre um relogio vintage se voce nao aguenta receber elogio toda vez que sai de casa",
      highlightWords: ["Nao compre", "elogio"],
      interactionType: "reage-fogo",
      devices: [29, 16],
      function: "Conteudo de valor - psicologia reversa",
    },
    {
      text: "Me indica um filme ou serie sobre relogios que voce curtiu. Quero montar uma lista",
      highlightWords: ["filme", "serie", "lista"],
      interactionType: "caixinha-perguntas",
      questionBoxPlaceholder: "Indica um filme/serie sobre relogios",
      devices: [37, 16],
      function: "Conteudo de valor - indicacao pretensiosa",
    },
    {
      text: "A real e que relogio nao precisa ser caro pra ser bom. O Casio F-91W e prova viva disso",
      highlightWords: ["nao precisa ser caro", "Casio F-91W"],
      interactionType: "slider-reacao",
      devices: [25, 16],
      function: "Conteudo de valor - democratizar",
    },
  ],
  virada: [
    {
      text: "Agora vem a pergunta que vai dividir opinioes. Prepara que e polemica de verdade",
      highlightWords: ["dividir opinioes", "polemica de verdade"],
      interactionType: "reage-fogo",
      devices: [23, 16],
      function: "Virada - preparar polemica",
    },
    {
      text: "Ok, agora que a gente ja aqueceu... vou fazer a pergunta que ninguem tem coragem de fazer",
      highlightWords: ["ninguem tem coragem"],
      interactionType: "slider-reacao",
      devices: [23, 16],
      function: "Virada - pergunta corajosa",
    },
    {
      text: "Chega de aquecimento. Agora vem o que interessa. E eu quero honestidade total aqui",
      highlightWords: ["honestidade total"],
      interactionType: "reage-fogo",
      devices: [33, 16],
      function: "Virada - pedir honestidade",
    },
  ],
  interacao: [
    {
      text: "Rolex ou Omega? Nao vale ficar em cima do muro. Escolhe um e defende nos comentarios",
      highlightWords: ["Rolex ou Omega", "defende"],
      interactionType: "enquete",
      pollOptions: ["Rolex", "Omega"],
      devices: [35, 16],
      function: "Interacao - duelo de marcas",
    },
    {
      text: "Automatico ou quartzo? Eu ja tive preconceito com quartzo. Hoje mudei completamente de ideia",
      highlightWords: ["Automatico ou quartzo", "mudei de ideia"],
      interactionType: "enquete",
      pollOptions: ["Automatico!", "Quartzo!"],
      devices: [35, 16],
      function: "Interacao - duelo tecnologia",
    },
    {
      text: "Me conta: qual foi o ultimo relogio que te fez parar e pensar eu preciso desse?",
      highlightWords: ["eu preciso desse"],
      interactionType: "responde-story",
      devices: [19, 16],
      function: "Interacao - desejo confesso",
    },
    {
      text: "Qual marca de relogio voce acha mais OVERRATED? Pode falar, aqui e espaco seguro",
      highlightWords: ["OVERRATED", "espaco seguro"],
      interactionType: "caixinha-perguntas",
      questionBoxPlaceholder: "A marca mais overrated e...",
      devices: [33, 16],
      function: "Interacao - opiniao polemica",
    },
  ],
  aprofundamento: [
    {
      text: "Curiosidade do dia: {WATCH_FACT}",
      highlightWords: ["Curiosidade do dia"],
      interactionType: "enquete",
      pollOptions: ["Ja sabia", "Nao fazia ideia"],
      devices: [24, 16],
      function: "Aprofundamento - fato curioso",
    },
    {
      text: "Fato que pouca gente conhece: a maioria dos mostradores azul sunburst sao feitos com camadas microscopicas de tinta",
      highlightWords: ["azul sunburst", "camadas microscopicas"],
      interactionType: "slider-reacao",
      devices: [24, 16],
      function: "Aprofundamento - detalhe tecnico",
    },
    {
      text: "Voces perceberam que relogios vintage estao ficando cada vez mais caros? E tem um motivo bem especifico pra isso",
      highlightWords: ["vintage", "cada vez mais caros"],
      interactionType: "responde-story",
      devices: [6, 16],
      function: "Aprofundamento - tendencia de mercado",
    },
  ],
  "cta-externo": [
    {
      text: "Quer fazer parte de uma comunidade de mais de 8 mil apaixonados por relogio? Link aqui",
      highlightWords: ["8 mil", "comunidade"],
      devices: [36, 38, 16],
      function: "CTA externo - link comunidade WhatsApp",
    },
    {
      text: "Tem uma curiosidade escondida nos stories de hoje. Quem achar me manda no direct. Dica: ta no link abaixo",
      highlightWords: ["escondida", "direct"],
      devices: [27, 36, 16],
      function: "CTA externo - resposta escondida + link",
    },
    {
      text: "Se voce curtiu esse conteudo, no site tem uma versao completa com fotos em alta. Clica ai",
      highlightWords: ["versao completa", "fotos em alta"],
      devices: [36, 16],
      function: "CTA externo - link site",
    },
  ],
  encerramento: [
    {
      text: "Se esse conteudo te ajudou, compartilha com aquele amigo que curte relogio. Ele vai te agradecer!",
      highlightWords: ["compartilha", "amigo"],
      interactionType: "reage-fogo",
      devices: [21, 16],
      function: "Encerramento - peca compartilhamento",
    },
    {
      text: "Qual conteudo voces querem ver amanha? Responde aqui que eu faco",
      highlightWords: ["amanha", "Responde"],
      interactionType: "caixinha-perguntas",
      questionBoxPlaceholder: "Qual tema voce quer ver amanha?",
      devices: [14, 16],
      function: "Encerramento - B.I apurado",
    },
    {
      text: "Valeu demais por participar! Esse tipo de interacao e o que faz a comunidade crescer. Amanha tem mais",
      highlightWords: ["comunidade crescer", "Amanha tem mais"],
      interactionType: "reage-fogo",
      devices: [21, 16],
      function: "Encerramento - agradecimento",
    },
  ],
}

// ---------------------------------------------------------------------------
// CONSCIENCIA Templates
// ---------------------------------------------------------------------------

const CONSCIENCIA_TEMPLATES: Record<string, SlideTemplate[]> = {
  abertura: [
    {
      text: "Voce sabia que o Omega Speedmaster foi o primeiro relogio usado na Lua em 1969?",
      highlightWords: ["Omega Speedmaster", "Lua", "1969"],
      interactionType: "enquete",
      pollOptions: ["Ja sabia!", "Nao fazia ideia"],
      devices: [24, 16],
      function: "Abertura - fato curioso",
    },
    {
      text: "A historia do Cartier Santos e surpreendente. Ele foi literalmente o primeiro relogio de pulso da historia",
      highlightWords: ["Cartier Santos", "primeiro", "historia"],
      interactionType: "slider-reacao",
      devices: [6, 16],
      function: "Abertura - historia com gancho",
    },
    {
      text: "Quantos tipos de movimento de relogio existem? A resposta vai te surpreender",
      highlightWords: ["tipos de movimento", "surpreender"],
      interactionType: "enquete",
      pollOptions: ["2 ou 3", "Mais de 5"],
      devices: [35, 16],
      function: "Abertura - enquete com curiosidade",
    },
    {
      text: "Voce sabe a diferenca entre um relogio de R$500 e um de R$50.000? Nao e o que voce pensa",
      highlightWords: ["R$500", "R$50.000", "Nao e o que voce pensa"],
      interactionType: "slider-reacao",
      devices: [24, 16],
      function: "Abertura - provocacao educativa",
    },
    {
      text: "Aula rapida de relojoaria nos stories. Guarda esse conteudo porque vai ser util na proxima compra",
      highlightWords: ["Aula rapida", "proxima compra"],
      interactionType: "reage-fogo",
      devices: [15, 16],
      function: "Abertura - promessa de valor",
    },
    {
      text: "Aula de hoje: {BRAND_NAME}. {KB_FACT}. Vamos aprofundar?",
      highlightWords: [],
      interactionType: "enquete",
      pollOptions: ["Bora!", "Conta mais"],
      devices: [24, 16],
      function: "Abertura - fato contextual KB educativo",
    },
  ],
  desenvolvimento: [
    {
      text: "Em 1962 a NASA testou relogios de 5 marcas diferentes. So o Omega sobreviveu a TODOS os testes",
      highlightWords: ["NASA", "5 marcas", "TODOS"],
      interactionType: "reage-fogo",
      devices: [6, 16],
      function: "Desenvolvimento - narrativa historica",
    },
    {
      text: "Olha o que um seguidor perguntou sobre movimentos automaticos. A duvida dele e a mesma de muita gente",
      highlightWords: ["movimentos automaticos", "muita gente"],
      interactionType: "responde-story",
      devices: [3, 16],
      function: "Desenvolvimento - conversa sem privacidade",
    },
    {
      text: "Qual marca voces acham que mais valoriza no mercado vintage? Me diz antes de eu mostrar os dados",
      highlightWords: ["mais valoriza", "vintage"],
      interactionType: "enquete",
      pollOptions: ["Rolex", "Omega"],
      devices: [14, 35, 16],
      function: "Desenvolvimento - B.I + enquete",
    },
    {
      text: "O Rolex nao foi inventado na Suica. Surpresa? A marca foi fundada em Londres em 1905 por Hans Wilsdorf",
      highlightWords: ["Londres", "1905", "Hans Wilsdorf"],
      interactionType: "slider-reacao",
      devices: [24, 16],
      function: "Desenvolvimento - voce sabia?",
    },
    {
      text: "O acabamento de um relogio conta tudo. Polimento, chanfros, textura do mostrador. E ai que o preco se justifica",
      highlightWords: ["acabamento", "Polimento", "chanfros"],
      interactionType: "enquete",
      pollOptions: ["Sempre reparo", "Nunca notei"],
      devices: [34, 16],
      function: "Desenvolvimento - educacao visual",
    },
  ],
  valor: [
    {
      text: "Salva esse story. Cristal safira: mais resistente a riscos. Acrilico: mais facil de polir. Mineral: meio-termo",
      highlightWords: ["Salva", "safira", "Acrilico", "Mineral"],
      interactionType: "reage-fogo",
      devices: [15, 16],
      function: "Conteudo de valor - print valioso",
    },
    {
      text: "Um relogio automatico funciona com o movimento do seu pulso. Literalmente a energia do seu corpo mantem ele vivo",
      highlightWords: ["automatico", "movimento", "energia"],
      interactionType: "slider-reacao",
      devices: [6, 16],
      function: "Conteudo de valor - educacao",
    },
    {
      text: "O tourbillon foi inventado em 1801 por Abraham-Louis Breguet pra corrigir erros causados pela gravidade",
      highlightWords: ["tourbillon", "1801", "gravidade"],
      interactionType: "reage-fogo",
      devices: [24, 16],
      function: "Conteudo de valor - curiosidade tecnica",
    },
    {
      text: "A real e: quando voce entende de relogio, voce para de gastar dinheiro errado. Conhecimento economiza muito",
      highlightWords: ["entende de relogio", "Conhecimento economiza"],
      interactionType: "slider-reacao",
      devices: [9, 16],
      function: "Conteudo de valor - reflexao",
    },
  ],
  virada: [
    {
      text: "Ta, mas como aplicar tudo isso na pratica? Vem que a gente vai te dar um metodo simples",
      highlightWords: ["na pratica", "metodo simples"],
      interactionType: "reage-fogo",
      devices: [9, 16],
      function: "Virada - aplicacao pratica",
    },
    {
      text: "Agora que voce sabe a teoria, deixa eu te mostrar como identificar isso em 3 passos rapidos",
      highlightWords: ["3 passos rapidos"],
      interactionType: "slider-reacao",
      devices: [9, 16],
      function: "Virada - passo a passo",
    },
    {
      text: "Ok, absorveu tudo? Agora vem a parte que conecta isso com o seu bolso e as suas escolhas",
      highlightWords: ["seu bolso", "suas escolhas"],
      interactionType: "reage-fogo",
      devices: [9, 16],
      function: "Virada - conectar com decisao",
    },
  ],
  interacao: [
    {
      text: "Qual tipo de vidro voce prefere no relogio? A resposta diz muito sobre voce",
      highlightWords: ["tipo de vidro"],
      interactionType: "enquete",
      pollOptions: ["Safira", "Acrilico vintage"],
      devices: [35, 16],
      function: "Interacao - preferencia tecnica",
    },
    {
      text: "Se voce pudesse aprender a montar um relogio do zero, toparia? Demora uns 7 anos de treino",
      highlightWords: ["montar um relogio", "7 anos"],
      interactionType: "enquete",
      pollOptions: ["Toparia!", "Muito tempo"],
      devices: [35, 16],
      function: "Interacao - curiosidade sobre oficio",
    },
  ],
  aprofundamento: [
    {
      text: "{WATCH_FACT}",
      highlightWords: [],
      interactionType: "slider-reacao",
      devices: [24, 16],
      function: "Aprofundamento - fato aleatorio",
    },
    {
      text: "Dica de ouro: antes de comprar qualquer relogio, pesquise o calibre do movimento. Isso te diz tudo sobre a qualidade real",
      highlightWords: ["Dica de ouro", "calibre do movimento", "qualidade real"],
      interactionType: "enquete",
      pollOptions: ["Sempre faco!", "Nunca fiz"],
      devices: [9, 15, 16],
      function: "Aprofundamento - dica pratica",
    },
    {
      text: "Outra dica: nunca ajuste a data do relogio entre 21h e 3h. O mecanismo pode travar e o conserto e caro",
      highlightWords: ["nunca ajuste a data", "21h e 3h", "conserto e caro"],
      interactionType: "enquete",
      pollOptions: ["Ja sabia", "Quase fiz isso!"],
      devices: [14, 16],
      function: "Aprofundamento - dica de manutencao",
    },
  ],
  "cta-externo": [
    {
      text: "A gente posta conteudo assim todo dia na comunidade do WhatsApp. Vem aprender com a gente",
      highlightWords: ["todo dia", "comunidade", "WhatsApp"],
      devices: [36, 1, 16],
      function: "CTA externo - link comunidade",
    },
    {
      text: "A gente montou um guia completo sobre isso no site. Gratis, sem pegadinha. Link ta aqui em cima",
      highlightWords: ["guia completo", "Gratis"],
      devices: [36, 16],
      function: "CTA externo - guia gratis",
    },
    {
      text: "Quer aprofundar? No nosso blog tem um artigo detalhado sobre cada ponto que a gente falou aqui",
      highlightWords: ["artigo detalhado", "cada ponto"],
      devices: [36, 16],
      function: "CTA externo - artigo blog",
    },
  ],
  encerramento: [
    {
      text: "Qual curiosidade voce mais curtiu? Volta nos stories e me diz. Isso ajuda a gente a trazer mais conteudo assim",
      highlightWords: ["Volta", "mais curtiu"],
      interactionType: "manda-direct",
      devices: [13, 14, 16],
      function: "Encerramento - alerta para voltar + B.I",
    },
    {
      text: "Compartilha com alguem que ia amar saber dessas curiosidades. Conhecimento bom se compartilha!",
      highlightWords: ["Compartilha", "curiosidades"],
      interactionType: "reage-fogo",
      devices: [21, 16],
      function: "Encerramento - peca compartilhamento",
    },
    {
      text: "Salva essa sequencia. Na proxima vez que for olhar um relogio, confere esses pontos. Vai fazer toda diferenca",
      highlightWords: ["Salva essa sequencia", "toda diferenca"],
      interactionType: "reage-fogo",
      devices: [15, 16],
      function: "Encerramento - print valioso",
    },
  ],
}

// ---------------------------------------------------------------------------
// VENDA-PRODUTO Templates
// ---------------------------------------------------------------------------

const VENDA_TEMPLATES: Record<string, SlideTemplate[]> = {
  abertura: [
    {
      text: "Acabou de chegar uma peca que fez TODO MUNDO do escritorio parar pra olhar",
      highlightWords: ["TODO MUNDO", "parar pra olhar"],
      interactionType: "slider-reacao",
      devices: [23, 16],
      function: "Abertura - espetacularizacao",
    },
    {
      text: "A gente batizou essa peca de O Sobrevivente. Quer saber por que?",
      highlightWords: ["O Sobrevivente"],
      interactionType: "enquete",
      pollOptions: ["Quero!", "Conta logo"],
      devices: [22, 16],
      function: "Abertura - nome esquisito",
    },
    {
      text: "Hoje eu vou mostrar uma peca que a gente demorou pra conseguir. E ela nao vai durar muito disponivel",
      highlightWords: ["demorou pra conseguir", "nao vai durar"],
      interactionType: "reage-fogo",
      devices: [23, 16],
      function: "Abertura - escassez",
    },
    {
      text: "A gente recebeu algo especial essa semana. E antes de colocar no site, quero mostrar pra voces primeiro",
      highlightWords: ["algo especial", "voces primeiro"],
      interactionType: "reage-fogo",
      devices: [23, 16],
      function: "Abertura - exclusividade stories",
    },
    {
      text: "Chegou peca de {BRAND_NAME} e eu preciso contar um fato: {KB_FACT}. Vem ver essa peca",
      highlightWords: [],
      interactionType: "slider-reacao",
      devices: [23, 16],
      function: "Abertura - venda com fato KB",
    },
  ],
  desenvolvimento: [
    {
      text: "Olha os detalhes desse mostrador. Cada marca no ponteiro conta uma historia de decadas de uso real",
      highlightWords: ["mostrador", "decadas"],
      interactionType: "slider-reacao",
      devices: [34, 16],
      function: "Desenvolvimento - demonstracao curta",
    },
    {
      text: "Um cliente me mandou essa mensagem depois de receber uma peca parecida. Olha o que ele disse",
      highlightWords: ["cliente", "mensagem"],
      interactionType: "reage-fogo",
      devices: [3, 16],
      function: "Desenvolvimento - conversa sem privacidade",
    },
    {
      text: "Essa peca veio de um colecionador que cuidou dela por 25 anos como se fosse um filho",
      highlightWords: ["colecionador", "25 anos"],
      interactionType: "responde-story",
      devices: [6, 16],
      function: "Desenvolvimento - historia com gancho",
    },
    {
      text: "Voce compraria um relogio que ja foi usado por um piloto de corrida? Essa peca tem essa historia",
      highlightWords: ["piloto de corrida", "historia"],
      interactionType: "enquete",
      pollOptions: ["Com certeza!", "Depende da peca"],
      devices: [6, 35, 16],
      function: "Desenvolvimento - historia + enquete",
    },
    {
      text: "No pulso, o conforto e outro nivel. Peso equilibrado, tamanho certo, bracelete que abraca o pulso",
      highlightWords: ["conforto", "Peso equilibrado", "abraca o pulso"],
      interactionType: "slider-reacao",
      devices: [34, 16],
      function: "Desenvolvimento - experiencia no pulso",
    },
  ],
  valor: [
    {
      text: "Pecas nesse estado de conservacao aparecem no mercado umas 2 ou 3 vezes por ano. Literalmente",
      highlightWords: ["conservacao", "2 ou 3 vezes"],
      interactionType: "reage-fogo",
      devices: [9, 16],
      function: "Conteudo de valor - escassez",
    },
    {
      text: "Se voce comprou um relogio com a gente, manda uma foto no pulso! Quero ver como ficou",
      highlightWords: ["foto no pulso"],
      interactionType: "manda-direct",
      devices: [7, 16],
      function: "Conteudo de valor - cultura de resultado",
    },
    {
      text: "Voce comprou com a Mr. Chrono? Me conta o que achou da experiencia. Sua opiniao ajuda outros",
      highlightWords: ["Mr. Chrono", "experiencia"],
      interactionType: "caixinha-perguntas",
      questionBoxPlaceholder: "Como foi sua experiencia?",
      devices: [20, 16],
      function: "Conteudo de valor - opiniao de quem comprou",
    },
    {
      text: "Um cafe especial por dia custa R$15. Em um ano sao R$5.475. Por esse valor, voce tem um relogio que dura uma vida",
      highlightWords: ["R$15", "R$5.475", "dura uma vida"],
      interactionType: "slider-reacao",
      devices: [9, 16],
      function: "Conteudo de valor - ancoragem de preco",
    },
    {
      text: "Quem ja comprou com a gente sabe: cada peca passa por curadoria rigorosa. Das 200 que chegam, selecionamos menos de 30",
      highlightWords: ["curadoria rigorosa", "200", "menos de 30"],
      interactionType: "enquete",
      pollOptions: ["Sabia disso!", "Nao sabia!"],
      devices: [9, 16],
      function: "Conteudo de valor - bastidores curadoria",
    },
  ],
  virada: [
    {
      text: "Agora vem a parte que interessa. Preco, condicao e como garantir. Fica aqui",
      highlightWords: ["Preco", "condicao", "como garantir"],
      interactionType: "reage-fogo",
      devices: [11, 16],
      function: "Virada - revelar oferta",
    },
    {
      text: "Ta, mostrei a peca, contei a historia, falei do valor. Agora vou te dizer como ela pode ser sua",
      highlightWords: ["pode ser sua"],
      interactionType: "slider-reacao",
      devices: [11, 16],
      function: "Virada - transicao para venda",
    },
    {
      text: "Antes de falar de preco, preciso dizer: so tem uma unidade disponivel. Quando sair, acabou",
      highlightWords: ["uma unidade", "acabou"],
      interactionType: "reage-fogo",
      devices: [11, 16],
      function: "Virada - escassez real",
    },
  ],
  interacao: [
    {
      text: "Voces gostam mais de relogio com pulseira de couro ou bracelete de aco? Essa peca vem com os dois",
      highlightWords: ["couro", "aco", "os dois"],
      interactionType: "enquete",
      pollOptions: ["Couro!", "Aco!"],
      devices: [35, 16],
      function: "Interacao - preferencia de pulseira",
    },
    {
      text: "Quanto voces acham que essa peca vale? Chuta um valor ai. Depois eu conto",
      highlightWords: ["quanto", "vale", "Chuta"],
      interactionType: "caixinha-perguntas",
      questionBoxPlaceholder: "Acho que vale R$...",
      devices: [35, 16],
      function: "Interacao - gamificacao de preco",
    },
  ],
  aprofundamento: [
    {
      text: "Detalhe que faz diferenca: essa peca vem com caixa original, documentacao e garantia Mr. Chrono de 12 meses",
      highlightWords: ["caixa original", "garantia", "12 meses"],
      interactionType: "reage-fogo",
      devices: [34, 16],
      function: "Aprofundamento - diferenciais",
    },
    {
      text: "A gente revisou o movimento inteiro. Lubrificacao, ajuste de precisao, vedacao. Sai daqui como novo",
      highlightWords: ["revisou o movimento", "como novo"],
      interactionType: "slider-reacao",
      devices: [9, 16],
      function: "Aprofundamento - cuidado na revisao",
    },
  ],
  "cta-externo": [
    {
      text: "Quer garantir essa peca? Primeiro que chamar no WhatsApp leva. Link aqui",
      highlightWords: ["garantir", "Primeiro", "WhatsApp"],
      devices: [11, 36, 16],
      function: "CTA externo - abertura de carrinho",
    },
    {
      text: "Essa peca ta disponivel agora no catalogo. Toca no link pra ver todos os detalhes",
      highlightWords: ["disponivel", "agora", "catalogo"],
      devices: [11, 36, 16],
      function: "CTA externo - link catalogo",
    },
    {
      text: "Clica no link e confere todos os angulos. Se bater aquela vontade, chama no WhatsApp que a gente resolve",
      highlightWords: ["todos os angulos", "chama no WhatsApp"],
      devices: [36, 16],
      function: "CTA externo - ver e comprar",
    },
  ],
  encerramento: [
    {
      text: "Se voce conhece alguem que ia pirar com essa peca, marca e compartilha. Pode ser o presente perfeito",
      highlightWords: ["compartilha", "presente perfeito"],
      interactionType: "reage-fogo",
      devices: [21, 16],
      function: "Encerramento - compartilhamento",
    },
    {
      text: "Amanha tem mais peca chegando. Ativa a notificacao pra nao perder. A gente se ve!",
      highlightWords: ["Amanha", "notificacao"],
      interactionType: "reage-fogo",
      devices: [12, 16],
      function: "Encerramento - ativador notificacoes",
    },
    {
      text: "Se interessou? Chama no direct ou clica no link. A gente te atende com calma, sem pressa",
      highlightWords: ["Chama no direct", "sem pressa"],
      interactionType: "manda-direct",
      devices: [11, 16],
      function: "Encerramento - convite direto",
    },
  ],
}

// ---------------------------------------------------------------------------
// CAIXINHA-PERGUNTA Templates
// ---------------------------------------------------------------------------

const CAIXINHA_TEMPLATES: Record<string, SlideTemplate[]> = {
  abertura: [
    {
      text: "Hoje e dia de responder as duvidas de voces sobre relogios. Manda sua pergunta!",
      highlightWords: ["duvidas", "Manda"],
      interactionType: "caixinha-perguntas",
      questionBoxPlaceholder: "Sua duvida sobre relogios...",
      devices: [35, 16],
      function: "Abertura - abrir caixinha",
    },
    {
      text: "Voces sempre perguntam sobre isso. Hoje vou responder TUDO. Manda aqui embaixo",
      highlightWords: ["TUDO", "Manda"],
      interactionType: "caixinha-perguntas",
      questionBoxPlaceholder: "Pergunta o que quiser!",
      devices: [14, 16],
      function: "Abertura - B.I + caixinha",
    },
    {
      text: "Abre a caixinha de perguntas! Pode perguntar QUALQUER coisa sobre relogio. Sem pergunta boba",
      highlightWords: ["caixinha de perguntas", "QUALQUER coisa"],
      interactionType: "caixinha-perguntas",
      questionBoxPlaceholder: "Minha duvida e...",
      devices: [14, 16],
      function: "Abertura - caixinha aberta",
    },
  ],
  desenvolvimento: [
    {
      text: "Essa pergunta aparece TODA semana no direct. Vou responder de uma vez pra todo mundo",
      highlightWords: ["TODA semana", "todo mundo"],
      interactionType: "responde-story",
      devices: [3, 16],
      function: "Desenvolvimento - conversa sem privacidade",
    },
    {
      text: "Salva esse story. Essa dica vale ouro pra quem ta pensando em comprar o primeiro relogio vintage",
      highlightWords: ["Salva", "vale ouro", "primeiro relogio"],
      interactionType: "reage-fogo",
      devices: [15, 16],
      function: "Desenvolvimento - print valioso",
    },
    {
      text: "Antes de responder a proxima, me diz: voces preferem conteudo sobre marcas ou sobre tipos de movimento?",
      highlightWords: ["marcas", "movimento"],
      interactionType: "enquete",
      pollOptions: ["Marcas!", "Movimentos!"],
      devices: [14, 35, 16],
      function: "Desenvolvimento - B.I apurado",
    },
    {
      text: "Um seguidor perguntou isso e eu achei genial. Olha a resposta que eu dei pra ele no direct",
      highlightWords: ["genial", "direct"],
      interactionType: "slider-reacao",
      devices: [3, 16],
      function: "Desenvolvimento - conversa sem privacidade",
    },
    {
      text: "Perguntaram: Como saber se um relogio e original? Tem 5 sinais que voce precisa verificar SEMPRE",
      highlightWords: ["original", "5 sinais", "SEMPRE"],
      interactionType: "reage-fogo",
      devices: [15, 16],
      function: "Desenvolvimento - resposta educativa",
    },
  ],
  valor: [
    {
      text: "Essa e a pergunta que eu mais recebo. E a resposta vai surpreender muita gente",
      highlightWords: ["mais recebo", "surpreender"],
      interactionType: "slider-reacao",
      devices: [9, 16],
      function: "Conteudo de valor - panico pelo conteudo",
    },
    {
      text: "Muita gente me pergunta qual relogio eu recomendo como primeiro vintage. Minha resposta e sempre a mesma",
      highlightWords: ["primeiro vintage", "resposta"],
      interactionType: "responde-story",
      devices: [25, 16],
      function: "Conteudo de valor - micro influencia",
    },
    {
      text: "Salva esse story. Lista dos 5 erros mais comuns ao comprar relogio vintage pela primeira vez",
      highlightWords: ["Salva", "5 erros", "primeira vez"],
      interactionType: "reage-fogo",
      devices: [15, 16],
      function: "Conteudo de valor - print valioso",
    },
  ],
  virada: [
    {
      text: "Agora vem a pergunta que MAIS chegou na caixinha. E a resposta vai surpreender muita gente",
      highlightWords: ["MAIS chegou", "surpreender"],
      interactionType: "slider-reacao",
      devices: [9, 16],
      function: "Virada - pergunta mais popular",
    },
    {
      text: "Ok, respondi as duvidas mais comuns. Mas agora vou entrar numa que deu polemica na caixinha",
      highlightWords: ["polemica"],
      interactionType: "reage-fogo",
      devices: [9, 16],
      function: "Virada - polemica da caixinha",
    },
  ],
  interacao: [
    {
      text: "Qual dessas duvidas voces tambem tinham? Me conta que eu aprofundo mais",
      highlightWords: ["duvidas", "aprofundo"],
      interactionType: "caixinha-perguntas",
      questionBoxPlaceholder: "Minha duvida tambem era...",
      devices: [14, 16],
      function: "Interacao - coletar mais perguntas",
    },
    {
      text: "Qual tema voces querem na proxima caixinha? Me ajuda a escolher",
      highlightWords: ["proxima caixinha", "ajuda"],
      interactionType: "enquete",
      pollOptions: ["Marcas de luxo", "Vintage e mercado"],
      devices: [14, 16],
      function: "Interacao - definir proximo tema",
    },
  ],
  aprofundamento: [
    {
      text: "Aproveitando as perguntas, curiosidade: {WATCH_FACT}",
      highlightWords: ["curiosidade"],
      interactionType: "enquete",
      pollOptions: ["Ja sabia!", "Nao fazia ideia!"],
      devices: [24, 16],
      function: "Aprofundamento - fato curioso",
    },
    {
      text: "Outra que sempre perguntam: Posso usar relogio no banho? Se for a prova d'agua de verdade, sim. Mas tem nuances",
      highlightWords: ["banho", "prova d'agua", "nuances"],
      interactionType: "enquete",
      pollOptions: ["Uso tranquilo", "Sempre tiro"],
      devices: [14, 16],
      function: "Aprofundamento - mito comum",
    },
    {
      text: "Dica rapida: nunca guarde seu relogio perto de aparelhos eletronicos. O campo magnetico pode afetar a precisao",
      highlightWords: ["campo magnetico", "precisao"],
      interactionType: "enquete",
      pollOptions: ["Fazia isso!", "Ja sabia!"],
      devices: [14, 16],
      function: "Aprofundamento - dica pratica",
    },
  ],
  "cta-externo": [
    {
      text: "Na comunidade do WhatsApp a gente responde duvidas todo dia. Entra la pra nao perder nada",
      highlightWords: ["comunidade", "WhatsApp", "todo dia"],
      devices: [36, 1, 16],
      function: "CTA externo - link comunidade",
    },
    {
      text: "Se sua duvida nao apareceu aqui, a gente tem um FAQ completo no site. Link ta aqui em cima",
      highlightWords: ["FAQ completo", "sua duvida"],
      devices: [36, 16],
      function: "CTA externo - link FAQ",
    },
  ],
  encerramento: [
    {
      text: "Manda mais perguntas pro direct que amanha tem mais rodada. Quanto mais voces perguntam, melhor fica!",
      highlightWords: ["direct", "amanha"],
      interactionType: "manda-direct",
      devices: [12, 14, 16],
      function: "Encerramento - ativador + B.I",
    },
    {
      text: "Curtiu essa rodada de perguntas? Compartilha com alguem que tambem tem duvidas sobre relogios!",
      highlightWords: ["Compartilha", "duvidas"],
      interactionType: "reage-fogo",
      devices: [21, 16],
      function: "Encerramento - peca compartilhamento",
    },
    {
      text: "Obrigado por cada pergunta. E isso que faz a comunidade Mr. Chrono ser diferente. Voces participam de verdade",
      highlightWords: ["comunidade Mr. Chrono", "participam de verdade"],
      interactionType: "reage-fogo",
      devices: [21, 16],
      function: "Encerramento - agradecimento",
    },
  ],
}

// ---------------------------------------------------------------------------
// Template Registry
// ---------------------------------------------------------------------------

const TEMPLATES: Record<SequenceType, Record<string, SlideTemplate[]>> = {
  aquecimento: AQUECIMENTO_TEMPLATES,
  engajamento: ENGAJAMENTO_TEMPLATES,
  consciencia: CONSCIENCIA_TEMPLATES,
  "venda-produto": VENDA_TEMPLATES,
  "caixinha-pergunta": CAIXINHA_TEMPLATES,
}

// ---------------------------------------------------------------------------
// Sequence Structures
// ---------------------------------------------------------------------------

const COMPLETA_STRUCTURE: SlotDefinition[] = [
  { slot: "abertura", ctaType: "interacao" },        // 1
  { slot: "desenvolvimento", ctaType: "interacao" },  // 2
  { slot: "desenvolvimento", ctaType: "interacao" },  // 3
  { slot: "valor", ctaType: "interacao" },            // 4
  { slot: "interacao", ctaType: "interacao" },        // 5
  { slot: "virada", ctaType: "interacao" },           // 6
  { slot: "cta-externo", ctaType: "link-externo" },   // 7
  { slot: "aprofundamento", ctaType: "interacao" },   // 8
  { slot: "desenvolvimento", ctaType: "interacao" },  // 9
  { slot: "valor", ctaType: "interacao" },            // 10
  { slot: "interacao", ctaType: "interacao" },        // 11
  { slot: "aprofundamento", ctaType: "interacao" },   // 12
  { slot: "virada", ctaType: "interacao" },           // 13
  { slot: "encerramento", ctaType: "interacao" },     // 14
  { slot: "cta-externo", ctaType: "link-externo" },   // 15
]

const CURTA_STRUCTURE: SlotDefinition[] = [
  { slot: "abertura", ctaType: "interacao" },         // 1
  { slot: "desenvolvimento", ctaType: "interacao" },  // 2
  { slot: "valor", ctaType: "interacao" },            // 3
  { slot: "cta-externo", ctaType: "link-externo" },   // 4
  { slot: "virada", ctaType: "interacao" },           // 5
  { slot: "aprofundamento", ctaType: "interacao" },   // 6
  { slot: "encerramento", ctaType: "interacao" },     // 7
  { slot: "cta-externo", ctaType: "link-externo" },   // 8
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

/** Pick a random fact, optionally filtering by brands */
function pickRandomFact(brands?: string[]): string {
  const facts = watchFacts as WatchFact[]
  if (brands && brands.length > 0) {
    const filtered = facts.filter((f) =>
      f.brands.some((b) => brands.includes(b))
    )
    if (filtered.length > 0) return pickRandom(filtered).fact
  }
  return pickRandom(facts).fact
}

/** Replace {WATCH_FACT} placeholders with random facts (brand-aware) */
function injectFacts(text: string, brands?: string[]): string {
  return text.replace(/\{WATCH_FACT\}/g, () => pickRandomFact(brands))
}

/** Replace {KB_FACT} and {BRAND_NAME} placeholders with KB data */
function injectKBContent(text: string, kb: KBEntry): string {
  let result = text
  result = result.replace(/\{KB_FACT\}/g, () => pickRandom(kb.facts))
  result = result.replace(
    /\{BRAND_NAME\}/g,
    kb.brands.length > 0 ? kb.brands[0]! : "relogios"
  )
  // Also handle WATCH_FACT with brand awareness
  result = injectFacts(result, kb.brands.length > 0 ? kb.brands : undefined)
  return result
}

/** Extract 3-5 significant words from text for highlighting */
function extractHighlightWords(text: string): string[] {
  const stopWords = new Set([
    "que", "de", "do", "da", "dos", "das", "um", "uma", "com", "pra",
    "pro", "por", "em", "no", "na", "nos", "nas", "se", "ao", "aos",
    "foi", "ser", "ter", "mas", "mais", "como", "esse", "essa", "isso",
    "este", "esta", "voce", "voces", "hoje", "aqui", "ali", "ate",
    "nao", "sim", "vem", "vai", "sao", "tem", "pode", "sobre", "entre",
    "quando", "onde", "porque", "ela", "ele", "eles", "elas", "seu",
    "sua", "meu", "minha", "todo", "toda", "cada", "muito", "muita",
    "mesmo", "outra", "outro", "tudo", "nada",
  ])
  const words = text
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w.toLowerCase()))
  // Pick up to 4 unique significant words
  const unique = [...new Set(words)]
  return shuffleArray(unique).slice(0, 4)
}

function getDefaultCTAText(
  ctaType: CTAType,
  interactionType?: InteractionCTA
): string {
  if (ctaType === "link-externo") return "Toca no link"
  switch (interactionType) {
    case "enquete":
      return "Vota aqui"
    case "caixinha-perguntas":
      return "Manda sua pergunta"
    case "slider-reacao":
      return "Arrasta pro lado"
    case "responde-story":
      return "Responde esse story"
    case "manda-direct":
      return "Me manda no direct"
    case "reage-fogo":
      return "Reage com fogo"
    default:
      return "Interage aqui"
  }
}

/**
 * Select devices for the entire sequence.
 * Constraints:
 *  - Device 16 (Identidade do Comunicador) is ALWAYS active
 *  - Minimum 5 different devices
 *  - Prefer recommended devices for the sequence type
 */
function selectSequenceDevices(sequenceTypeId: SequenceType): number[] {
  const seqInfo = (sequenceTypesData as SequenceTypeInfo[]).find(
    (s) => s.id === sequenceTypeId
  )
  const recommended = seqInfo?.recommendedDevices ?? []
  const allDeviceIds = (devicesData as { id: number }[]).map((d) => d.id)

  const selected = new Set<number>([16])
  for (const id of shuffleArray(recommended)) {
    selected.add(id)
    if (selected.size >= 7) break
  }
  // Ensure at least 5
  const remaining = shuffleArray(allDeviceIds.filter((id) => !selected.has(id)))
  while (selected.size < 5 && remaining.length > 0) {
    selected.add(remaining.pop()!)
  }
  return Array.from(selected)
}

/**
 * Assign 2-3 devices to a slide from the template + pool,
 * always including device 16.
 */
function assignDevices(
  templateDevices: number[],
  sequenceDevices: number[]
): number[] {
  const result = new Set<number>(templateDevices)
  result.add(16) // always
  // Add extra from pool if needed for variety
  if (result.size < 2) {
    const extra = shuffleArray(sequenceDevices.filter((d) => !result.has(d)))
    if (extra.length > 0) result.add(extra[0]!)
  }
  return Array.from(result)
}

// ---------------------------------------------------------------------------
// Main Generator
// ---------------------------------------------------------------------------

export function generateSequence(config: GeneratorConfig): StorySequence {
  const { sequenceType, theme, length, customPrompt } = config

  // Match knowledge base entry based on user input
  const kb = matchKB(theme, customPrompt)

  const structure =
    length === "completa" ? COMPLETA_STRUCTURE : CURTA_STRUCTURE
  const templates = TEMPLATES[sequenceType]

  const usedTemplates = new Set<string>()
  const usedSnippets = new Set<string>()
  const sequenceDevices = selectSequenceDevices(sequenceType)
  const allDevicesUsed = new Set<number>(sequenceDevices)

  const slides: StorySlide[] = structure.map((slotDef, index) => {
    const ctaType = slotDef.ctaType

    // --- Priority 1: KB snippet for this slot ---
    const kbSnippets = kb.snippets[slotDef.slot]
    if (kbSnippets && kbSnippets.length > 0) {
      const availableSnippets = kbSnippets.filter((s) => !usedSnippets.has(s))
      const snippet = availableSnippets.length > 0
        ? pickRandom(availableSnippets)
        : pickRandom(kbSnippets)

      usedSnippets.add(snippet)

      // Get a template just for devices and interaction metadata
      const slotTemplates = templates[slotDef.slot] || templates.desenvolvimento || Object.values(templates)[0] || []
      const metaTemplate = pickRandom(slotTemplates)

      const slideDevices = assignDevices(metaTemplate.devices, sequenceDevices)
      slideDevices.forEach((d) => allDevicesUsed.add(d))

      const interactionType: InteractionCTA | undefined =
        ctaType === "interacao"
          ? metaTemplate.interactionType || "reage-fogo"
          : undefined

      // Inject any remaining placeholders in the snippet
      const text = injectKBContent(snippet, kb)

      return {
        number: index + 1,
        text,
        highlightWords: extractHighlightWords(text),
        ctaType,
        ctaText: getDefaultCTAText(ctaType, interactionType),
        interactionType,
        pollOptions: metaTemplate.pollOptions,
        questionBoxPlaceholder: metaTemplate.questionBoxPlaceholder,
        devices: slideDevices,
        function: metaTemplate.function,
      }
    }

    // --- Priority 2 & 3: Template (with placeholders or hardcoded) ---
    let slotTemplates = templates[slotDef.slot]
    if (!slotTemplates || slotTemplates.length === 0) {
      slotTemplates =
        templates.desenvolvimento ||
        templates.valor ||
        Object.values(templates)[0] ||
        []
    }

    // Prefer unused templates
    let available = slotTemplates.filter((t) => !usedTemplates.has(t.text))
    if (available.length === 0) available = slotTemplates

    const template = pickRandom(available)
    usedTemplates.add(template.text)

    // Assign devices
    const slideDevices = assignDevices(template.devices, sequenceDevices)
    slideDevices.forEach((d) => allDevicesUsed.add(d))

    const interactionType: InteractionCTA | undefined =
      ctaType === "interacao"
        ? template.interactionType || "reage-fogo"
        : undefined

    // Inject KB content + facts into text
    const text = injectKBContent(template.text, kb)

    // Recompute highlights if placeholders were substituted
    const hasPlaceholders = template.text.includes("{KB_FACT}") || template.text.includes("{BRAND_NAME}") || template.text.includes("{WATCH_FACT}")
    const highlightWords = hasPlaceholders
      ? extractHighlightWords(text)
      : template.highlightWords

    return {
      number: index + 1,
      text,
      highlightWords,
      ctaType,
      ctaText: getDefaultCTAText(ctaType, interactionType),
      interactionType,
      pollOptions: template.pollOptions,
      questionBoxPlaceholder: template.questionBoxPlaceholder,
      devices: slideDevices,
      function: template.function,
    }
  })

  const devicesArray = Array.from(allDevicesUsed).sort((a, b) => a - b)

  return {
    type: sequenceType,
    theme,
    length,
    slides,
    devicesUsed: devicesArray,
    totalSlides: slides.length,
  }
}
