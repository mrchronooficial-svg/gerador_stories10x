"use client";

import { useState } from "react";

const ACCENT = "#D4A853";

interface Props {
  prompt: string;
  onBack: () => void;
  onNext: () => void;
}

export default function StepPrompt({ prompt, onBack, onNext }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const t = document.createElement("textarea");
      t.value = prompt;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-[880px] mx-auto px-4 py-5">
      <h1 className="text-[22px] font-extrabold mb-1">Prompt Gerado</h1>
      <p className="text-[#888] text-[13px] mb-6">
        Copie e cole no Claude. Depois cole a resposta JSON no proximo passo.
      </p>

      <div className="w-full min-h-[250px] p-3.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-[#bbb] text-xs leading-relaxed font-mono whitespace-pre-wrap overflow-auto max-h-[55vh]">
        {prompt}
      </div>

      <div className="flex gap-2.5 mt-3.5 flex-wrap">
        <button
          className="px-6 py-3 rounded-lg font-bold text-sm inline-flex items-center gap-1.5 transition"
          style={{ background: ACCENT, color: "#0A0A0A" }}
          onClick={handleCopy}
        >
          {copied ? "Copiado!" : "Copiar Prompt"}
        </button>
        <button
          className="px-6 py-3 rounded-lg font-bold text-sm bg-[#1e1e1e] text-white border-none cursor-pointer transition hover:bg-[#2a2a2a]"
          onClick={onNext}
        >
          Colar Resposta →
        </button>
        <button
          className="px-6 py-3 rounded-lg font-bold text-sm bg-[#1e1e1e] text-white border-none cursor-pointer ml-auto transition hover:bg-[#2a2a2a]"
          onClick={onBack}
        >
          ← Voltar
        </button>
      </div>

      <div className="bg-[#141414] border border-[#2a2a2a] rounded-[10px] p-3 mt-4">
        <div
          className="font-bold mb-1.5 text-[13px]"
          style={{ color: ACCENT }}
        >
          Como usar:
        </div>
        <div className="text-xs text-[#999] leading-7">
          1. Copie o prompt acima
          <br />
          2. Cole em conversa com Claude (nova ou esta mesma)
          <br />
          3. Copie a resposta JSON inteira
          <br />
          4. Cole no proximo passo
        </div>
      </div>
    </div>
  );
}
