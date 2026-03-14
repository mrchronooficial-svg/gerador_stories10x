"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { trpcClient } from "@/utils/trpc";
import {
  renderStory,
  renderAndDownloadAll,
  downloadAllStories,
  loadImage,
  type StoryData,
} from "@/lib/story-canvas-renderer";
import StepConfig from "./StepConfig";
import StepPrompt from "./StepPrompt";
import StepPaste from "./StepPaste";
import StepPreview from "./StepPreview";

const ACCENT = "#D4A853";

export default function StoriesGenerator() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("aquecimento");
  const [theme, setTheme] = useState("");
  const [size, setSize] = useState("curta");
  const [extra, setExtra] = useState("");
  const [prompt, setPrompt] = useState("");
  const [stories, setStories] = useState<{
    title: string;
    stories: StoryData[];
    devices_summary: string;
  } | null>(null);
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [bgImages, setBgImages] = useState<HTMLImageElement[]>([]);
  const [selectedStory, setSelectedStory] = useState(0);
  const [renderedUrls, setRenderedUrls] = useState<string[]>([]);
  const [rendering, setRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load bg images when backgrounds change
  useEffect(() => {
    if (backgrounds.length === 0) {
      setBgImages([]);
      return;
    }
    Promise.all(backgrounds.map((b) => loadImage(b))).then(setBgImages);
  }, [backgrounds]);

  const handleGenerate = async () => {
    const result = await trpcClient.stories.generatePrompt.mutate({
      type,
      theme,
      size,
      extra: extra || undefined,
    });
    setPrompt(result.prompt);
    setStep(2);
  };

  const handleStoriesParsed = useCallback(
    async (data: {
      title: string;
      stories: StoryData[];
      devices_summary: string;
    }) => {
      setStories(data);
      setSelectedStory(0);
      setStep(4);
      // Render all stories
      setRendering(true);
      const urls = await renderAndDownloadAll(data.stories, bgImages);
      setRenderedUrls(urls);
      setRendering(false);
    },
    [bgImages]
  );

  // Re-render when bgImages change after stories are loaded
  useEffect(() => {
    if (stories && bgImages.length) {
      setRendering(true);
      renderAndDownloadAll(stories.stories, bgImages).then((urls) => {
        setRenderedUrls(urls);
        setRendering(false);
      });
    }
  }, [bgImages, stories]);

  // Render selected story on canvas
  useEffect(() => {
    if (!stories || !canvasRef.current) return;
    const s = stories.stories[selectedStory];
    if (!s) return;
    const bg =
      bgImages.length > 0
        ? bgImages[selectedStory % bgImages.length]!
        : null;
    document.fonts.ready.then(() => renderStory(canvasRef.current!, s, bg));
  }, [selectedStory, stories, bgImages]);

  const handleLoadSequence = (data: {
    type: string;
    theme: string;
    size: string;
    storiesJson: unknown;
  }) => {
    const json = data.storiesJson as {
      title: string;
      stories: StoryData[];
      devices_summary: string;
    };
    setType(data.type);
    setTheme(data.theme);
    setSize(data.size);
    handleStoriesParsed(json);
  };

  const handleNewSequence = () => {
    setStories(null);
    setRenderedUrls([]);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-[Montserrat,sans-serif]">
      {/* Header */}
      <div className="flex items-center px-5 py-4 border-b border-[#1a1a1a]">
        <span
          className="text-lg font-extrabold tracking-wider"
          style={{ color: ACCENT }}
        >
          MR. CHRONO
        </span>
        <span className="text-xs text-[#555] ml-3">Stories 10x Generator</span>
        <div className="flex gap-1 ml-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-2 rounded transition-all duration-300"
              style={{
                width: i === step ? 28 : 8,
                background: i === step ? ACCENT : "#333",
              }}
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      {step === 1 && (
        <StepConfig
          type={type}
          setType={setType}
          theme={theme}
          setTheme={setTheme}
          size={size}
          setSize={setSize}
          extra={extra}
          setExtra={setExtra}
          backgrounds={backgrounds}
          setBackgrounds={setBackgrounds}
          onGenerate={handleGenerate}
          onShowHistory={() => setShowHistory(!showHistory)}
          showHistory={showHistory}
          onLoadSequence={handleLoadSequence}
        />
      )}

      {step === 2 && (
        <StepPrompt
          prompt={prompt}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <StepPaste
          onBack={() => setStep(2)}
          onParsed={handleStoriesParsed}
        />
      )}

      {step === 4 && stories && (
        <StepPreview
          stories={stories}
          selectedStory={selectedStory}
          setSelectedStory={setSelectedStory}
          renderedUrls={renderedUrls}
          rendering={rendering}
          canvasRef={canvasRef}
          type={type}
          theme={theme}
          size={size}
          extra={extra}
          onDownloadAll={() => downloadAllStories(renderedUrls)}
          onNewSequence={handleNewSequence}
        />
      )}
    </div>
  );
}
