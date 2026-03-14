import { z } from "zod";
import { publicProcedure, router } from "../index";
import prisma from "@criator_stories/db";
import { buildPrompt } from "./stories-prompt-engine";

const DEFAULT_USER_ID = "anonymous";

export const storiesRouter = router({
  generatePrompt: publicProcedure
    .input(
      z.object({
        type: z.string(),
        theme: z.string(),
        size: z.string(),
        extra: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const prompt = buildPrompt(input.type, input.theme, input.size, input.extra);
      return { prompt };
    }),

  saveSequence: publicProcedure
    .input(
      z.object({
        title: z.string(),
        type: z.string(),
        theme: z.string(),
        size: z.string(),
        extraPrompt: z.string().optional(),
        storiesJson: z.any(),
        devicesSummary: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id ?? DEFAULT_USER_ID;
      const sequence = await prisma.storySequence.create({
        data: {
          title: input.title,
          type: input.type,
          theme: input.theme,
          size: input.size,
          extraPrompt: input.extraPrompt,
          storiesJson: input.storiesJson,
          devicesSummary: input.devicesSummary,
          userId,
        },
      });
      return { id: sequence.id };
    }),

  listSequences: publicProcedure
    .input(
      z.object({
        type: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id ?? DEFAULT_USER_ID;
      const sequences = await prisma.storySequence.findMany({
        where: {
          userId,
          ...(input.type ? { type: input.type } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (sequences.length > input.limit) {
        const next = sequences.pop()!;
        nextCursor = next.id;
      }

      return { sequences, nextCursor };
    }),

  getSequence: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const sequence = await prisma.storySequence.findFirst({
        where: { id: input.id },
      });
      if (!sequence) throw new Error("Sequence not found");
      return sequence;
    }),

  deleteSequence: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.storySequence.deleteMany({
        where: { id: input.id },
      });
      return { success: true };
    }),

  uploadBackground: publicProcedure
    .input(
      z.object({
        filename: z.string(),
        base64: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id ?? DEFAULT_USER_ID;
      const bg = await prisma.storyBackground.create({
        data: {
          filename: input.filename,
          url: input.base64,
          userId,
        },
      });
      return { id: bg.id, url: bg.url };
    }),

  listBackgrounds: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id ?? DEFAULT_USER_ID;
    return prisma.storyBackground.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }),

  deleteBackground: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.storyBackground.deleteMany({
        where: { id: input.id },
      });
      return { success: true };
    }),
});
