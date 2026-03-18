This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

For this repo's local setup, run the backend on [http://localhost:3001](http://localhost:3001) so the front-end can stay on `3000` and proxy GraphQL requests correctly.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Local GraphQL Runtime Config

The GraphQL route uses Cloudflare D1 over HTTP in local `next dev`, so you need these environment variables in `back-end/.env.local`:

```bash
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_D1_DATABASE_ID=...
CLOUDFLARE_D1_API_TOKEN=...
```

`CLOUDFLARE_API_TOKEN` is also accepted as a fallback if you do not set `CLOUDFLARE_D1_API_TOKEN`.

Without those values, `/api/graphql` will now return a configuration error response instead of an opaque 500.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Cloudflare Workers

### 1) Configure runtime and D1 binding

Update [`wrangler.toml`](./wrangler.toml):

- Replace `database_id` with your real `CLOUDFLARE_D1_DATABASE_ID`.
- Replace `[vars]` placeholders with your real account/database IDs.

### 2) Add runtime secret (only if needed by this backend)

This backend uses a Cloudflare API token at runtime for D1 HTTP access in `lib/db.ts`.
Prefer a dedicated runtime secret such as `CLOUDFLARE_D1_API_TOKEN` so Wrangler deploy auth can use a separate token.

```bash
npx wrangler secret put CLOUDFLARE_D1_API_TOKEN
```

Backward compatibility:
- Runtime code still falls back to `CLOUDFLARE_API_TOKEN` if `CLOUDFLARE_D1_API_TOKEN` is not set.
- For local/CI deploys, `CLOUDFLARE_API_TOKEN` should be a token with Workers deploy permissions for the target account.

### 3) Deploy

```bash
npm run cf:build
npm run cf:deploy
```

For GitHub Actions deployment, add these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### 4) Smoke test after deploy

```bash
./scripts/smoke-graphql.sh https://<your-worker-url>
```

It runs:
- `GET /api/health` (service is up)
- `POST /api/graphql` with `orders` and `receives` queries (GraphQL path is working)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
