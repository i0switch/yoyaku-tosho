import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { loadPostsFromMarkdown } from './loadPosts';

async function withTempFile(content: string, fn: (filePath: string) => Promise<void>) {
  const filePath = path.join(os.tmpdir(), `load-posts-test-${Date.now()}.md`);
  await fs.writeFile(filePath, content, 'utf-8');
  try {
    await fn(filePath);
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }
}

describe('loadPostsFromMarkdown', () => {
  it('throws when file does not exist', async () => {
    await expect(loadPostsFromMarkdown('/nonexistent/file.md')).rejects.toThrow('Input file not found');
  });

  it('loads a single post', async () => {
    await withTempFile('Hello world', async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts).toHaveLength(1);
      expect(posts[0].text).toBe('Hello world');
    });
  });

  it('splits posts by ---', async () => {
    await withTempFile('Post 1\n---\nPost 2', async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts).toHaveLength(2);
      expect(posts[0].text).toBe('Post 1');
      expect(posts[1].text).toBe('Post 2');
    });
  });

  it('ignores empty blocks', async () => {
    await withTempFile('Post 1\n---\n\n---\nPost 2', async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts).toHaveLength(2);
    });
  });

  it('trims whitespace from posts', async () => {
    await withTempFile('  Hello  \n---\n  World  ', async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts[0].text).toBe('Hello');
      expect(posts[1].text).toBe('World');
    });
  });

  it('handles multiple separators', async () => {
    await withTempFile('A\n---\nB\n---\nC', async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts).toHaveLength(3);
    });
  });

  it('does not split on --- within text', async () => {
    await withTempFile('Line 1\n-- not a separator --\nLine 2', async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts).toHaveLength(1);
    });
  });
});
