import { type WorkerEnv } from './db/client';
import { handleGraphQLRequest } from './graphql';

const textHeaders = {
  'content-type': 'text/plain; charset=utf-8',
};

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/graphql') {
      return handleGraphQLRequest(request, env);
    }

    return new Response('Order GraphQL API is ready at /graphql', {
      headers: textHeaders,
    });
  },
} satisfies ExportedHandler<WorkerEnv>;
