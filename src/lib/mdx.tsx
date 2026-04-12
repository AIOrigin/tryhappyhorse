import ReactMarkdown from 'react-markdown';
import type { ReactElement } from 'react';

export async function renderMdx(source: string): Promise<ReactElement> {
  return <ReactMarkdown>{source}</ReactMarkdown>;
}
