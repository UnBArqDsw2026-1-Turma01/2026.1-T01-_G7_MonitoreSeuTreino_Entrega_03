import type { WeeklySummary } from '../types/tracking.types';

type Props = {
  summary?: WeeklySummary;
  weekOffset: number;
  isFetching?: boolean;
  onPreviousWeek: () => void;
  onResetWeek: () => void;
  onNextWeek: () => void;
};

function formatDateLabel(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

function formatPeriodLabel(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const startLabel = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(start);

  const endLabel = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(end);

  return `${startLabel} → ${endLabel}`;
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div className="bg-[#1a1333] border border-[#2d244a] rounded-xl p-4 shadow-lg shadow-black/20">
      <div className="text-[#8b7fa8] text-[10px] font-bold tracking-[0.24em] uppercase">
        {label}
      </div>
      <div className="mt-2 text-white font-black text-2xl tracking-tight">
        {value}
      </div>
      {helper && (
        <div className="mt-1 text-[#8b7fa8] text-xs leading-relaxed">
          {helper}
        </div>
      )}
    </div>
  );
}

function DayChip({ day }: { day: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#2d244a] bg-[#150f2e] px-3 py-2 text-sm text-white">
      <span className="h-2 w-2 rounded-full bg-[#ccff00]" />
      <span className="font-bold tracking-wide">{day}</span>
    </div>
  );
}

export function TrackingSummaryCard({
  summary,
  weekOffset,
  isFetching = false,
  onPreviousWeek,
  onResetWeek,
  onNextWeek,
}: Props) {
  const periodLabel = summary
    ? formatPeriodLabel(summary.period.start, summary.period.end)
    : 'Carregando período...';

  return (
    <section className="space-y-6">
      <div className="bg-[#1a1333] border border-[#2d244a] rounded-2xl p-5 relative overflow-hidden shadow-2xl shadow-black/20">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ccff00]" />
        <div className="flex items-start justify-between gap-4 pl-2">
          <div>
            <div className="text-white font-black text-lg tracking-tight uppercase">
              Semana atual
            </div>
            <div className="mt-2 text-[#8b7fa8] text-xs font-bold tracking-[0.18em] uppercase">
              {periodLabel}
            </div>
          </div>

          <div className="rounded-full border border-[#2d244a] bg-[#150f2e] px-3 py-1 text-[10px] font-black tracking-[0.24em] uppercase text-[#ccff00]">
            {weekOffset === 0 ? 'Atual' : weekOffset > 0 ? `+${weekOffset}` : `${weekOffset}`}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onPreviousWeek}
            className="rounded-lg border border-[#2d244a] bg-[#150f2e] px-3 py-3 text-white font-black text-[10px] uppercase tracking-widest hover:border-[#ccff00] hover:text-[#ccff00] transition"
          >
            ◀ Semana
          </button>
          <button
            type="button"
            onClick={onResetWeek}
            className="rounded-lg border border-[#2d244a] bg-[#150f2e] px-3 py-3 text-white font-black text-[10px] uppercase tracking-widest hover:border-[#ccff00] hover:text-[#ccff00] transition"
          >
            Atual
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            className="rounded-lg border border-[#2d244a] bg-[#150f2e] px-3 py-3 text-white font-black text-[10px] uppercase tracking-widest hover:border-[#ccff00] hover:text-[#ccff00] transition"
          >
            Semana ▶
          </button>
        </div>
      </div>

      {isFetching && (
        <div className="flex items-center gap-3 text-[#8b7fa8] text-xs font-bold tracking-widest uppercase">
          <div className="w-4 h-4 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
          Atualizando resumo...
        </div>
      )}

      {summary ? (
        <>
          <section className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Sessões concluídas"
              value={summary.totalSessions}
              helper="Cada sessão salva conta individualmente."
            />
            <MetricCard
              label="Dias distintos"
              value={summary.distinctDaysCount}
              helper="Quantos dias diferentes tiveram treino."
            />
          </section>

          <section className="bg-[#1a1333] border border-[#2d244a] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="text-[#8b7fa8] text-[10px] font-bold tracking-[0.22em] whitespace-nowrap uppercase">
                Dias com atividade
              </h3>
              <div className="h-px bg-[#2d244a] flex-1" />
            </div>

            {summary.activeDays.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summary.activeDays.map((day) => (
                  <DayChip key={day} day={formatDateLabel(day)} />
                ))}
              </div>
            ) : (
              <div className="text-[#8b7fa8] text-sm py-2">
                Nenhuma sessão concluída neste período.
              </div>
            )}
          </section>

          <section className="bg-[#150f2e] border border-[#2d244a] rounded-2xl p-5 space-y-3">
            <div className="text-white font-black text-sm uppercase tracking-widest">
              Resumo rápido
            </div>
            <p className="text-[#8b7fa8] text-sm leading-relaxed">
              O painel mostra a quantidade total de sessões concluídas na semana,
              os dias distintos com treino e o intervalo de segunda a domingo.
            </p>
            <div className="flex items-center justify-between pt-2 text-[10px] uppercase tracking-[0.22em] font-bold text-[#8b7fa8]">
              <span>Período</span>
              <span className="text-[#ccff00]">{periodLabel}</span>
            </div>
          </section>
        </>
      ) : (
        !isFetching && (
          <div className="bg-[#1a1333] border border-[#2d244a] rounded-2xl p-5 text-[#8b7fa8] text-sm">
            Nenhum resumo disponível.
          </div>
        )
      )}
    </section>
  );
}