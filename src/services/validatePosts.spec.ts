import { validatePosts } from './validatePosts';

describe('validatePosts', () => {
  it('returns error when posts array is empty', () => {
    const errors = validatePosts([]);
    expect(errors).toContain('No posts found in the input file.');
  });

  it('returns error for empty text', () => {
    const errors = validatePosts([{ text: '' }]);
    expect(errors.some((e) => e.includes('index 0'))).toBe(true);
  });

  it('returns error for whitespace-only text', () => {
    const errors = validatePosts([{ text: '   ' }]);
    expect(errors.some((e) => e.includes('index 0'))).toBe(true);
  });

  it('returns error for text exceeding 5000 chars', () => {
    const errors = validatePosts([{ text: 'a'.repeat(5001) }]);
    expect(errors.some((e) => e.includes('too long'))).toBe(true);
  });

  it('passes valid post', () => {
    const errors = validatePosts([{ text: 'Hello world' }]);
    expect(errors).toHaveLength(0);
  });

  it('passes post at exactly 5000 chars', () => {
    const errors = validatePosts([{ text: 'a'.repeat(5000) }]);
    expect(errors).toHaveLength(0);
  });

  it('collects errors across multiple posts', () => {
    const errors = validatePosts([{ text: 'Valid post' }, { text: '' }]);
    expect(errors.some((e) => e.includes('index 1'))).toBe(true);
    expect(errors).toHaveLength(1);
  });

  it('passes post with optional mediaPaths and scheduledAt', () => {
    const errors = validatePosts([
      { text: 'Post with media', mediaPaths: ['./img.png'], scheduledAt: '2026-04-01T10:00:00' },
    ]);
    expect(errors).toHaveLength(0);
  });

  it('validates all posts and returns all errors', () => {
    const errors = validatePosts([{ text: '' }, { text: '' }, { text: 'OK' }]);
    expect(errors).toHaveLength(2);
  });

  // TC-VP-01: 全角スペースのみ → エラー1件 (JS trim() は全角スペースU+3000を除去するため空文字扱い)
  it('TC-VP-01: 全角スペースのみのテキスト → エラー', () => {
    const errors = validatePosts([{ text: '　　' }]);
    expect(errors).toHaveLength(1);
  });

  // TC-VP-02: タブのみ → エラー1件
  it('TC-VP-02: タブ文字のみのテキスト → エラー', () => {
    const errors = validatePosts([{ text: '\t\t\t' }]);
    expect(errors).toHaveLength(1);
  });

  // TC-VP-03: mediaPaths が空配列 → エラーなし
  it('TC-VP-03: mediaPaths が空配列 → エラーなし', () => {
    const errors = validatePosts([{ text: 'Valid', mediaPaths: [] }]);
    expect(errors).toHaveLength(0);
  });

  // TC-VP-04: mediaPaths に数値が含まれる → エラー1件
  it('TC-VP-04: mediaPaths に数値型 → エラー', () => {
    const errors = validatePosts([{ text: 'Valid', mediaPaths: [123 as any] }]);
    expect(errors).toHaveLength(1);
  });

  // TC-VP-05: 絵文字5000文字 (length=5000) → エラーなし
  it('TC-VP-05: 絵文字 length=5000 → エラーなし', () => {
    const text = '😀'.repeat(2500); // '😀'.length === 2 → 2*2500 = 5000
    expect(text.length).toBe(5000);
    const errors = validatePosts([{ text }]);
    expect(errors).toHaveLength(0);
  });

  // TC-VP-06: 絵文字5001文字 → エラー1件
  it('TC-VP-06: 絵文字 length=5001 → エラー', () => {
    const text = '😀'.repeat(2500) + 'a'; // length=5001
    expect(text.length).toBe(5001);
    const errors = validatePosts([{ text }]);
    expect(errors.some((e) => e.includes('too long'))).toBe(true);
  });

  // TC-VP-07: 日本語5000文字 → エラーなし
  it('TC-VP-07: 日本語 length=5000 → エラーなし', () => {
    const text = 'あ'.repeat(5000);
    expect(text.length).toBe(5000);
    const errors = validatePosts([{ text }]);
    expect(errors).toHaveLength(0);
  });

  // TC-VP-08: null を post として渡す → エラー1件
  it('TC-VP-08: null を post に渡す → エラー', () => {
    const errors = validatePosts([null as any]);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  // TC-VP-09: scheduledAt が空文字 → optional なのでエラーなし
  it('TC-VP-09: scheduledAt が空文字 → エラーなし', () => {
    const errors = validatePosts([{ text: 'Valid', scheduledAt: '' }]);
    expect(errors).toHaveLength(0);
  });

  // TC-VP-10: mediaPaths に空文字 → string 型なのでエラーなし
  it('TC-VP-10: mediaPaths に空文字列 → エラーなし', () => {
    const errors = validatePosts([{ text: 'Valid', mediaPaths: [''] }]);
    expect(errors).toHaveLength(0);
  });
});
