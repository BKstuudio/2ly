import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';

type MdastNode = {
  type: string;
  lang?: string;
  value?: string;
  children?: MdastNode[];
};

function remarkMdxMermaid() {
  return function transform(tree: MdastNode): void {
    function visit(node: MdastNode, parent: MdastNode | null): void {
      if (node.type === 'code' && node.lang === 'mermaid' && parent && Array.isArray(parent.children)) {
        const chartValue = node.value ?? '';
        const replacement: MdastNode = {
          type: 'mdxJsxFlowElement',
          // minimal shape for MDX JSX element
          name: 'Mermaid',
          // minimal shape for MDX JSX attributes
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'chart',
              value: chartValue,
            },
          ],
          children: [],
        } as unknown as MdastNode;

        const index = parent.children.indexOf(node);
        if (index >= 0) parent.children.splice(index, 1, replacement);
        return;
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) visit(child, node);
      }
    }

    visit(tree, null);
  };
}

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections#define-docs
export const docs = defineDocs({
  docs: {
    schema: frontmatterSchema.extend({
      draft: z.boolean().optional().default(false),
    }),
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMdxMermaid],
  },
});
