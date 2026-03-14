"use client";

import type { StoryData } from "@/lib/story-canvas-renderer";

const ACCENT = "#D4A853";

interface Props {
  story: StoryData;
}

export default function StoryInfoPanel({ story }: Props) {
  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-[10px] p-3">
      {/* Header badges */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span
          className="font-extrabold rounded-md px-2.5 py-0.5 text-[13px]"
          style={{ background: ACCENT, color: "#0a0a0a" }}
        >
          Story {story.number}
        </span>
        <span
          className={`px-2 py-0.5 rounded-[5px] text-[11px] font-semibold ${
            story.cta_type === "external_link"
              ? "bg-[#1a3a1a] text-[#6bff6b]"
              : "bg-[#1e1e1e] text-[#888]"
          }`}
        >
          {story.cta_type === "external_link"
            ? "Link Externo"
            : "Interacao"}
        </span>
      </div>

      {/* Text */}
      <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1 block">
        Texto
      </label>
      <p className="text-[#ddd] text-[13px] leading-7 bg-[#0d0d0d] p-2.5 rounded-md mb-3">
        {story.text}
      </p>

      {/* Highlighted words */}
      <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1 block">
        Destaques
      </label>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {(story.highlighted_words || []).map((w, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded-[5px] text-[11px] font-bold"
            style={{
              background: "rgba(212,168,83,0.12)",
              color: ACCENT,
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {/* Devices */}
      <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1 block">
        Dispositivos
      </label>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {(story.device_names || []).map((d, i) => (
          <span
            key={i}
            className="bg-[#1a1a2e] text-[#8888ff] px-2 py-0.5 rounded-[5px] text-[11px] font-semibold"
          >
            #{story.devices_used?.[i]} {d}
          </span>
        ))}
      </div>

      {/* CTA */}
      <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1 block">
        CTA
      </label>
      <p className="text-[#aaa] text-xs m-0">{story.cta_text}</p>

      {/* Poll */}
      {story.has_poll && (
        <>
          <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest mb-1 mt-3 block">
            Enquete
          </label>
          <p className="text-[#aaa] text-xs m-0">
            {story.poll_question} →{" "}
            <span style={{ color: ACCENT }}>
              {story.poll_options?.join(" | ")}
            </span>
          </p>
        </>
      )}
    </div>
  );
}
