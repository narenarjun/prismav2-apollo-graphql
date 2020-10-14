import { addResolversToSchema } from "@graphql-tools/schema";
import typedefmade from "./typedefs/typedef";
import Resolversmerged from "./resolvers";

const schemawithtypedefresolver = addResolversToSchema({
  schema: typedefmade,
  resolvers: Resolversmerged,
});

export default schemawithtypedefresolver;
