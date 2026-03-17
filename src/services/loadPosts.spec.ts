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

  // TC-LP-01: BOM付きファイル
  // [BUG-01] known failure: Node.js readFile(utf-8) は BOM を除去しないが trim() で BOM が除去される
  it('TC-LP-01: BOM付きUTF-8ファイルを読み込める', async () => {
    await withTempFile('\ufeffHello BOM', async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts).toHaveLength(1);
      expect(posts[0].text.replace('\ufeff', '')).toBe('Hello BOM');
    });
  });

  // TC-LP-02: CRLF改行で分割
  it('TC-LP-02: CRLF改行の --- で2件分割', async () => {
    await withTempFile('Post 1\r\n---\r\nPost 2', async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts).toHaveLength(2);
      expect(posts[0].text).toBe('Post 1');
      expect(posts[1].text).toBe('Post 2');
    });
  });

  // TC-LP-03: --- のみの内容 → 全ブロック空
  it('TC-LP-03: ---のみで構成されたファイル → 0件', async () => {
    await withTempFile('---\n---\n---', async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts).toHaveLength(0);
    });
  });

  // TC-LP-04: 先頭に --- がある場合
  it('TC-LP-04: 先頭区切り付きで2件', async () => {
    await withTempFile('---\nPost 1\n---\nPost 2', async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts).toHaveLength(2);
      expect(posts[0].text).toBe('Post 1');
      expect(posts[1].text).toBe('Post 2');
    });
  });

  // TC-LP-05: スペース付き --- は区切りにならない
  it('TC-LP-05: スペース付き --- は区切りにならない → 1件', async () => {
    await withTempFile('Post 1\n  ---  \nPost 2', async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts).toHaveLength(1);
    });
  });

  // TC-LP-06: readFile が EACCES でリジェクト → エラーがスロー
  it('TC-LP-06: readFile が EACCES → throw', async () => {
    const tmpPath = path.join(os.tmpdir(), `test-eacces-${Date.now()}.md`);
    await fs.writeFile(tmpPath, 'test content', 'utf-8');
    const eaccesError = Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });
    const spy = jest.spyOn(fs, 'readFile').mockRejectedValueOnce(eaccesError);
    try {
      await expect(loadPostsFromMarkdown(tmpPath)).rejects.toThrow();
    } finally {
      spy.mockRestore();
      await fs.unlink(tmpPath).catch(() => {});
    }
  });

  // TC-LP-07: 末尾に --- がある場合
  it('TC-LP-07: 末尾区切り付きで2件', async () => {
    await withTempFile('Post 1\n---\nPost 2\n---', async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts).toHaveLength(2);
      expect(posts[0].text).toBe('Post 1');
      expect(posts[1].text).toBe('Post 2');
    });
  });

  // TC-LP-08: 1000件ファイル
  it('TC-LP-08: 1000件ファイルを全件読み込める', async () => {
    const content = Array.from({ length: 1000 }, (_, i) => `Post ${i + 1}`).join('\n---\n');
    await withTempFile(content, async (fp) => {
      const posts = await loadPostsFromMarkdown(fp);
      expect(posts).toHaveLength(1000);
    });
  });
});
