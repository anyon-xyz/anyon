import { CSGO_COLLECTION_PK_DEVNET, toPk } from "@anyon/common";
import { Metadata, metaplex } from "@anyon/metaplex";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.user.id,
      },
    });

    return user;
  }),
  getCsgoSkins: protectedProcedure.query(async ({ ctx }) => {
    const nfts = await metaplex().getAllNftsByUserPk(toPk(ctx.user.pubkey));

    // TODO: this does not sound good. Improve this
    const csgoMetadata = nfts.filter(
      (nft) =>
        nft.model === "metadata" &&
        !!nft.collection &&
        nft.collection.verified &&
        nft.collection.address.equals(toPk(CSGO_COLLECTION_PK_DEVNET))
    );

    const csgoNfts = nfts.filter(
      (nft) =>
        nft.model === "nft" &&
        !!nft.collection &&
        nft.collection.verified &&
        nft.collection.address.equals(toPk(CSGO_COLLECTION_PK_DEVNET))
    );

    const loadNfts = await Promise.all(
      csgoMetadata.map(
        async (metadata) =>
          await metaplex().getNftByMetadata(metadata as Metadata)
      )
    );

    return [...csgoNfts, ...loadNfts];
  }),
  updateTradeOfferUrl: protectedProcedure
    .input(z.object({ steamTradeUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          steamTradeUrl: input.steamTradeUrl,
        },
      });

      return user;
    }),
});
