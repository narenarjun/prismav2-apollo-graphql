import getUserId from "../utils/getUserId";

const User = {
  User: {
    async email(parent, args, { prisma, request }) {
      const userId = await getUserId(request, false);

      if (userId && parent.id === userId) {
        return parent.email;
      } else {
        return null;
      }
    },
  },
};

export { User as default };
