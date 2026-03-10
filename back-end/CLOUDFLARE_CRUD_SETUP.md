# Cloudflare D1 + R2 CRUD Setup

This backend runs from `back-end/` as a Cloudflare Worker.

## Locations

- Worker source: `back-end/src/index.ts`
- D1 schema: `back-end/schema.sql`
- Cloudflare config: `back-end/wrangler.jsonc`
- Package scripts: `back-end/package.json`

## Where to run npm install

Run all package commands inside `back-end/`.

```bash
cd back-end
npm install
```

## Current Cloudflare resources

- D1 database: `team10-backend-db`
- D1 database id: `791d560f-40ef-4d79-b69e-9d2a9e09d866`
- R2 bucket: `team10-assets`

## Apply schema

Local:

```bash
cd back-end
npx wrangler d1 execute team10-backend-db --local --file schema.sql
```

Remote:

```bash
cd back-end
npx wrangler d1 execute team10-backend-db --remote --file schema.sql
```

## Validate and run

```bash
cd back-end
npm run lint
npm run typecheck:api
npm run build:api
```

```bash
cd back-end
npm run dev:api
```

## Deploy

```bash
cd back-end
npx wrangler deploy
```

## API endpoints

- `GET /health`
- `GET /api/assets`
- `POST /api/assets`
- `GET /api/assets/:id`
- `PUT /api/assets/:id`
- `DELETE /api/assets/:id`
- `GET /api/assets/:id/content`
- `GET /api/todos`
- `POST /api/todos`
- `GET /api/todos/:id`
- `PUT /api/todos/:id`
- `DELETE /api/todos/:id`
- `GET /api/todos/:id/image`
