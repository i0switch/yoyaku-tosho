import fs from 'fs';
import { InputPost } from '../domain/types';

/**
 * Loads posts from a markdown file separated by '---'.
 */
export function loadPostsFromMarkdown(filePath: string): InputPost[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Split by '---' line.
  // We use a regex to ensure it only splits on lines that are exactly '---' (plus optional whitespace)
  const blocks = content.split(/^---$\s*/m);

  const posts: InputPost[] = blocks
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((text) => ({ text }));

  return posts;
}
