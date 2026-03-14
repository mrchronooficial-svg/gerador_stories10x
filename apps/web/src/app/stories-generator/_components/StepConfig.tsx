"use client";

import { useRef } from "react";
import { THEME_SUGGESTIONS } from "@/lib/stories-theme-suggestions";
import SequenceHistory from "./SequenceHistory";
import type { StoryData } from "@/lib/story-canvas-renderer";

const ACCENT = "#D4A853";

const SEQ_TYPES = [
  {
    id: "aquecimento",
    label: "Aquecimento Pre-Drop",
    desc: "Aquecer audiencia durante o dia para o drop das 19:30",
  },
  {
    id: "engajamento",
    label: "Engajamento Puro",
    desc: "Conectar, gerar conversa, viciar nos stories",
  },
  {
    id: "consciencia",
    label: "Geracao de Consciencia",
    desc: "Educar sobre cultura relojoeira sem vender",
  },
  {
    id: "caixinha",
    label: "Caixinha por Tema",
    desc: "Gerar valor respondendo duvidas de relojoaria",
  },
  {
    id: "venda",
    label: "Venda de Produto Fisico",
    desc: "Sequencia focada em peca especifica",
  },
];

const SIZES = [
  { id: "curta", label: "Curta (~8 stories)" },
  { id: "completa", label: "Completa (~15 stories)" },
];

interface Props {
  type: string;
  setType: (v: string) => void;
  theme: string;
  setTheme: (v: string) => void;
  size: string;
  setSize: (v: string) => void;
  extra: string;
  setExtra: (v: string) => void;
  backgrounds: string[];
  setBackgrounds: (v: string[] | ((prev: string[]) => string[])) => void;
  onGenerate: () => void;
  onShowHistory: () => void;
  showHistory: boolean;
  onLoadSequence: (data: {
    type: string;
    theme: string;
    size: string;
    storiesJson: unknown;
  }) => void;
}

export default function StepConfig({
  type,
  setType,
  theme,
  setTheme,
  size,
  setSize,
  extra,
  setExtra,
  backgrounds,
  setBackgrounds,
  onGenerate,
  onShowHistory,
  showHistory,
  onLoadSequence,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleBgUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setBackgrounds((prev: string[]) => [...prev, result]);
      };
      reader.readAsDataURL(f);
    });
  };

  return (
    <div className="max-w-[880px] mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[22px] font-extrabold">Configurar Sequencia</h1>
        <button
          className="text-xs px-3 py-2 rounded-lg border border-[#2a2a2a] text-[#888] hover:text-white transition"
          onClick={onShowHistory}
        >
          Historico
        </button>
      </div>
      <p className="text-[#888] text-[13px] mb-6">
        Defina tipo, tema e tamanho. O sistema monta o prompt perfeito com toda
        a metodologia Stories 10x.
      </p>

      {showHistory && (
        <div className="mb-6">
          <SequenceHistory onLoad={onLoadSequence} />
        </div>
      )}

      {/* Background upload */}
      <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1.5 block">
        Fotos de fundo
      </label>
      <div
        className="border-2 border-dashed border-[#333] rounded-[10px] p-5 text-center cursor-pointer mb-4"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleBgUpload(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleBgUpload(e.target.files)}
        />
        {backgrounds.length === 0 ? (
          <p className="text-[#555] text-[13px] m-0">
            Clique ou arraste fotos de relogios
            <br />
            <span className="text-[11px]">
              Serao o fundo dos stories (com filtro escuro)
            </span>
          </p>
        ) : (
          <div className="flex gap-1.5 justify-center flex-wrap">
            {backgrounds.map((b, i) => (
              <div
                key={i}
                className="w-11 h-[78px] rounded-[5px] overflow-hidden relative"
              >
                <img
                  src={b}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setBackgrounds((p: string[]) =>
                      p.filter((_, j) => j !== i)
                    );
                  }}
                  className="absolute top-0.5 right-0.5 bg-black/80 text-white border-none rounded-full w-4 h-4 text-[9px] flex items-center justify-center cursor-pointer"
                >
                  x
                </button>
              </div>
            ))}
            <div className="w-11 h-[78px] rounded-[5px] border border-dashed border-[#444] flex items-center justify-center text-[#555] text-lg">
              +
            </div>
          </div>
        )}
      </div>

      {/* Sequence type */}
      <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1.5 block">
        Tipo de sequencia
      </label>
      {SEQ_TYPES.map((t) => (
        <div
          key={t.id}
          className={`rounded-[10px] p-3 mb-2 cursor-pointer transition-all border ${
            type === t.id
              ? "bg-[rgba(212,168,83,0.06)] border-[#D4A853]"
              : "bg-[#141414] border-[#222]"
          }`}
          onClick={() => setType(t.id)}
        >
          <div
            className="font-bold text-sm"
            style={{ color: type === t.id ? ACCENT : "#fff" }}
          >
            {t.label}
          </div>
          <div className="text-[11px] text-[#777] mt-0.5">{t.desc}</div>
        </div>
      ))}

      {/* Size */}
      <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1.5 mt-4 block">
        Tamanho
      </label>
      <div className="flex gap-2 mb-4">
        {SIZES.map((sz) => (
          <div
            key={sz.id}
            className={`flex-1 py-2.5 px-3.5 rounded-lg text-center font-bold text-[13px] cursor-pointer border transition ${
              size === sz.id
                ? "border-[#D4A853] bg-[rgba(212,168,83,0.08)]"
                : "border-[#2a2a2a] bg-[#141414]"
            }`}
            style={{ color: size === sz.id ? ACCENT : "#888" }}
            onClick={() => setSize(sz.id)}
          >
            {sz.label}
          </div>
        ))}
      </div>

      {/* Theme */}
      <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1.5 block">
        Tema
      </label>
      <input
        className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white text-sm outline-none mb-1.5"
        placeholder="Ex: A historia da Omega e a corrida espacial..."
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      />
      <div className="flex flex-wrap gap-1.5 mb-4 mt-1">
        {THEME_SUGGESTIONS.slice(0, 8).map((t, i) => (
          <span
            key={i}
            className="px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl text-[11px] text-[#aaa] cursor-pointer hover:text-white hover:border-[#444] transition"
            onClick={() => setTheme(t)}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Extra instructions */}
      <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1.5 block">
        Instrucoes extras (opcional)
      </label>
      <textarea
        className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white text-[13px] outline-none mb-4 min-h-[70px] resize-y"
        placeholder="Algo especifico..."
        value={extra}
        onChange={(e) => setExtra(e.target.value)}
      />

      <button
        className="px-6 py-3 rounded-lg font-bold text-sm transition-all inline-flex items-center gap-1.5"
        style={{
          background: ACCENT,
          color: "#0A0A0A",
          opacity: theme.trim() ? 1 : 0.4,
          cursor: theme.trim() ? "pointer" : "not-allowed",
        }}
        onClick={onGenerate}
        disabled={!theme.trim()}
      >
        Gerar Prompt →
      </button>
    </div>
  );
}
