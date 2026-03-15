import { InputPost } from '../domain/types';

export function validatePosts(posts: InputPost[]): string[] {
  const errors: string[] = [];

  if (posts.length === 0) {
    errors.push('No posts found in the input file.');
    return errors;
  }

  posts.forEach((post, index) => {
    if (!post.text || post.text.trim().length === 0) {
      errors.push(`Post at index ${index} has empty content.`);
    }
    
    // X roughly allows up to 280 characters for legacy but we can be more flexible here
    // for MVP. Let's just flag dangerously long ones (e.g. > 10000 chars as likely errors)
    if (post.text.length > 5000) {
       errors.push(`Post at index ${index} is too long (${post.text.length} characters).`);
    }
  });

  return errors;
}
