import { z } from 'zod';

export const startSessionSchema = z.object({
  workoutId: z.string().uuid().optional(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
