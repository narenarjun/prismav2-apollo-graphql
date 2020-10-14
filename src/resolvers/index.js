const { mergeResolvers } = require("@graphql-tools/merge");

import Queryresolver from "./queryresolver";
import Mutation from "./Mutationresolver";
import User from "./user";

const resolvers = [Queryresolver, Mutation, User];

const Resolversmerged = mergeResolvers(resolvers);
// console.log(Resolversmerged);

export default Resolversmerged;
