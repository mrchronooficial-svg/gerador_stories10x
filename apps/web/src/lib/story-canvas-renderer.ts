const ACCENT = "#D4A853";
const W = 1080;
const H = 1920;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  hlWords: string[],
  x: number,
  y: number,
  maxW: number,
  fontSize: number
): number {
  ctx.font = `800 ${fontSize}px Montserrat, Arial Black, sans-serif`;
  ctx.textBaseline = "top";
  const words = text.split(" ");
  const lines: string[][] = [];
  let cur: string[] = [];
  for (const w of words) {
    const test = [...cur, w].join(" ");
    if (ctx.measureText(test).width > maxW && cur.length) {
      lines.push([...cur]);
      cur = [w];
    } else {
      cur.push(w);
    }
  }
  if (cur.length) lines.push(cur);

  const lh = fontSize * 1.4;
  const hlSet = new Set(
    (hlWords || []).map((w) =>
      w.toLowerCase().replace(/[.,!?;:()""'']/g, "")
    )
  );

  for (const lineWords of lines) {
    const lineStr = lineWords.join(" ");
    const lineW = ctx.measureText(lineStr).width;
    let cx = x + (maxW - lineW) / 2;
    for (const word of lineWords) {
      const clean = word
        .toLowerCase()
        .replace(/[.,!?;:()""'']/g, "");
      const isHL =
        hlSet.has(clean) ||
        [...hlSet].some((h) => clean.includes(h) || h.includes(clean));
      ctx.fillStyle = isHL ? ACCENT : "#FFFFFF";
      ctx.fillText(word, cx, y);
      cx += ctx.measureText(word + " ").width;
    }
    y += lh;
  }
  return y;
}

function drawPoll(
  ctx: CanvasRenderingContext2D,
  question: string,
  options: string[],
  y: number
): number {
  ctx.font = `700 36px Montserrat, Arial Black, sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(question, W / 2, y);
  ctx.textAlign = "left";
  y += 65;

  const btnW = 420;
  const btnH = 72;
  const gap = 24;
  const sx = (W - btnW * 2 - gap) / 2;

  for (let i = 0; i < 2 && options && i < options.length; i++) {
    const bx = sx + i * (btnW + gap);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    roundRect(ctx, bx, y, btnW, btnH, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    roundRect(ctx, bx, y, btnW, btnH, 14);
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `700 30px Montserrat, Arial Black, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(options[i]!, bx + btnW / 2, y + btnH / 2);
  }
  ctx.textAlign = "left";
  return y + btnH + 30;
}

export interface StoryData {
  number: number;
  text: string;
  highlighted_words: string[];
  devices_used: number[];
  device_names: string[];
  cta_type: "interaction" | "external_link";
  cta_text: string;
  has_poll: boolean;
  poll_question: string | null;
  poll_options: string[] | null;
}

export async function renderStory(
  canvas: HTMLCanvasElement,
  story: StoryData,
  backgroundImage: HTMLImageElement | null
): Promise<void> {
  const ctx = canvas.getContext("2d")!;
  canvas.width = W;
  canvas.height = H;

  if (backgroundImage) {
    const scale = Math.max(
      W / backgroundImage.width,
      H / backgroundImage.height
    );
    const sw = backgroundImage.width * scale;
    const sh = backgroundImage.height * scale;
    ctx.drawImage(backgroundImage, (W - sw) / 2, (H - sh) / 2, sw, sh);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1a1a2e");
    grad.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // Dark overlay
  ctx.fillStyle = "rgba(0,0,0,0.67)";
  ctx.fillRect(0, 0, W, H);

  // Story number badge
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, 40, 50, 90, 90, 20);
  ctx.fill();
  ctx.fillStyle = ACCENT;
  ctx.font = `800 38px Montserrat, Arial Black, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(story.number), 85, 95);
  ctx.textAlign = "left";

  // Main text
  const pad = 80;
  const maxW = W - pad * 2;
  const fontSize =
    story.text.length > 150 ? 44 : story.text.length > 100 ? 50 : 56;
  let textY = story.has_poll ? 350 : 480;
  let endY = drawTextBlock(
    ctx,
    story.text,
    story.highlighted_words,
    pad,
    textY,
    maxW,
    fontSize
  );

  // Poll
  if (story.has_poll && story.poll_question && story.poll_options) {
    endY = drawPoll(ctx, story.poll_question, story.poll_options, endY + 50);
  }

  // CTA button
  const ctaY = Math.max(endY + 60, H - 300);
  const isExt = story.cta_type === "external_link";
  ctx.font = `700 30px Montserrat, Arial Black, sans-serif`;
  const ctaText = story.cta_text || "";
  const btnW = Math.min(ctx.measureText(ctaText).width + 80, 900);
  const btnH = 68;
  const bx = (W - btnW) / 2;
  ctx.fillStyle = isExt ? ACCENT : "rgba(255,255,255,0.1)";
  roundRect(ctx, bx, ctaY, btnW, btnH, 34);
  ctx.fill();
  ctx.fillStyle = isExt ? "#0A0A0A" : "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ctaText, W / 2, ctaY + btnH / 2);
  ctx.textAlign = "left";

  // Device tags
  if (story.device_names?.length) {
    ctx.font = `500 22px Montserrat, Arial, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.textAlign = "center";
    ctx.fillText(
      story.device_names.map((d) => `#${d}`).join("  "),
      W / 2,
      H - 60
    );
    ctx.textAlign = "left";
  }
}

export function downloadStoryAsPNG(
  canvas: HTMLCanvasElement,
  storyNumber: number
): void {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `story_${storyNumber}.png`;
  link.click();
}

export async function renderAndDownloadAll(
  stories: StoryData[],
  bgImages: HTMLImageElement[]
): Promise<string[]> {
  const canvas = document.createElement("canvas");
  await document.fonts.ready;
  const urls: string[] = [];
  for (let i = 0; i < stories.length; i++) {
    const bg = bgImages.length > 0 ? bgImages[i % bgImages.length]! : null;
    await renderStory(canvas, stories[i]!, bg);
    urls.push(canvas.toDataURL("image/png"));
  }
  return urls;
}

export function downloadAllStories(renderedUrls: string[]): void {
  renderedUrls.forEach((url, i) => {
    setTimeout(() => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `story_${i + 1}.png`;
      a.click();
    }, i * 300);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
