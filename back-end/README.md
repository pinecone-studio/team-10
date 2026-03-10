# Back-End

This folder contains two runtimes:

- `app/`: the current Next.js scaffold
- `src/index.ts`: the Cloudflare Worker API for D1 + R2 CRUD

Available API modules:

- `assets`: generic file metadata + object storage CRUD
- `todos`: todo CRUD with optional image storage in R2

Cloudflare setup, schema, bindings, install path, and deploy commands are documented in `CLOUDFLARE_CRUD_SETUP.md`.

Run `npm install`, `wrangler dev`, and `wrangler deploy` only inside `back-end/`.
