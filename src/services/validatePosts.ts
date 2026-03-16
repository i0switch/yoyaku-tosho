import { z } from 'zod';
import { InputPost } from '../domain/types';

const InputPostSchema = z.object({
  text: z
    .string()
    .refine((s) => s.trim().length > 0, { message: 'Post content must not be empty' })
    .refine((s) => s.length <= 5000, { message: 'Post is too long (max 5000 characters)' }),
  mediaPaths: z.array(z.string()).optional(),
  scheduledAt: z.string().optional(),
});

export function validatePosts(posts: InputPost[]): string[] {
  const errors: string[] = [];

  if (posts.length === 0) {
    errors.push('No posts found in the input file.');
    return errors;
  }

  posts.forEach((post, index) => {
    const result = InputPostSchema.safeParse(post);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        errors.push(`Post at index ${index}: ${issue.message}`);
      });
    }
  });

  return errors;
}
