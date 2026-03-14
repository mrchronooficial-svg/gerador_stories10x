"use client";

import { trpcClient } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

interface SequenceItem {
  id: string;
  title: string;
  type: string;
  theme: string;
  size: string;
  storiesJson: unknown;
  createdAt: string;
}

interface Props {
  onLoad: (data: {
    type: string;
    theme: string;
    size: string;
    storiesJson: unknown;
  }) => void;
}

export default function SequenceHistory({ onLoad }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["stories", "listSequences"],
    queryFn: async (): Promise<{ sequences: SequenceItem[]; nextCursor?: string }> => {
      const result = await trpcClient.stories.listSequences.query({ limit: 20 });
      return result as unknown as { sequences: SequenceItem[]; nextCursor?: string };
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar esta sequencia?")) return;
    await trpcClient.stories.deleteSequence.mutate({ id });
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="text-[#555] text-sm p-4 text-center">Carregando...</div>
    );
  }

  if (!data?.sequences?.length) {
    return (
      <div className="text-[#555] text-sm p-4 text-center">
        Nenhuma sequencia salva ainda.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-[#888] mb-2">Sequencias Salvas</h3>
      {data.sequences.map((seq: SequenceItem) => (
        <div
          key={seq.id}
          className="bg-[#141414] border border-[#222] rounded-lg p-3 flex items-center justify-between gap-3"
        >
          <div
            className="flex-1 cursor-pointer"
            onClick={() =>
              onLoad({
                type: seq.type,
                theme: seq.theme,
                size: seq.size,
                storiesJson: seq.storiesJson,
              })
            }
          >
            <div className="font-bold text-sm text-white">{seq.title}</div>
            <div className="text-[11px] text-[#666] mt-0.5">
              {seq.type} &bull; {seq.theme} &bull;{" "}
              {new Date(seq.createdAt).toLocaleDateString("pt-BR")}
            </div>
          </div>
          <button
            className="text-[#555] hover:text-[#ff6b6b] text-xs transition px-2 py-1"
            onClick={() => handleDelete(seq.id)}
          >
            Deletar
          </button>
        </div>
      ))}
    </div>
  );
}
