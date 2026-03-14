"use client";

import type { RefObject } from "react";
import { trpcClient } from "@/utils/trpc";
import type { StoryData } from "@/lib/story-canvas-renderer";
import { downloadStoryAsPNG } from "@/lib/story-canvas-renderer";
import StoryInfoPanel from "./StoryInfoPanel";

const ACCENT = "#D4A853";

interface Props {
  stories: {
    title: string;
    stories: StoryData[];
    devices_summary: string;
  };
  selectedStory: number;
  setSelectedStory: (n: number) => void;
  renderedUrls: string[];
  rendering: boolean;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  type: string;
  theme: string;
  size: string;
  extra: string;
  onDownloadAll: () => void;
  onNewSequence: () => void;
}

export default function StepPreview({
  stories,
  selectedStory,
  setSelectedStory,
  renderedUrls,
  rendering,
  canvasRef,
  type,
  theme,
  size,
  extra,
  onDownloadAll,
  onNewSequence,
}: Props) {
  const handleSave = async () => {
    try {
      await trpcClient.stories.saveSequence.mutate({
        title: stories.title,
        type,
        theme,
        size,
        extraPrompt: extra || undefined,
        storiesJson: stories,
        devicesSummary: stories.devices_summary,
      });
      alert("Sequencia salva com sucesso!");
    } catch (err) {
      alert("Erro ao salvar: " + (err as Error).message);
    }
  };

  const cur = stories.stories[selectedStory];

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-3.5 flex-wrap gap-2">
        <div>
          <h1 className="text-[22px] font-extrabold mb-0.5">
            {stories.title}
          </h1>
          <p className="text-[#777] text-xs m-0">
            {stories.stories.length} stories &bull; {stories.devices_summary}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2.5 rounded-lg font-bold text-sm transition"
            style={{ background: ACCENT, color: "#0A0A0A" }}
            onClick={onDownloadAll}
            disabled={rendering}
          >
            {rendering ? "Renderizando..." : "Baixar Todos"}
          </button>
          <button
            className="px-4 py-2.5 rounded-lg font-bold text-sm bg-[#1a3a1a] text-[#6bff6b] border-none cursor-pointer transition hover:bg-[#1a4a1a]"
            onClick={handleSave}
          >
            Salvar Sequencia
          </button>
          <button
            className="px-4 py-2.5 rounded-lg font-bold text-sm bg-[#1e1e1e] text-white border-none cursor-pointer transition hover:bg-[#2a2a2a]"
            onClick={onNewSequence}
          >
            Nova Sequencia
          </button>
        </div>
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(70px,1fr))] gap-1.5 mb-4">
        {stories.stories.map((st, i) => (
          <div
            key={i}
            className="cursor-pointer relative rounded-md overflow-hidden"
            style={{
              aspectRatio: "9/16",
              border:
                i === selectedStory
                  ? `2px solid ${ACCENT}`
                  : "2px solid #333",
              background: "#111",
            }}
            onClick={() => setSelectedStory(i)}
          >
            {renderedUrls[i] ? (
              <img
                src={renderedUrls[i]}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#444] font-extrabold">
                {st.number}
              </div>
            )}
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 bg-black/70 rounded px-1.5 py-px text-[9px] text-white font-bold">
              {st.number}
            </div>
          </div>
        ))}
      </div>

      {/* Canvas + Info panel */}
      <div className="grid grid-cols-[300px_1fr] gap-4 max-[768px]:grid-cols-1">
        <div>
          <canvas
            ref={canvasRef}
            className="w-full rounded-[10px] border border-[#222]"
          />
          <button
            className="w-full mt-1.5 px-4 py-2.5 rounded-lg font-bold text-[13px] flex items-center justify-center gap-1.5 transition"
            style={{ background: ACCENT, color: "#0A0A0A" }}
            onClick={() => {
              if (canvasRef.current)
                downloadStoryAsPNG(canvasRef.current, selectedStory + 1);
            }}
          >
            Baixar Story {selectedStory + 1}
          </button>
        </div>

        {cur && (
          <div>
            <StoryInfoPanel story={cur} />
            <div className="flex gap-1.5 mt-1.5">
              <button
                className="flex-1 px-4 py-2.5 rounded-lg font-bold text-xs bg-[#1e1e1e] text-white border-none cursor-pointer text-center transition hover:bg-[#2a2a2a] disabled:opacity-40"
                onClick={() => setSelectedStory(Math.max(0, selectedStory - 1))}
                disabled={selectedStory === 0}
              >
                ← Anterior
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-lg font-bold text-xs bg-[#1e1e1e] text-white border-none cursor-pointer text-center transition hover:bg-[#2a2a2a] disabled:opacity-40"
                onClick={() =>
                  setSelectedStory(
                    Math.min(stories.stories.length - 1, selectedStory + 1)
                  )
                }
                disabled={selectedStory === stories.stories.length - 1}
              >
                Proximo →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
