"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface Props {
  title: string;
  markdown: string;
  codeSolution: string;
  revisionNotes: string;
}

export default function MarkdownPreview({ title, markdown, codeSolution, revisionNotes }: Props) {
  const content = `# ${title || "Untitled"}\n\n${markdown || "_No explanation yet_"}\n\n## Code Solution\n\`\`\`ts\n${
    codeSolution || "// Add your solution"
  }\n\`\`\`\n\n## Revision Notes\n${revisionNotes || "_No revision notes_"}\n`;

  return (
    <div className="p-4 prose prose-invert max-w-none overflow-y-auto h-full">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
