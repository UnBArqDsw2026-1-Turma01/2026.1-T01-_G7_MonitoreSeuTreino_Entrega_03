import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../auth/services/auth-api';
import { OnboardingForm } from '../components/onboarding-form';
import { getOnboardingStatus, redoOnboarding, submitOnboarding } from '../services/onboarding-api';
import { TRAINING_LEVEL_LABELS, type SubmitOnboardingPayload } from '../types/onboarding.types';

export function OnboardingPage() {
  const navigate = useNavigate();

  const statusQuery = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: getOnboardingStatus,
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: SubmitOnboardingPayload) => {
      const isRedo = Boolean(statusQuery.data?.profile);
      return isRedo ? redoOnboarding(values) : submitOnboarding(values);
    },
    onSuccess: (profile) => navigate('/onboarding/result', { state: { profile } }),
  });

  const profile = statusQuery.data?.profile;
  const isRedo = Boolean(profile);

  if (statusQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0b1e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0b1e] flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-[rgba(139,127,168,0.15)]">
        <span className="text-[#ccff00] font-black text-xl tracking-tight">G7_MonitoreSeuTreino</span>
        <div className="flex items-center gap-4">
          <button onClick={logout} className="text-[#8b7fa8] text-xs font-bold tracking-widest uppercase hover:text-white transition">
            Sair
          </button>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#ccff00" />
          </svg>
        </div>
      </header>

      <main className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
        <p className="text-[#ccff00] text-xs font-bold tracking-[0.3em] uppercase mb-2">
          {isRedo ? 'Refazer onboarding' : 'Onboarding de treino'}
        </p>
        <h1 className="text-4xl font-black uppercase tracking-tight leading-tight text-white mb-1">
          {isRedo ? 'ATUALIZE SEU PERFIL' : 'DESCUBRA SEU NÍVEL'}
        </h1>
        <div className="w-12 h-1 bg-[#ccff00] mb-6" />

        {isRedo && profile && (
          <div className="mb-6 bg-[#1a1530] border border-[rgba(204,255,0,0.2)] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[#8b7fa8] text-xs font-bold tracking-widest uppercase">Perfil atual</p>
              <p className="text-[#ccff00] font-black text-lg mt-1">{TRAINING_LEVEL_LABELS[profile.classification]}</p>
              <p className="text-[#8b7fa8] text-xs">Score {profile.score}/10</p>
            </div>
            <div className="text-[#8b7fa8] text-xs text-right max-w-[140px] leading-5">
              O histórico anterior será preservado antes da atualização
            </div>
          </div>
        )}

        <OnboardingForm
          defaultValues={profile ?? undefined}
          isSubmitting={saveMutation.isPending}
          submitLabel={isRedo ? 'Atualizar perfil' : 'Concluir onboarding'}
          error={saveMutation.isError ? 'Erro ao salvar. Verifique sua conexão com o servidor.' : undefined}
          onSubmit={(values) => saveMutation.mutate(values)}
        />
      </main>
    </div>
  );
}
