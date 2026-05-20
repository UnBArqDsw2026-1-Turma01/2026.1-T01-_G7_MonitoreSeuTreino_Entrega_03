export type Sex = 'MALE' | 'FEMALE';
export type TrainingGoal = 'HYPERTROPHY' | 'STRENGTH' | 'ENDURANCE' | 'WEIGHT_LOSS' | 'FITNESS';
export type TechniqueLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ConsistencyLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type TrainingLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface SubmitOnboardingPayload {
  sex: Sex;
  age: number;
  experienceMonths: number;
  weeklyFrequency: number;
  mainGoal: TrainingGoal;
  followedStructuredPlan: boolean;
  techniqueLevel: TechniqueLevel;
  usesProgressiveLoad: boolean;
  recentConsistency: ConsistencyLevel;
  hasLimitation: boolean;
}

export interface OnboardingProfile extends SubmitOnboardingPayload {
  id: string;
  userId: string;
  classification: TrainingLevel;
  score: number;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingStatusResponse {
  completed: boolean;
  profile: OnboardingProfile | null;
}

export interface OnboardingRouteState {
  profile?: OnboardingProfile;
}

export type LabeledOption<T extends string> = {
  value: T;
  label: string;
  description: string;
};

export const DEFAULT_ONBOARDING_VALUES: SubmitOnboardingPayload = {
  sex: 'MALE',
  age: 24,
  experienceMonths: 0,
  weeklyFrequency: 3,
  mainGoal: 'HYPERTROPHY',
  followedStructuredPlan: false,
  techniqueLevel: 'LOW',
  usesProgressiveLoad: false,
  recentConsistency: 'MEDIUM',
  hasLimitation: false,
};

export const SEX_OPTIONS: LabeledOption<Sex>[] = [
  { value: 'MALE', label: 'Masculino', description: 'Usado pelo backend no cálculo do perfil.' },
  { value: 'FEMALE', label: 'Feminino', description: 'Mantém o payload compatível com a API atual.' },
];

export const GOAL_OPTIONS: LabeledOption<TrainingGoal>[] = [
  { value: 'HYPERTROPHY', label: 'Hipertrofia', description: 'Foco em ganho de massa muscular.' },
  { value: 'STRENGTH', label: 'Força', description: 'Prioriza aumento de carga e performance.' },
  { value: 'ENDURANCE', label: 'Resistência', description: 'Melhora capacidade de sustentar esforço.' },
  { value: 'WEIGHT_LOSS', label: 'Emagrecimento', description: 'Foco em gasto calórico e constância.' },
  { value: 'FITNESS', label: 'Condicionamento', description: 'Equilibra saúde, disposição e rotina.' },
];

export const TECHNIQUE_OPTIONS: LabeledOption<TechniqueLevel>[] = [
  { value: 'LOW', label: 'Baixa', description: 'Ainda depende de correção frequente de execução.' },
  { value: 'MEDIUM', label: 'Média', description: 'Executa bem os movimentos principais na maior parte do tempo.' },
  { value: 'HIGH', label: 'Alta', description: 'Tem domínio técnico e estabilidade na execução.' },
];

export const CONSISTENCY_OPTIONS: LabeledOption<ConsistencyLevel>[] = [
  { value: 'LOW', label: 'Baixa', description: 'Interrompeu a rotina várias vezes nas últimas semanas.' },
  { value: 'MEDIUM', label: 'Média', description: 'Manteve uma rotina razoável, com alguns desvios.' },
  { value: 'HIGH', label: 'Alta', description: 'Tem frequência estável e aderência forte à rotina.' },
];

export const TRAINING_LEVEL_LABELS: Record<TrainingLevel, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};
