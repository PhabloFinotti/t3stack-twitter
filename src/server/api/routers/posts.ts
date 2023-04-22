import { clerkClient } from "@clerk/nextjs/server";
import { type Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const addUserDataToPosts = async (posts: Post[]) => {
  
  const users = (await clerkClient.users.getUserList({
    userId: posts.map((post) => post.authorId),
    limit: 100,
  })).map(filterUserForClient)


  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId)

    if (!author || !author.username) 
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find author for post",
      })

    return {
      post, 
      author: {
        ...author,
        username: author.username
      }
    }
  })
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{createdAt: "desc"}]
    });

    return addUserDataToPosts(posts);

  }),

  getPostsByUserId: publicProcedure.input(z.object({userId: z.string()})).query(({ctx, input}) => {
    return ctx.prisma.post.findMany({
      where: {
        authorId: input.userId
      },
      take: 100,
      orderBy: [{createdAt: "desc"}]
    }).then(addUserDataToPosts)
  }),

  create: privateProcedure.input(z.object({
    content: z.string().emoji("Only emojis are allowed!").min(1).max(280)
  })).mutation(async ({ctx, input }) => {
    const authorId = ctx.userId

    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        content: input.content
      }
    })

    return post;
  })
});
