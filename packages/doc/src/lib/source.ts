import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';

// Create the source and filter draft pages in production
const rawSource = docs.toFumadocsSource();
const filteredSource = process.env.NODE_ENV === 'production'
  ? {
      ...rawSource,
      files: () => {
        const files = typeof rawSource.files === 'function'
          ? rawSource.files()
          : rawSource.files;
        return files.filter((file) => {
          const data = file.data as { draft?: boolean };
          return !data.draft;
        });
      },
    }
  : rawSource;

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: '/',
  source: filteredSource,
});
