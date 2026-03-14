import { useState, useRef, useEffect, useCallback } from "react";

const ACCENT = "#D4A853";
const W = 1080;
const H = 1920;

const SEQ_TYPES = [
  { id: "aquecimento", label: "🔥 Aquecimento Pré-Drop", desc: "Aquecer audiência durante o dia para o drop das 19:30" },
  { id: "engajamento", label: "💬 Engajamento Puro", desc: "Conectar, gerar conversa, viciar nos stories" },
  { id: "consciencia", label: "🧠 Geração de Consciência", desc: "Educar sobre cultura relojoeira sem vender" },
  { id: "caixinha", label: "❓ Caixinha por Tema", desc: "Gerar valor respondendo dúvidas de relojoaria" },
  { id: "venda", label: "⌚ Venda de Produto Físico", desc: "Sequência focada em peça específica" },
];

const SIZES = [
  { id: "curta", label: "Curta (~8 stories)", n: 8 },
  { id: "completa", label: "Completa (~15 stories)", n: 15 },
];

const THEME_IDEAS = [
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

function buildPrompt(type, theme, size, extra) {
  const n = size === "curta" ? 8 : 15;
  const ctaPos = size === "curta" ? "4 e 8" : "7 e 15";
  const typeObj = SEQ_TYPES.find(t => t.id === type);
  const typeInstructions = {
    aquecimento: `AQUECIMENTO PRÉ-DROP\nObjetivo: criar curiosidade crescente ao longo do dia para que a audiência esteja ANSIOSA quando o drop cair às 19:30.\nA sequência deve começar leve (curiosidade, enquete), escalar em valor e tensão, e terminar com um gancho direto para o drop noturno.\nDispositivos PRIORITÁRIOS: (35) Enquete com Curiosidade Real, (10) Ansiedade pela Abertura, (14) B.I Apurado, (09) Pânico pelo Conteúdo, (38) Levante a Mão, (24) Você Sabia?\nO ÚLTIMO STORY deve criar expectativa clara para o drop das 19:30 (ex: "Hoje às 19:30 cai uma peça que tem tudo a ver com o que a gente falou aqui... ativa a notificação").`,
    engajamento: `ENGAJAMENTO PURO\nObjetivo: gerar CONVERSA. A audiência deve responder, reagir, debater. Nenhum story passivo.\nDispositivos PRIORITÁRIOS: (06) História com Gancho, (33) Crítica, (19) Desabafo, (35) Enquete com Curiosidade Real, (05) Meta Coletiva, (23) Espetacularização, (37) Indicação Pretensiosa\nTemas abrangentes que geram debate: opinião polarizadora, "o que vocês fariam?", comparações inesperadas, bastidores que humanizam.`,
    consciencia: `GERAÇÃO DE CONSCIÊNCIA\nObjetivo: posicionar a Mr. Chrono como AUTORIDADE em relojoaria vintage. Conteúdo denso, educativo, surpreendente.\nDispositivos PRIORITÁRIOS: (24) Você Sabia?, (14) B.I Apurado, (15) Print Valioso, (06) História com Gancho, (25) Micro Influência\nCADA story deve conter pelo menos 1 FATO ESPECÍFICO (nome, data, número, comparação concreta). Zero frases genéricas.`,
    caixinha: `CAIXINHA DE PERGUNTAS POR TEMA\nObjetivo: simular Q&A com profundidade. Stories alternam entre perguntas (como se fossem da audiência) e respostas surpreendentes.\nDispositivos PRIORITÁRIOS: (14) B.I Apurado, (35) Enquete com Curiosidade Real, (15) Print Valioso, (03) Conversa sem Privacidade\nAs perguntas devem ser perguntas que pessoas REAIS fariam.`,
    venda: `VENDA DE PRODUTO FÍSICO\nObjetivo: criar desejo SEM parecer anúncio. Contar uma HISTÓRIA onde o relógio é protagonista.\nDispositivos PRIORITÁRIOS: (06) História com Gancho, (34) Demonstração Curta, (22) Nome Esquisito, (23) Espetacularização, (03) Conversa sem Privacidade, (29) Psicologia Reversa\nNUNCA: "compre agora", linguagem de vendedor. SIM: fascínio, desejo, exclusividade sutil.`,
  };
  const structure = size === "curta"
    ? `Story 1: ABERTURA — Curiosidade FORTE. Prender nos primeiros 2 segundos. Enquete polarizadora, fato surpreendente ou pergunta provocativa. CTA de interação.\nStory 2: CONTEXTO — Situar o tema com dado específico ou história. Aprofundar a curiosidade do story 1. CTA de interação.\nStory 3: CONTEÚDO DE VALOR — A informação que faz a pessoa pensar "não sabia disso". CTA de interação.\nStory 4: CTA EXTERNO — Conteúdo que conecta naturalmente com o link (comunidade WhatsApp ou peça). O link deve fazer sentido na narrativa.\nStory 5: APROFUNDAMENTO — Mais valor. Outro ângulo do tema, prova social, ou resposta de seguidor. CTA de interação.\nStory 6: PONTO ALTO — O insight mais surpreendente ou o momento de maior emoção. CTA de interação.\nStory 7: ENCERRAMENTO — Reflexão, resumo, print valioso ou alerta para voltar nos stories anteriores. CTA de interação.\nStory 8: CTA FINAL — Link externo com chamada forte. Conectar com o drop da noite se for aquecimento.`
    : `Story 1: ABERTURA — Curiosidade MÁXIMA. Prender nos primeiros 2 segundos. Enquete polarizadora, "Você sabia?" com fato chocante, ou pergunta que todo mundo quer saber. CTA de interação.\nStory 2: EXPANSÃO — Expandir sobre a abertura. Se abriu com pergunta, dar a primeira camada da resposta. CTA de interação.\nStory 3: CONTEXTO HISTÓRICO/TÉCNICO — Dado concreto, data, nome, número. Profundidade real. CTA de interação.\nStory 4: DESENVOLVIMENTO — Continuar construindo a narrativa. Cada story deve fazer a pessoa querer ver o próximo. CTA de interação.\nStory 5: SURPREENDA — Algo inesperado. Um twist, uma comparação que ninguém esperava. CTA de interação.\nStory 6: PONTO DE VIRADA — Muda o ângulo da narrativa. Se estava educando, agora provoca emoção. CTA de interação.\nStory 7: CTA EXTERNO — O conteúdo deve fluir naturalmente para o link. Ex: "A gente fala mais sobre isso lá na comunidade...".\nStory 8: PROVA SOCIAL — Print de DM, depoimento, reação da comunidade. CTA de interação.\nStory 9: APROFUNDAMENTO — Mais uma camada de valor. A sequência deve ser tão boa que a pessoa não quer que acabe. CTA de interação.\nStory 10: DEBATE — Provocar a audiência a dar opinião. Enquete, pergunta aberta. CTA de interação.\nStory 11: TENSÃO — Construir para o clímax. Meta coletiva, pânico pelo conteúdo, tarja de curiosidade. CTA de interação.\nStory 12: CLÍMAX — A revelação principal. O conteúdo mais valioso de toda a sequência. CTA de interação.\nStory 13: DESDOBRAMENTO — O que o clímax significa na prática. Aplicação, consequência. CTA de interação.\nStory 14: ENCERRAMENTO — Print valioso, alerta para voltar, pedido de compartilhamento. CTA de interação.\nStory 15: CTA FINAL — Link externo com chamada forte. Se for aquecimento, gerar ansiedade para o drop das 19:30.`;

  return `# GERE UMA SEQUÊNCIA DE STORIES 10X — MR. CHRONO

## BRIEFING
- **Tipo:** ${typeObj.label} — ${typeObj.desc}
- **Tema:** ${theme}
- **Tamanho:** ${n} stories (sequência ${size})
${extra ? `- **Instruções adicionais:** ${extra}` : ""}

---

## SOBRE A MR. CHRONO
Maior página de relojoaria vintage do Instagram do Brasil. Compra e venda de relógios vintage suíços com curadoria (Cartier, Omega, Rolex, etc.). ~9.000 membros na comunidade WhatsApp. ~4.000 visualizações por story. Drop diário de 1 peça às 19:30 (WhatsApp primeiro, depois Instagram). Sede no Rio de Janeiro.

**IMPORTANTE:** As sequências de stories servem para ENGAJAR a audiência DURANTE O DIA. NÃO são anúncios de peças. O drop acontece separadamente às 19:30.

---

## TIPO DE SEQUÊNCIA
${typeInstructions[type]}

---

## TOM DE VOZ (Dispositivo #16 — Identidade do Comunicador — SEMPRE ATIVO)
- Descontraído e acessível. Como um amigo que entende de relógio conversando com outro entusiasta.
- Informal, mas sem gírias forçadas ou agressivas.
- Emojis com moderação: máximo 1-2 por story, e nem em todos.
- Pessoa: "a gente", "nós", "eu" ou direto "você".
- Frases CURTAS e IMPACTANTES. Ritmo de conversa real, não de texto acadêmico.

### Exemplos de tom CERTO vs ERRADO:
✅ "Em 1969, a NASA testou relógios de 5 marcas. Só um sobreviveu a tudo: calor de 93°C, frio de -18°C, impactos de 40G. Era um Omega Speedmaster."
❌ "A Omega é uma marca incrível que tem uma história muito legal com a NASA!"

✅ "Sabe aquele barulhinho de quando você encosta o ouvido no relógio? Ele conta mais sobre a saúde da peça do que qualquer foto."
❌ "Relógios possuem sons que podem indicar seu estado de conservação."

✅ "1mm de diferença no diâmetro de um Rolex pode significar R$100 mil a mais no preço. Não é exagero."
❌ "O tamanho do relógio influencia no seu valor de mercado."

✅ "Confessa: você já ficou parado olhando um relógio numa vitrine por mais de 5 minutos? 😅"
❌ "Relógios vintage são fascinantes e encantam as pessoas."

### O que NUNCA fazer:
- Frases genéricas sem substância ("relógios são incríveis", "vintage é tendência")
- Obviedades ("Rolex é uma marca de luxo")
- Tom de vendedor ("APROVEITE!", "IMPERDÍVEL!", "ÚLTIMAS UNIDADES!")
- Texto longo e monótono sem ritmo
- Perguntas com resposta óbvia ("Você gosta de relógio?" — a pessoa segue uma relojoaria)

---

## DISPOSITIVOS DE ENGENHARIA SOCIAL (use MÍNIMO 5 na sequência)

Referência dos 38 dispositivos:
1. Combustível Extra — trazer audiência de outro canal
2. Desafio Curto c/ Análise — propor desafio, prometer análise
3. Conversa sem Privacidade — print de DM nos stories
4. Hotseat — audiência ajuda alguém
5. Meta Coletiva — ação coletiva em troca de conteúdo valioso
6. História com Gancho — narrativa real que prende e conecta
7. Cultura de Resultado — mostrar/pedir depoimentos
8. Piada Interna — referência que só a comunidade entende
9. Pânico pelo Conteúdo — conteúdo extremamente valioso + escasso
10. Ansiedade pela Abertura — expectativa pelo drop/oferta
11. Abertura de Carrinho — vendas diretas
12. Ativador de Notificações — curiosidade para ativar notificação
13. Alerta para Voltar — fazer voltar em stories anteriores
14. B.I Apurado — coletar info via enquetes/perguntas
15. Print Valioso — incentivar print do conteúdo
16. Identidade do Comunicador — tom consistente (SEMPRE ATIVO)
17. Identidade do Produto — vocabulário único da marca
18. Identidade do Consumidor — falar para o cliente ideal
19. Desabafo — estimular público a compartilhar experiências
20. Opinião de Quem Comprou — pedir depoimentos
21. Peça Compartilhamento — CTA de compartilhamento
22. Nome Esquisito — nomes criativos para processos
23. Espetacularização — transformar simples em grandioso
24. Você Sabia? — fato curioso e surpreendente
25. Micro Influência — recomendar algo incomum
26. Presente Difícil — gincana com prêmio
27. Resposta Escondida — easter egg na sequência
28. Tarja de Curiosidade — esconder parte do conteúdo
29. Psicologia Reversa — dizer o contrário do esperado
30. Resumo — pedir resumo em troca de prêmio
31. Os 7 Erros — achar erros visuais
32. Diário — bastidores pessoais
33. Crítica — abrir espaço para opinião
34. Demonstração Curta — mostrar produto funcionando
35. Enquete com Curiosidade Real — perguntas que todos querem saber
36. Link Oculto — link inesperado no meio da narrativa
37. Indicação Pretensiosa — pedir indicações da audiência
38. Levante a Mão — filtrar interessados

---

## ESTRUTURA DA SEQUÊNCIA (${n} stories)

${structure}

---

## REGRAS DE CTA
- Stories com CTA externo (stories ${ctaPos}): incluir texto como "Link aqui ☝️" ou "Entra na comunidade pelo link" — o destino será o link da comunidade WhatsApp ou uma peça do catálogo.
- TODOS os outros stories OBRIGATORIAMENTE têm CTA de interação: enquete (2 opções), caixinha de pergunta, slider, "responde esse story", "me manda no direct", "reage com 🔥", etc.
- O CTA deve ser NATURAL e conectado ao conteúdo. Nunca jogado aleatoriamente.

## REGRAS DE TEXTO
- MÁXIMO 40-50 palavras por story (precisa ser legível em celular)
- Cada story deve ter 3 a 5 PALAVRAS-CHAVE destacadas (serão renderizadas em cor dourada)
- As palavras destacadas devem ser as mais impactantes: números, nomes de marca, fatos surpreendentes, palavras emocionais
- NÃO destaque conectivos, artigos ou palavras sem peso

## REGRAS DE QUALIDADE
- CADA story deve conter pelo menos 1 informação ESPECÍFICA (fato, dado, nome, data, número, comparação)
- ZERO stories genéricos ou vazios de conteúdo
- A sequência deve ter ARCO NARRATIVO: começo que prende, meio que surpreende, final que marca
- Cada story deve criar vontade de ver o PRÓXIMO — se a pessoa pode parar e não sentir falta, o story falhou
- Use FATOS REAIS sobre relógios. Não invente dados ou estatísticas
- A narrativa deve fluir — cada story conecta com o anterior

---

## FORMATO DE RESPOSTA

Retorne APENAS um JSON válido. Sem markdown, sem backticks, sem texto antes ou depois.

{
  "title": "título curto e descritivo da sequência",
  "stories": [
    {
      "number": 1,
      "text": "texto que aparecerá visualmente no story (máx 50 palavras). Só o texto puro.",
      "highlighted_words": ["palavra1", "palavra2", "palavra3"],
      "devices_used": [24, 35],
      "device_names": ["Você Sabia?", "Enquete com Curiosidade Real"],
      "cta_type": "interaction",
      "cta_text": "Sabia ou não sabia? 👆",
      "has_poll": true,
      "poll_question": "Você sabia disso?",
      "poll_options": ["Sabia 🧠", "Não fazia ideia 🤯"]
    },
    {
      "number": 2,
      "text": "próximo story...",
      "highlighted_words": ["destaque1", "destaque2"],
      "devices_used": [6],
      "device_names": ["História com Gancho"],
      "cta_type": "interaction",
      "cta_text": "Reage com 🔥 se quer saber o final",
      "has_poll": false,
      "poll_question": null,
      "poll_options": null
    }
  ],
  "devices_summary": "Dispositivos usados: #6, #14, #24, #35, #38 (total: 5)"
}

### Campos obrigatórios por story:
- **number**: número do story (1 a ${n})
- **text**: APENAS o texto visual do story. SEM instruções tipo "[foto de relógio]"
- **highlighted_words**: array com 3-5 palavras para destacar em dourado
- **devices_used**: array com números dos dispositivos usados neste story
- **device_names**: array com nomes dos dispositivos
- **cta_type**: "interaction" ou "external_link"
- **cta_text**: texto do CTA
- **has_poll**: true se tem enquete visual
- **poll_question**: texto da pergunta (null se não tem enquete)
- **poll_options**: array com 2 opções (null se não tem enquete)

Gere EXATAMENTE ${n} stories seguindo TODAS as regras acima. Comece agora.`;
}

// ═══ CANVAS RENDERING ═══

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function drawTextBlock(ctx, text, hlWords, x, y, maxW, fontSize) {
  ctx.font = `800 ${fontSize}px Montserrat, Arial Black, sans-serif`;
  ctx.textBaseline = "top";
  const words = text.split(" ");
  const lines = []; let cur = [];
  for (const w of words) {
    const test = [...cur, w].join(" ");
    if (ctx.measureText(test).width > maxW && cur.length) { lines.push([...cur]); cur = [w]; }
    else cur.push(w);
  }
  if (cur.length) lines.push(cur);
  const lh = fontSize * 1.4;
  const hlSet = new Set((hlWords || []).map(w => w.toLowerCase().replace(/[.,!?;:()""'']/g, "")));
  for (const lineWords of lines) {
    const lineStr = lineWords.join(" ");
    const lineW = ctx.measureText(lineStr).width;
    let cx = x + (maxW - lineW) / 2;
    for (const word of lineWords) {
      const clean = word.toLowerCase().replace(/[.,!?;:()""'']/g, "");
      const isHL = hlSet.has(clean) || [...hlSet].some(h => clean.includes(h) || h.includes(clean));
      ctx.fillStyle = isHL ? ACCENT : "#FFFFFF";
      ctx.fillText(word, cx, y);
      cx += ctx.measureText(word + " ").width;
    }
    y += lh;
  }
  return y;
}

function drawPoll(ctx, question, options, y) {
  ctx.font = `700 36px Montserrat, Arial Black, sans-serif`;
  ctx.fillStyle = "#FFFFFF"; ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillText(question, W / 2, y); ctx.textAlign = "left"; y += 65;
  const btnW = 420, btnH = 72, gap = 24, sx = (W - btnW * 2 - gap) / 2;
  for (let i = 0; i < 2 && options && i < options.length; i++) {
    const bx = sx + i * (btnW + gap);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    roundRect(ctx, bx, y, btnW, btnH, 14); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 2;
    roundRect(ctx, bx, y, btnW, btnH, 14); ctx.stroke();
    ctx.fillStyle = "#FFFFFF"; ctx.font = `700 30px Montserrat, Arial Black, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(options[i], bx + btnW / 2, y + btnH / 2);
  }
  ctx.textAlign = "left"; return y + btnH + 30;
}

async function renderStory(canvas, story, bgImage) {
  const ctx = canvas.getContext("2d"); canvas.width = W; canvas.height = H;
  if (bgImage) {
    const scale = Math.max(W / bgImage.width, H / bgImage.height);
    const sw = bgImage.width * scale, sh = bgImage.height * scale;
    ctx.drawImage(bgImage, (W - sw) / 2, (H - sh) / 2, sw, sh);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a1a2e"); grad.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  }
  ctx.fillStyle = "rgba(0,0,0,0.67)"; ctx.fillRect(0, 0, W, H);

  // Story number
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, 40, 50, 90, 90, 20); ctx.fill();
  ctx.fillStyle = ACCENT; ctx.font = `800 38px Montserrat, Arial Black, sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(String(story.number), 85, 95); ctx.textAlign = "left";

  const pad = 80, maxW = W - pad * 2;
  const fontSize = story.text.length > 150 ? 44 : story.text.length > 100 ? 50 : 56;
  let textY = story.has_poll ? 350 : 480;
  let endY = drawTextBlock(ctx, story.text, story.highlighted_words, pad, textY, maxW, fontSize);

  if (story.has_poll && story.poll_question && story.poll_options)
    endY = drawPoll(ctx, story.poll_question, story.poll_options, endY + 50);

  // CTA
  const ctaY = Math.max(endY + 60, H - 300);
  const isExt = story.cta_type === "external_link";
  ctx.font = `700 30px Montserrat, Arial Black, sans-serif`;
  const ctaText = story.cta_text || "";
  const btnW = Math.min(ctx.measureText(ctaText).width + 80, 900), btnH = 68;
  const bx = (W - btnW) / 2;
  ctx.fillStyle = isExt ? ACCENT : "rgba(255,255,255,0.1)";
  roundRect(ctx, bx, ctaY, btnW, btnH, 34); ctx.fill();
  ctx.fillStyle = isExt ? "#0A0A0A" : "#FFFFFF";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(ctaText, W / 2, ctaY + btnH / 2); ctx.textAlign = "left";

  if (story.device_names?.length) {
    ctx.font = `500 22px Montserrat, Arial, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.textAlign = "center";
    ctx.fillText(story.device_names.map(d => `#${d}`).join("  "), W / 2, H - 60);
    ctx.textAlign = "left";
  }
}

function loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => res(img); img.onerror = rej; img.src = src;
  });
}

// ═══ MAIN COMPONENT ═══

export default function App() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("aquecimento");
  const [theme, setTheme] = useState("");
  const [size, setSize] = useState("curta");
  const [extra, setExtra] = useState("");
  const [prompt, setPrompt] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [stories, setStories] = useState(null);
  const [parseError, setParseError] = useState("");
  const [backgrounds, setBackgrounds] = useState([]);
  const [bgImages, setBgImages] = useState([]);
  const [selectedStory, setSelectedStory] = useState(0);
  const [copied, setCopied] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderedUrls, setRenderedUrls] = useState([]);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800;900&display=swap";
    l.rel = "stylesheet"; document.head.appendChild(l);
  }, []);

  const handleBgUpload = (e) => {
    Array.from(e.target.files || []).forEach(f => {
      const r = new FileReader();
      r.onload = (ev) => setBackgrounds(prev => [...prev, ev.target.result]);
      r.readAsDataURL(f);
    });
  };

  useEffect(() => { Promise.all(backgrounds.map(b => loadImg(b))).then(setBgImages); }, [backgrounds]);

  const handleGenerate = () => { setPrompt(buildPrompt(type, theme, size, extra)); setStep(2); };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(prompt); } catch {
      const t = document.createElement("textarea"); t.value = prompt;
      document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const handleParse = () => {
    setParseError("");
    try {
      let c = jsonInput.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
      const data = JSON.parse(c);
      if (!data.stories || !Array.isArray(data.stories)) throw new Error("JSON sem array 'stories'");
      setStories(data); setSelectedStory(0); setStep(4);
      renderAllStories(data.stories);
    } catch (err) { setParseError(`Erro: ${err.message}. Verifique se colou a resposta completa.`); }
  };

  const renderAllStories = useCallback(async (list) => {
    setRendering(true);
    const urls = []; const c = document.createElement("canvas");
    await document.fonts.ready;
    for (let i = 0; i < list.length; i++) {
      const bg = bgImages.length > 0 ? bgImages[i % bgImages.length] : null;
      await renderStory(c, list[i], bg); urls.push(c.toDataURL("image/png"));
    }
    setRenderedUrls(urls); setRendering(false);
  }, [bgImages]);

  const downloadOne = (i) => {
    if (!renderedUrls[i]) return;
    const a = document.createElement("a"); a.href = renderedUrls[i]; a.download = `story_${i + 1}.png`; a.click();
  };
  const downloadAll = () => renderedUrls.forEach((u, i) => setTimeout(() => { const a = document.createElement("a"); a.href = u; a.download = `story_${i + 1}.png`; a.click(); }, i * 300));

  useEffect(() => { if (stories && bgImages.length) renderAllStories(stories.stories); }, [bgImages]);

  useEffect(() => {
    if (!stories || !canvasRef.current) return;
    const s = stories.stories[selectedStory]; if (!s) return;
    const bg = bgImages.length > 0 ? bgImages[selectedStory % bgImages.length] : null;
    document.fonts.ready.then(() => renderStory(canvasRef.current, s, bg));
  }, [selectedStory, stories, bgImages]);

  const s = {
    app: { background: "#0A0A0A", color: "#fff", minHeight: "100vh", fontFamily: "Montserrat, sans-serif" },
    hdr: { padding: "16px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 12 },
    logo: { color: ACCENT, fontSize: 18, fontWeight: 800, letterSpacing: 1 },
    dots: { display: "flex", gap: 4, marginLeft: "auto" },
    dot: (a) => ({ width: a ? 28 : 8, height: 8, borderRadius: 4, background: a ? ACCENT : "#333", transition: "all 0.3s" }),
    wrap: { maxWidth: 880, margin: "0 auto", padding: "20px 16px" },
    h1: { fontSize: 22, fontWeight: 800, marginBottom: 4 },
    sub: { color: "#888", fontSize: 13, marginBottom: 24 },
    lbl: { fontSize: 11, fontWeight: 700, color: "#666", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 },
    inp: { width: "100%", padding: "12px 14px", background: "#141414", border: "1px solid #2a2a2a", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", marginBottom: 6, boxSizing: "border-box", fontFamily: "inherit" },
    ta: { width: "100%", padding: "12px 14px", background: "#141414", border: "1px solid #2a2a2a", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", marginBottom: 16, minHeight: 70, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" },
    btn: (p) => ({ padding: "12px 24px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", background: p ? ACCENT : "#1e1e1e", color: p ? "#0A0A0A" : "#fff", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 6 }),
    card: (a) => ({ background: a ? "rgba(212,168,83,0.06)" : "#141414", border: `1px solid ${a ? ACCENT : "#222"}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8, cursor: "pointer", transition: "all 0.2s" }),
    chip: { padding: "6px 12px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 16, fontSize: 11, color: "#aaa", cursor: "pointer" },
    promptBox: { width: "100%", minHeight: 250, padding: 14, background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 8, color: "#bbb", fontSize: 12, lineHeight: 1.6, fontFamily: "monospace", whiteSpace: "pre-wrap", overflow: "auto", maxHeight: "55vh", boxSizing: "border-box" },
    err: { background: "#2a1010", border: "1px solid #5a2020", borderRadius: 8, padding: 12, color: "#ff6b6b", fontSize: 13, marginBottom: 14 },
    szBtn: (a) => ({ flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${a ? ACCENT : "#2a2a2a"}`, background: a ? "rgba(212,168,83,0.08)" : "#141414", color: a ? ACCENT : "#888", fontWeight: 700, fontSize: 13, cursor: "pointer", textAlign: "center" }),
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 6, marginBottom: 16 },
    thumb: (a) => ({ aspectRatio: "9/16", borderRadius: 6, overflow: "hidden", cursor: "pointer", border: a ? `2px solid ${ACCENT}` : "2px solid #333", position: "relative", background: "#111" }),
    upZone: { border: "2px dashed #333", borderRadius: 10, padding: "20px 14px", textAlign: "center", cursor: "pointer", marginBottom: 16 },
  };

  const Header = () => (
    <div style={s.hdr}>
      <span style={s.logo}>MR. CHRONO</span>
      <span style={{ color: "#555", fontSize: 12 }}>Stories 10x</span>
      <div style={s.dots}>{[1,2,3,4].map(i => <div key={i} style={s.dot(i === step)} />)}</div>
    </div>
  );

  // ═══ STEP 1 ═══
  if (step === 1) return (
    <div style={s.app}><Header />
      <div style={s.wrap}>
        <h1 style={s.h1}>Configurar Sequência</h1>
        <p style={s.sub}>Defina tipo, tema e tamanho. O sistema monta o prompt perfeito com toda a metodologia Stories 10x.</p>

        <label style={s.lbl}>📸 Fotos de fundo</label>
        <div style={s.upZone} onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleBgUpload({ target: { files: e.dataTransfer.files } }); }}>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleBgUpload} />
          {backgrounds.length === 0
            ? <p style={{ color: "#555", margin: 0, fontSize: 13 }}>Clique ou arraste fotos de relógios<br /><span style={{ fontSize: 11 }}>Serão o fundo dos stories (com filtro escuro)</span></p>
            : <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                {backgrounds.map((b, i) => (
                  <div key={i} style={{ width: 44, height: 78, borderRadius: 5, overflow: "hidden", position: "relative" }}>
                    <img src={b} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={e => { e.stopPropagation(); setBackgrounds(p => p.filter((_, j) => j !== i)); }}
                      style={{ position: "absolute", top: 1, right: 1, background: "rgba(0,0,0,0.8)", color: "#fff", border: "none", borderRadius: "50%", width: 16, height: 16, fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  </div>
                ))}
                <div style={{ width: 44, height: 78, borderRadius: 5, border: "1px dashed #444", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 18 }}>+</div>
              </div>}
        </div>

        <label style={s.lbl}>Tipo de sequência</label>
        {SEQ_TYPES.map(t => (
          <div key={t.id} style={s.card(type === t.id)} onClick={() => setType(t.id)}>
            <div style={{ fontWeight: 700, fontSize: 14, color: type === t.id ? ACCENT : "#fff" }}>{t.label}</div>
            <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>{t.desc}</div>
          </div>
        ))}

        <label style={{ ...s.lbl, marginTop: 16 }}>Tamanho</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {SIZES.map(sz => <div key={sz.id} style={s.szBtn(size === sz.id)} onClick={() => setSize(sz.id)}>{sz.label}</div>)}
        </div>

        <label style={s.lbl}>Tema</label>
        <input style={s.inp} placeholder="Ex: A história da Omega e a corrida espacial..." value={theme} onChange={e => setTheme(e.target.value)} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16, marginTop: 4 }}>
          {THEME_IDEAS.slice(0, 8).map((t, i) => <span key={i} style={s.chip} onClick={() => setTheme(t)}>{t}</span>)}
        </div>

        <label style={s.lbl}>Instruções extras (opcional)</label>
        <textarea style={s.ta} placeholder="Algo específico..." value={extra} onChange={e => setExtra(e.target.value)} />

        <button style={{ ...s.btn(true), opacity: theme.trim() ? 1 : 0.4 }} onClick={handleGenerate} disabled={!theme.trim()}>Gerar Prompt →</button>
      </div>
    </div>
  );

  // ═══ STEP 2 ═══
  if (step === 2) return (
    <div style={s.app}><Header />
      <div style={s.wrap}>
        <h1 style={s.h1}>Prompt Gerado ✓</h1>
        <p style={s.sub}>Copie e cole no Claude. Depois cole a resposta JSON no próximo passo.</p>
        <div style={s.promptBox}>{prompt}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button style={s.btn(true)} onClick={handleCopy}>{copied ? "✓ Copiado!" : "📋 Copiar Prompt"}</button>
          <button style={s.btn(false)} onClick={() => setStep(3)}>Colar Resposta →</button>
          <button style={{ ...s.btn(false), marginLeft: "auto" }} onClick={() => setStep(1)}>← Voltar</button>
        </div>
        <div style={{ ...s.card(false), marginTop: 16, borderColor: "#2a2a2a" }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: ACCENT, fontSize: 13 }}>Como usar:</div>
          <div style={{ fontSize: 12, color: "#999", lineHeight: 1.8 }}>
            1. Copie o prompt acima<br/>2. Cole em conversa com Claude (nova ou esta mesma)<br/>3. Copie a resposta JSON inteira<br/>4. Cole no próximo passo
          </div>
        </div>
      </div>
    </div>
  );

  // ═══ STEP 3 ═══
  if (step === 3) return (
    <div style={s.app}><Header />
      <div style={s.wrap}>
        <h1 style={s.h1}>Colar Resposta</h1>
        <p style={s.sub}>Cole o JSON que o Claude gerou (pode incluir backticks, o sistema limpa).</p>
        {parseError && <div style={s.err}>{parseError}</div>}
        <textarea style={{ ...s.ta, minHeight: 250, fontFamily: "monospace", fontSize: 11 }}
          placeholder="Cole aqui o JSON..." value={jsonInput} onChange={e => setJsonInput(e.target.value)} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...s.btn(true), opacity: jsonInput.trim() ? 1 : 0.4 }} onClick={handleParse} disabled={!jsonInput.trim()}>Gerar Imagens →</button>
          <button style={s.btn(false)} onClick={() => setStep(2)}>← Voltar</button>
        </div>
      </div>
    </div>
  );

  // ═══ STEP 4 ═══
  if (step === 4 && stories) {
    const cur = stories.stories[selectedStory];
    return (
      <div style={s.app}><Header />
        <div style={{ ...s.wrap, maxWidth: 1100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div>
              <h1 style={{ ...s.h1, marginBottom: 2 }}>{stories.title}</h1>
              <p style={{ color: "#777", fontSize: 12, margin: 0 }}>{stories.stories.length} stories • {stories.devices_summary}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={s.btn(true)} onClick={downloadAll} disabled={rendering}>{rendering ? "Renderizando..." : "⬇ Baixar Todos"}</button>
              <button style={s.btn(false)} onClick={() => { setStories(null); setJsonInput(""); setRenderedUrls([]); setStep(1); }}>Nova Sequência</button>
            </div>
          </div>

          <div style={s.grid}>
            {stories.stories.map((st, i) => (
              <div key={i} style={s.thumb(i === selectedStory)} onClick={() => setSelectedStory(i)}>
                {renderedUrls[i] ? <img src={renderedUrls[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#444", fontWeight: 800 }}>{st.number}</div>}
                <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", borderRadius: 3, padding: "1px 5px", fontSize: 9, color: "#fff", fontWeight: 700 }}>{st.number}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
            <div>
              <canvas ref={canvasRef} style={{ width: "100%", borderRadius: 10, border: "1px solid #222" }} />
              <button style={{ ...s.btn(true), width: "100%", marginTop: 6, justifyContent: "center", fontSize: 13 }} onClick={() => downloadOne(selectedStory)}>⬇ Baixar Story {selectedStory + 1}</button>
            </div>

            {cur && <div>
              <div style={{ ...s.card(false), borderColor: "#2a2a2a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ background: ACCENT, color: "#0a0a0a", fontWeight: 800, borderRadius: 6, padding: "3px 10px", fontSize: 13 }}>Story {cur.number}</span>
                  <span style={{ background: cur.cta_type === "external_link" ? "#1a3a1a" : "#1e1e1e", color: cur.cta_type === "external_link" ? "#6bff6b" : "#888", padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>
                    {cur.cta_type === "external_link" ? "🔗 Link Externo" : "💬 Interação"}
                  </span>
                </div>

                <label style={s.lbl}>Texto</label>
                <p style={{ color: "#ddd", fontSize: 13, lineHeight: 1.7, background: "#0d0d0d", padding: 10, borderRadius: 6, marginBottom: 12 }}>{cur.text}</p>

                <label style={s.lbl}>Destaques</label>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                  {(cur.highlighted_words || []).map((w, i) => <span key={i} style={{ background: "rgba(212,168,83,0.12)", color: ACCENT, padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{w}</span>)}
                </div>

                <label style={s.lbl}>Dispositivos</label>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                  {(cur.device_names || []).map((d, i) => <span key={i} style={{ background: "#1a1a2e", color: "#8888ff", padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>#{cur.devices_used?.[i]} {d}</span>)}
                </div>

                <label style={s.lbl}>CTA</label>
                <p style={{ color: "#aaa", fontSize: 12, margin: 0 }}>{cur.cta_text}</p>

                {cur.has_poll && <>
                  <label style={{ ...s.lbl, marginTop: 12 }}>Enquete</label>
                  <p style={{ color: "#aaa", fontSize: 12, margin: 0 }}>{cur.poll_question} → <span style={{ color: ACCENT }}>{cur.poll_options?.join(" | ")}</span></p>
                </>}
              </div>

              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button style={{ ...s.btn(false), flex: 1, justifyContent: "center", fontSize: 12 }} onClick={() => setSelectedStory(Math.max(0, selectedStory - 1))} disabled={selectedStory === 0}>← Anterior</button>
                <button style={{ ...s.btn(false), flex: 1, justifyContent: "center", fontSize: 12 }} onClick={() => setSelectedStory(Math.min(stories.stories.length - 1, selectedStory + 1))} disabled={selectedStory === stories.stories.length - 1}>Próximo →</button>
              </div>
            </div>}
          </div>
        </div>
      </div>
    );
  }
  return null;
}
