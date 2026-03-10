import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:3000/api/graphql", // deploy hiisen link. For local development use localhost to generate types
  documents: ["app/**/*.{ts,tsx}", "app/**/*.graphql"],
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
