import { Link, useLocation } from 'react-router-dom';

function NavItem({ icon, label, active = false, to = "#" }: { icon: React.ReactNode; label: string; active?: boolean, to?: string }) {
  return (
    <Link to={to} className={['flex flex-col items-center gap-1 py-2 px-3 min-w-[56px]', active ? 'text-[#ccff00]' : 'text-[#8b7fa8]'].join(' ')}>
      {icon}
      <span className="text-[10px] font-bold tracking-widest uppercase">{label}</span>
    </Link>
  );
}

export function BottomNavigation() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1530] border-t border-[rgba(139,127,168,0.15)] flex items-center justify-around px-2 z-50">
      <NavItem
        to="/"
        active={pathname === '/'}
        label="Início"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9" /></svg>}
      />

      <NavItem
        label="Treino"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16" strokeLinecap="round" /></svg>}
      />

      <div className="flex flex-col items-center gap-1 py-1">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ccff00] to-[#a8d400] flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.35)] -mt-6">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#0d0b1e" /></svg>
        </div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#ccff00]">Gravar</span>
      </div>

      <NavItem
        to="/routines"
        active={pathname === '/routines'}
        label="Rotina"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" /></svg>}
      />

      <NavItem
        label="Histórico"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      />
    </nav>
  );
}