import { z } from 'zod';

export const cloneRoutineSchema = z.object({
  routineId: z.string().uuid(),
  userId: z.string().uuid(),
  newName: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres').optional(),
});

export type CloneRoutineData = z.infer<typeof cloneRoutineSchema>;