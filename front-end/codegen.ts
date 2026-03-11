import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../back-end/graphql/generated/schema.graphql",
  documents: ["app/**/*.{ts,tsx}", "app/**/*.graphql"],
  ignoreNoDocuments: true,
  generates: {
    "./graphql/generated/": {
      preset: "client",
      config: {
        useTypeImports: true,
      },
    },
    "./graphql/generated/hooks.ts": {
      plugins: [
        { add: { content: "// @ts-nocheck" } },
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        useTypeImports: true,
        apolloReactHooksImportFrom: "@apollo/client/react",
        addSuspenseQueries: false,
      },
    },
  },
};

export default config;
