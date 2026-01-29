import ReactMarkdown, { type Components } from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  components?: Components;
}

const preprocessLaTeX = (content: string) => {
  if (!content) return content;

  // Replace block-level LaTeX environments that aren't wrapped in delimiters
  // We look for \begin{env}...\end{env} and wrap them in $$...$$
  const blockEnvRegex = /(\\begin\{(equation|equation\*|align|align\*|gather|gather\*|CD)\}[\s\S]*?\\end\{\2\})/g;

  return content.replace(blockEnvRegex, (match) => {
    // Check if it's already wrapped in $$ or $ (heuristic)
    // This is a simple check; a full parser would be better but overkill
    return `\n$$\n${match}\n$$\n`;
  });
};

export default function MarkdownRenderer({ content, className, components }: MarkdownRendererProps) {
  const processedContent = preprocessLaTeX(content);

  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={components}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
