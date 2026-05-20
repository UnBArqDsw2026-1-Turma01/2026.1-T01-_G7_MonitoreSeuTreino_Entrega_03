import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { SubmitOnboardingPayload } from '../types/onboarding.types';
import {
  CONSISTENCY_OPTIONS,
  DEFAULT_ONBOARDING_VALUES,
  GOAL_OPTIONS,
  SEX_OPTIONS,
  TECHNIQUE_OPTIONS,
} from '../types/onboarding.types';

const schema = z.object({
  sex: z.enum(['MALE', 'FEMALE']),
  age: z.number().int().min(10).max(120),
  experienceMonths: z.number().int().min(0),
  weeklyFrequency: z.number().int().min(1).max(7),
  mainGoal: z.enum(['HYPERTROPHY', 'STRENGTH', 'ENDURANCE', 'WEIGHT_LOSS', 'FITNESS']),
  followedStructuredPlan: z.boolean(),
  techniqueLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  usesProgressiveLoad: z.boolean(),
  recentConsistency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  hasLimitation: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  defaultValues?: Partial<SubmitOnboardingPayload>;
  isSubmitting?: boolean;
  submitLabel?: string;
  error?: string;
  onSubmit: (values: SubmitOnboardingPayload) => void | Promise<void>;
};

type ChoiceGroupProps<T extends string> = {
  title: string;
  name: keyof FormValues;
  options: Array<{ value: T; label: string; description: string }>;
  selected: T;
  onSelect: (v: T) => void;
};

function ChoiceGroup<T extends string>({ title, options, selected, onSelect }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-[#8b7fa8] text-xs font-bold tracking-[0.2em] uppercase">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(opt.value)}
              className={[
                'rounded-2xl border p-4 text-left transition',
                active
                  ? 'border-[#ccff00] bg-[#ccff00]/10 text-white'
                  : 'border-[rgba(139,127,168,0.2)] bg-[#221d3d] text-[#8b7fa8] hover:border-[rgba(204,255,0,0.3)]',
              ].join(' ')}
            >
              <span className={['block text-sm font-bold', active ? 'text-[#ccff00]' : 'text-white'].join(' ')}>
                {opt.label}
              </span>
              <span className="mt-1 block text-xs leading-5">{opt.description}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function OnboardingForm({ defaultValues, isSubmitting = false, submitLabel = 'Concluir', error, onSubmit }: Props) {
  const { handleSubmit, register, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...DEFAULT_ONBOARDING_VALUES, ...defaultValues },
  });

  const sex = watch('sex');
  const goal = watch('mainGoal');
  const technique = watch('techniqueLevel');
  const consistency = watch('recentConsistency');
  const structuredPlan = watch('followedStructuredPlan');
  const progressiveLoad = watch('usesProgressiveLoad');
  const limitation = watch('hasLimitation');
  const frequency = watch('weeklyFrequency');

  const inputCls = 'w-full bg-[#221d3d] border border-[rgba(139,127,168,0.25)] rounded-xl px-4 py-3 text-white placeholder-[#4a4266] outline-none focus:border-[#ccff00] transition text-sm';
  const sectionCls = 'bg-[#1a1530] rounded-2xl p-6 border border-[rgba(139,127,168,0.15)] space-y-6';

  return (
    <form className="space-y-6" onSubmit={handleSubmit((v) => onSubmit(v))}>

      <div className={sectionCls}>
        <p className="text-[#ccff00] text-xs font-bold tracking-[0.25em] uppercase">Base do perfil</p>

        <ChoiceGroup
          title="Sexo biológico"
          name="sex"
          options={SEX_OPTIONS}
          selected={sex}
          onSelect={(v) => setValue('sex', v, { shouldValidate: true })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[#8b7fa8] text-xs font-bold tracking-[0.2em] uppercase">Idade</label>
            <input type="number" placeholder="25" className={inputCls} {...register('age', { valueAsNumber: true })} />
            {errors.age && <span className="text-red-400 text-xs">Entre 10 e 120 anos.</span>}
          </div>
          <div className="space-y-2">
            <label className="text-[#8b7fa8] text-xs font-bold tracking-[0.2em] uppercase">Meses de experiência</label>
            <input type="number" placeholder="12" className={inputCls} {...register('experienceMonths', { valueAsNumber: true })} />
            {errors.experienceMonths && <span className="text-red-400 text-xs">Valor inválido.</span>}
          </div>
        </div>
      </div>

      <div className={sectionCls}>
        <p className="text-[#ccff00] text-xs font-bold tracking-[0.25em] uppercase">Rotina</p>

        <div className="space-y-3">
          <label className="text-[#8b7fa8] text-xs font-bold tracking-[0.2em] uppercase">
            Frequência semanal
          </label>
          <input
            type="range" min={1} max={7} className="w-full accent-[#ccff00]"
            {...register('weeklyFrequency', { valueAsNumber: true })}
          />
          <div className="bg-[#221d3d] rounded-xl px-4 py-3 text-center">
            <span className="text-[#ccff00] font-black text-lg">{frequency}</span>
            <span className="text-[#8b7fa8] text-sm"> treinos por semana</span>
          </div>
          {errors.weeklyFrequency && <span className="text-red-400 text-xs">Entre 1 e 7.</span>}
        </div>

        <ChoiceGroup
          title="Objetivo principal"
          name="mainGoal"
          options={GOAL_OPTIONS}
          selected={goal}
          onSelect={(v) => setValue('mainGoal', v, { shouldValidate: true })}
        />
      </div>

      <div className={sectionCls}>
        <p className="text-[#ccff00] text-xs font-bold tracking-[0.25em] uppercase">Qualidade do treino</p>

        <ChoiceGroup
          title="Nível técnico"
          name="techniqueLevel"
          options={TECHNIQUE_OPTIONS}
          selected={technique}
          onSelect={(v) => setValue('techniqueLevel', v, { shouldValidate: true })}
        />

        <ChoiceGroup
          title="Consistência recente"
          name="recentConsistency"
          options={CONSISTENCY_OPTIONS}
          selected={consistency}
          onSelect={(v) => setValue('recentConsistency', v, { shouldValidate: true })}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          {([
            { field: 'followedStructuredPlan' as const, title: 'Planilha estruturada?', val: structuredPlan },
            { field: 'usesProgressiveLoad' as const, title: 'Progressão de carga?', val: progressiveLoad },
            { field: 'hasLimitation' as const, title: 'Limitação física?', val: limitation },
          ]).map(({ field, title, val }) => (
            <button
              key={field}
              type="button"
              onClick={() => setValue(field, !val, { shouldValidate: true })}
              className={[
                'rounded-2xl border p-4 text-left transition',
                val
                  ? 'border-[#ccff00] bg-[#ccff00]/10'
                  : 'border-[rgba(139,127,168,0.2)] bg-[#221d3d] hover:border-[rgba(204,255,0,0.3)]',
              ].join(' ')}
            >
              <span className="block text-xs font-bold text-white">{title}</span>
              <span className={['mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest', val ? 'bg-[#ccff00] text-[#0d0b1e]' : 'bg-[#0d0b1e] text-[#8b7fa8]'].join(' ')}>
                {val ? 'Sim' : 'Não'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[#ccff00] to-[#a8d400] text-[#0d0b1e] font-black text-sm uppercase tracking-[0.2em] py-4 rounded-2xl transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Salvando...' : submitLabel}
      </button>
    </form>
  );
}
