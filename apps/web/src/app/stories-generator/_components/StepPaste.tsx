"use client";

import { useState } from "react";
import type { StoryData } from "@/lib/story-canvas-renderer";

const ACCENT = "#D4A853";

interface Props {
  onBack: () => void;
  onParsed: (data: {
    title: string;
    stories: StoryData[];
    devices_summary: string;
  }) => void;
}

export default function StepPaste({ onBack, onParsed }: Props) {
  const [jsonInput, setJsonInput] = useState("");
  const [parseError, setParseError] = useState("");

  const handleParse = () => {
    setParseError("");
    try {
      let cleaned = jsonInput
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "");
      const data = JSON.parse(cleaned);
      if (!data.stories || !Array.isArray(data.stories)) {
        throw new Error("JSON sem array 'stories'");
      }
      onParsed(data);
    } catch (err) {
      setParseError(
        `Erro: ${(err as Error).message}. Verifique se colou a resposta completa.`
      );
    }
  };

  return (
    <div className="max-w-[880px] mx-auto px-4 py-5">
      <h1 className="text-[22px] font-extrabold mb-1">Colar Resposta</h1>
      <p className="text-[#888] text-[13px] mb-6">
        Cole o JSON que o Claude gerou (pode incluir backticks, o sistema
        limpa).
      </p>

      {parseError && (
        <div className="bg-[#2a1010] border border-[#5a2020] rounded-lg p-3 text-[#ff6b6b] text-[13px] mb-3.5">
          {parseError}
        </div>
      )}

      <textarea
        className="w-full p-3.5 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white text-[11px] outline-none mb-4 min-h-[250px] resize-y font-mono"
        placeholder="Cole aqui o JSON..."
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />

      <div className="flex gap-2.5">
        <button
          className="px-6 py-3 rounded-lg font-bold text-sm inline-flex items-center gap-1.5 transition"
          style={{
            background: ACCENT,
            color: "#0A0A0A",
            opacity: jsonInput.trim() ? 1 : 0.4,
            cursor: jsonInput.trim() ? "pointer" : "not-allowed",
          }}
          onClick={handleParse}
          disabled={!jsonInput.trim()}
        >
          Gerar Imagens →
        </button>
        <button
          className="px-6 py-3 rounded-lg font-bold text-sm bg-[#1e1e1e] text-white border-none cursor-pointer transition hover:bg-[#2a2a2a]"
          onClick={onBack}
        >
          ← Voltar ao Prompt
        </button>
      </div>
    </div>
  );
}
