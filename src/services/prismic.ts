import * as prismic from '@prismicio/client';
// import Prismic from '@prismicio/client';
import { DefaultClient } from '@prismicio/client/types/client';
// import fetch from 'node-fetch';

export function getPrismicClient(req?: unknown): DefaultClient {
  const endpoint = prismic.getEndpoint(process.env.PRISMIC_API_ENDPOINT);
  const client = prismic.createClient(
    'https://spacetravelingi.prismic.io/api/v2',
    {
      accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    }
  );

  console.log(client);

  return client;
}
