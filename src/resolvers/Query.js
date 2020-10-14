import getUserId from "../utils/getUserId";

const QueryResolvers = {
  Query: {
    greet(parent, args, ctx, info) {
      //   console.log(args.query); //! logging the user input
      if (args.query == null) {
        return "hello world !!";
      } else {
        return `hello ${args.query} !`;
      }
    },

    async users(parent, args, { prisma }) {
      const limit = {};

      if (args.limit) {
        for (const prop in args.limit) {
          limit[prop] = { equals: args.limit[prop], mode: "insensitive" };
        }
      }

      const where = args.filter
        ? {
            name: { contains: args.filter, mode: "insensitive" },
            ...limit,
          }
        : { ...limit };

      const opArgs = {
        where,
        take: args.take,
        ...(args.cursor ? { skip: 1, cursor: { id: args.cursor } } : {}),
        orderBy: args.orderBy,
      };

      const users = await prisma.user.findMany({
        ...opArgs,
      });

      return users;
    },

    async me(parent, args, { prisma, request }) {
      const userId = await getUserId(request);

      const user = await prisma.user.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    },
  },
};

export default QueryResolvers;
