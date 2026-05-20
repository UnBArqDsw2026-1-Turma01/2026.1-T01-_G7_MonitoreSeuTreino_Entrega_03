import { Link } from 'react-router-dom';

export function AppHeader() {
  return (
    <header className="flex items-center justify-between bg-[#0d0b1e] px-5 py-4 border-b border-[rgba(139,127,168,0.15)]">
      <Link to="/" className="text-[#ccff00] font-black text-xl tracking-tight">
        G7_MonitoreSeuTreino
      </Link>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#ccff00]">
        <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#ccff00" />
      </svg>
    </header>
  );
}
