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
});
