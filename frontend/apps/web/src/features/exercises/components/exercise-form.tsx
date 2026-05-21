import { useForm } from 'react-hook-form';
import type { CreateExercisePayload, UpdateExercisePayload } from '../types/exercises.types';

type Props = {
  defaultValues?: Partial<CreateExercisePayload> & { id?: string };
  isSubmitting?: boolean;
  submitLabel?: string;
  error?: string;
  onCancel: () => void;
  onSubmit: (values: CreateExercisePayload | UpdateExercisePayload) => void | Promise<void>;
};

export function ExerciseForm({ defaultValues, isSubmitting = false, submitLabel = 'CONFIRMAR', error, onCancel, onSubmit }: Props) {
  const { register, handleSubmit } = useForm({ defaultValues });

  const inputCls = 'w-full bg-transparent border-b border-[#2d244a] py-2 text-white placeholder-[#4a4266] outline-none tracking-wide focus:border-[#ccff00] transition text-sm';

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v as any))} className="space-y-6">
      <div className="space-y-1">
        <label className="text-[#00e5ff] text-[10px] font-bold tracking-widest uppercase block">Nome do exercício</label>
        <input {...register('name')} className={inputCls} placeholder="Ex: Supino Reto" />
      </div>

      <div className="space-y-1">
        <label className="text-[#00e5ff] text-[10px] font-bold tracking-widest uppercase block">Grupo muscular</label>
        <div className="relative">
          <input {...register('muscleGroup')} className={inputCls} placeholder="Ex: Peitoral" />
          <svg className="absolute right-2 top-3 pointer-events-none text-[#4a4266]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {error && <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-3"><p className="text-red-400 text-sm">{error}</p></div>}

      <div className="flex flex-col gap-3 pt-4">
        <button type="submit" disabled={isSubmitting} className="w-full bg-[#ccff00] text-[#0d0b1e] font-black text-sm uppercase tracking-widest py-3.5 rounded-lg transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed">
          {isSubmitting ? 'SALVANDO...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="w-full bg-transparent border border-[#2d244a] text-white font-black text-sm uppercase tracking-widest py-3.5 rounded-lg transition hover:bg-[#2d244a]">
          CANCELAR
        </button>
      </div>
    </form>
  );
}
