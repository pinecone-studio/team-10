import type { CodegenConfig } from "@graphql-codegen/cli";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const schemaUrl = process.env.GRAPHQL_SCHEMA_URL?.trim();
const configDir = dirname(fileURLToPath(import.meta.url));
const backendSchemaSnapshot = "../back-end/graphql/generated/schema.graphql";
const frontendSchemaSnapshot = "./graphql/schema.graphql";

const schema =
  schemaUrl ||
  (existsSync(resolve(configDir, backendSchemaSnapshot))
    ? backendSchemaSnapshot
    : frontendSchemaSnapshot);

const config: CodegenConfig = {
  schema,
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
