import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: '/',
  source: docs.toFumadocsSource({
    // Filter out draft pages in production
    filter: process.env.NODE_ENV === 'production'
      ? (page) => !page.data.draft
      : undefined,
  }),
});
