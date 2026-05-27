'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { useState, type ReactNode, type JSX } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CodeBlock({ className, children }: { className?: string; children: ReactNode }) {
  const { theme } = useTheme();
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');

  if (match) {
    return (
      <SyntaxHighlighter
        style={(theme === 'dark' ? oneDark : oneLight) as Record<string, React.CSSProperties>}
        language={match[1]}
        PreTag="div"
      >
        {codeString}
      </SyntaxHighlighter>
    );
  }

  return (
    <code className={className}>
      {children}
    </code>
  );
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <>
      <div className={`prose dark:prose-invert max-w-none ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            pre({ children }) {
              // Extract code element from pre to handle syntax highlighting
              const codeChild = Array.isArray(children) ? children[0] : children;
              if (
                codeChild &&
                typeof codeChild === 'object' &&
                'props' in codeChild
              ) {
                const codeElement = codeChild as JSX.Element;
                const codeClassName = codeElement.props?.className as string | undefined;
                const codeContent = codeElement.props?.children as ReactNode;
                if (codeContent !== undefined) {
                  return <CodeBlock className={codeClassName}>{codeContent}</CodeBlock>;
                }
              }
              return <pre>{children}</pre>;
            },
            code({ className, children, ...props }) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            img({ src, alt, ...props }) {
              const srcStr = typeof src === 'string' ? src : undefined;
              return (
                <img
                  src={src}
                  alt={alt}
                  loading="lazy"
                  className="cursor-pointer hover:opacity-80 transition-opacity rounded-lg"
                  onClick={() => srcStr && setLightboxSrc(srcStr)}
                  {...props}
                />
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
