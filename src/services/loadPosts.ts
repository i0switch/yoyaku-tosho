import fs from 'fs/promises';
import { existsSync } from 'fs';
import { InputPost } from '../domain/types';

/**
 * Loads posts from a markdown file separated by '---'.
 */
export async function loadPostsFromMarkdown(filePath: string): Promise<InputPost[]> {
  if (!existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  const content = await fs.readFile(filePath, 'utf-8');

  // Split by '---' line.
  // We use a regex to ensure it only splits on lines that are exactly '---' (plus optional whitespace)
  const blocks = content.split(/^---$\s*/m);

  const posts: InputPost[] = blocks
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((text) => ({ text }));

  return posts;
}
