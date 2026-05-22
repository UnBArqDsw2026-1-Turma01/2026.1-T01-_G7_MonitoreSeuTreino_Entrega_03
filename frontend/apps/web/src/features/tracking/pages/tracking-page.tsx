import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrackingSummaryCard } from '../components/tracking-summary-card';
import { getWeeklySummary } from '../services/tracking-api';

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        'flex flex-col items-center gap-1 py-2 px-3 min-w-[56px]',
        active ? 'text-[#ccff00]' : 'text-[#8b7fa8]',
      ].join(' ')}
    >
      {icon}
      <span className="text-[10px] font-bold tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
}

export function TrackingPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const query = useQuery({
    queryKey: ['tracking-weekly-summary', weekOffset],
    queryFn: () => getWeeklySummary({ weekOffset }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="min-h-screen bg-[#0d0b1e] flex flex-col pb-24">
      <header className="flex items-center justify-between px-6 py-5 border-b border-[rgba(139,127,168,0.15)] relative">
        <div>
          <div className="text-[#ccff00] font-black text-xl tracking-tight uppercase">
            Monitoramento
          </div>
          <div className="text-[#8b7fa8] text-[10px] font-bold tracking-[0.22em] uppercase mt-1">
            Resumo semanal e constância
          </div>
        </div>

        <svg
          className="text-[#ccff00]"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 16v-6" />
          <path d="M12 16V8" />
          <path d="M16 16v-3" />
        </svg>
      </header>

      <main className="flex-1 px-5 py-6 mx-auto w-full max-w-[480px]">
        <TrackingSummaryCard
          summary={query.data}
          weekOffset={weekOffset}
          isFetching={query.isFetching}
          onPreviousWeek={() => setWeekOffset((prev) => prev - 1)}
          onResetWeek={() => setWeekOffset(0)}
          onNextWeek={() => setWeekOffset((prev) => prev + 1)}
        />

        {query.isError && (
          <div className="mt-6 bg-red-900/30 border border-red-500/30 rounded-2xl p-4">
            <p className="text-red-400 text-sm font-medium">
              Não foi possível carregar o resumo semanal.
            </p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1530] border-t border-[rgba(139,127,168,0.15)] flex items-center justify-around px-2 z-50">
        <Link to="/">
          <NavItem
            label="Início"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
                <path d="M9 21V12h6v9" />
              </svg>
            }
          />
        </Link>

        <Link to="/exercises">
          <NavItem
            label="Exercícios"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16" strokeLinecap="round" />
                <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="20" cy="12" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            }
          />
        </Link>

        <div className="flex flex-col items-center gap-1 py-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ccff00] to-[#a8d400] flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.35)] -mt-6">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#0d0b1e" />
            </svg>
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#ccff00]">
            Gravar
          </span>
        </div>

        <Link to="/tracking">
          <NavItem
            active
            label="Resumo"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19V5" strokeLinecap="round" />
                <path d="M4 19h16" strokeLinecap="round" />
                <path d="M8 16v-6" strokeLinecap="round" />
                <path d="M12 16V8" strokeLinecap="round" />
                <path d="M16 16v-3" strokeLinecap="round" />
              </svg>
            }
          />
        </Link>

        <NavItem
          label="Histórico"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </nav>
    </div>
  );
}