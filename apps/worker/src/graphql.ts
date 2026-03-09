import { graphql } from 'graphql';
import { verifyClerkToken } from './auth';
import { type WorkerEnv } from './db/client';
import { createRootResolvers } from './graphqlResolvers';
import { appSchema } from './graphqlSchema';

type GraphQLVariables = Record<string, unknown>;
type Payload = { query: string; variables?: GraphQLVariables; operationName?: string };

const jsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const getViewerFromRequest = async (
  request: Request,
  env: WorkerEnv,
): Promise<{ viewer: Awaited<ReturnType<typeof verifyClerkToken>> | null; authError: string | null }> => {
  const requestHost = new URL(request.url).hostname;
  const isTestHost = requestHost === 'example.com';
  const allowDevHeaders = env.ENABLE_DEV_AUTH_HEADERS === '1';
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    if (isTestHost || allowDevHeaders) {
      const email = request.headers.get('x-dev-user-email')?.trim().toLowerCase();
      if (email) {
        return {
          viewer: {
            clerkUserId: request.headers.get('x-dev-user-id')?.trim() || `dev-${email}`,
            email,
            fullName: request.headers.get('x-dev-user-name')?.trim() || email.split('@')[0],
          },
          authError: null,
        };
      }
    }
    if (!env.CLERK_ISSUER || !env.CLERK_JWKS_URL) {
      return { viewer: null, authError: 'Clerk is not configured. Set CLERK_ISSUER and CLERK_JWKS_URL.' };
    }
    return { viewer: null, authError: null };
  }
  try {
    return { viewer: await verifyClerkToken(token, env), authError: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid auth token';
    return { viewer: null, authError: message };
  }
};

const extractRequestPayload = async (request: Request): Promise<Payload> => {
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    if (!query) throw new Error('Missing GraphQL query in query string');
    return {
      query,
      variables: url.searchParams.get('variables')
        ? (JSON.parse(url.searchParams.get('variables') || '{}') as GraphQLVariables)
        : undefined,
      operationName: url.searchParams.get('operationName') ?? undefined,
    };
  }
  if (request.method !== 'POST') throw new Error('Only GET and POST are supported for /graphql');
  const body = (await request.json()) as Payload;
  if (!body.query) throw new Error('Missing GraphQL query in request body');
  return body;
};

export const handleGraphQLRequest = async (request: Request, env: WorkerEnv): Promise<Response> => {
  try {
    const payload = await extractRequestPayload(request);
    const { viewer, authError } = await getViewerFromRequest(request, env);
    if (authError) {
      return jsonResponse({ errors: [{ message: `Authentication failed: ${authError}` }] }, 401);
    }
    const result = await graphql({
      schema: appSchema,
      source: payload.query,
      rootValue: createRootResolvers(env, viewer),
      variableValues: payload.variables,
      operationName: payload.operationName,
    });
    return jsonResponse(result, result.errors?.length ? 400 : 200);
  } catch (error) {
    return jsonResponse({ errors: [{ message: error instanceof Error ? error.message : 'Unexpected error' }] }, 400);
  }
};
