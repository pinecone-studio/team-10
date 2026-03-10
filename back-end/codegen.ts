import type { CodegenConfig } from "@graphql-codegen/cli";
import { print } from "graphql";
import { typeDefs } from "./graphql/schema";

const config: CodegenConfig = {
  schema: print(typeDefs),
  generates: {
    "./graphql/generated/schema.graphql": {
      plugins: ["schema-ast"],
    },
    "./graphql/generated/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useTypeImports: true,
        contextType: "@/lib/context#GraphQLContext",
      },
    },
  },
};

export default config;
