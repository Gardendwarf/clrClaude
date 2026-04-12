import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { CSSProperties } from 'react';

// Extend default sanitize schema to allow safe HTML elements
// used in the tutorial markdown (details, summary, kbd, etc.)
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'details', 'summary', 'kbd', 'mark', 'abbr',
  ],
};

interface MarkdownRendererProps {
  content: string;
  /** Base path for resolving relative URLs (e.g. "/content/01-slash-commands") */
  basePath?: string;
}

const containerStyle: CSSProperties = {
  maxWidth: 'var(--reading-max-width)',
  fontSize: '1rem',
  fontWeight: 300,
  lineHeight: 1.7,
  color: 'var(--text-primary)',
};

export function MarkdownRenderer({ content, basePath }: MarkdownRendererProps) {
  // Rewrite relative URLs so images and links resolve to /content/... paths
  const urlTransform = (url: string) => {
    // Skip absolute URLs, anchors, and data URIs
    if (!url || url.startsWith('http') || url.startsWith('#') || url.startsWith('data:') || url.startsWith('/')) {
      return url;
    }
    // Relative URL -- prepend the content base path
    if (basePath) {
      return `${basePath}/${url}`;
    }
    return url;
  };

  return (
    <div style={containerStyle} className="md-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeHighlight]}
        urlTransform={urlTransform}
      >
        {content}
      </ReactMarkdown>

      <style>{`
        .md-content h1 {
          font-size: 1.875rem;
          font-weight: 100;
          margin: var(--space-2xl) 0 var(--space-md);
          padding-bottom: var(--space-sm);
          border-bottom: 1px solid var(--border);
        }
        .md-content h1:first-child {
          margin-top: 0;
        }
        .md-content h2 {
          font-size: 1.5rem;
          font-weight: 300;
          margin: var(--space-xl) 0 var(--space-md);
          color: var(--text-primary);
        }
        .md-content h3 {
          font-size: 1.25rem;
          font-weight: 300;
          margin: var(--space-lg) 0 var(--space-sm);
        }
        .md-content p {
          margin: 0 0 var(--space-md);
        }
        .md-content ul, .md-content ol {
          margin: 0 0 var(--space-md);
          padding-left: var(--space-lg);
        }
        .md-content li {
          margin-bottom: var(--space-xs);
        }
        .md-content blockquote {
          border-left: 3px solid var(--azure);
          margin: 0 0 var(--space-md);
          padding: var(--space-sm) var(--space-md);
          background: var(--azure-tint);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
          color: var(--text-secondary);
          font-style: italic;
        }
        .md-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 0 var(--space-md);
          font-size: 0.9375rem;
        }
        .md-content th {
          text-align: left;
          padding: var(--space-sm) var(--space-md);
          border-bottom: 2px solid var(--border);
          font-weight: 500;
          color: var(--azure);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .md-content td {
          padding: var(--space-sm) var(--space-md);
          border-bottom: 1px solid var(--border);
        }
        .md-content tr:hover td {
          background: var(--azure-tint);
        }
        .md-content img {
          max-width: 100%;
          border-radius: var(--radius-sm);
          margin: var(--space-md) 0;
        }
        .md-content a {
          color: var(--azure);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .md-content a:hover {
          color: var(--coral);
        }
        .md-content hr {
          border: none;
          height: 1px;
          background: var(--border);
          margin: var(--space-xl) 0;
        }
        .md-content pre {
          margin: 0 0 var(--space-md);
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
        }

        /* Syntax highlighting overrides */
        .md-content .hljs {
          background: var(--surface-azure);
          color: var(--text-primary);
        }
        .md-content .hljs-keyword,
        .md-content .hljs-selector-tag {
          color: var(--coral);
          font-weight: 400;
        }
        .md-content .hljs-string,
        .md-content .hljs-attr {
          color: var(--success);
        }
        .md-content .hljs-comment {
          color: var(--text-tertiary);
          font-style: italic;
        }
        .md-content .hljs-function,
        .md-content .hljs-title {
          color: var(--azure);
        }
        .md-content .hljs-number {
          color: var(--warning);
        }
      `}</style>
    </div>
  );
}
