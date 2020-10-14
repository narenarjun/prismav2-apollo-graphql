import bcrypt from "bcryptjs";
import getUserId from "../utils/getUserId";
import generateToken from "../utils/generateToken";
import hashPassword from "../utils/hashpassword";

const MutationResolvers = {
  Mutation: {
    async createUser(parent, args, { prisma }, info) {
      // console.log(`User mutation INPUT- ${args.data.name}`);
      const password = await hashPassword(args.data.password);

      const user = await prisma.user.create({
        data: { ...args.data, password },
      });
      return {
        user,
        token: generateToken(user.id),
      };
    },
    async loginUser(parent, args, { prisma }, info) {
      const user = await prisma.user.findOne({
        where: {
          email: args.data.email,
        },
      });

      // console.log(`user value : ${JSON.stringify(user)}`);

      if (!user) {
        throw new Error("Unable to login");
      }

      const isMatch = await bcrypt.compare(args.data.password, user.password);

      if (!isMatch) {
        throw new Error("Unable to login");
      }

      return {
        user: user,
        token: generateToken(user.id),
      };
    },
    async deleteUser(parent, args, { prisma, request }) {
      const userId = await getUserId(request);

      const user = await prisma.user.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return prisma.user.delete({
        where: { id: userId },
        include: { posts: true, comments: true },
      });
    },
    async updateUser(parent, args, { prisma, request }) {
      const userId = await getUserId(request);

      const user = await prisma.user.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (typeof args.data.password === "string") {
        args.data.password = await hashPassword(args.data.password);
      }

      return prisma.user.update({
        where: { id: userId },
        data: args.data,
        include: { posts: true, comments: true },
      });
    },
  },
};

export default MutationResolvers;
