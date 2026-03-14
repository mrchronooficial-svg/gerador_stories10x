import { protectedProcedure, publicProcedure, router } from "../index";
import { storiesRouter } from "./stories";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  stories: storiesRouter,
});
export type AppRouter = typeof appRouter;
