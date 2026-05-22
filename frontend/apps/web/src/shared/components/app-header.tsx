import { logout } from '../../features/auth/services/auth-api';

export function AppHeader({ title = "G7_MonitoreSeuTreino" }: {title?: string}) {
  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-[rgba(139,127,168,0.15)]">
      <span className="text-[#ccff00] font-black text-xl tracking-tight">
        {title}
      </span>
      <div className="flex items-center gap-4">
        <button
          onClick={logout}
          className="text-[#8b7fa8] text-xs font-bold tracking-widest uppercase hover:text-white transition"
        >
          Sair
        </button>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#ccff00" />
        </svg>
      </div>
    </header>
  );
}