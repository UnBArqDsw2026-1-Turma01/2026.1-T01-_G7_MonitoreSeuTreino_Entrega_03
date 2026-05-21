import type { Exercise } from '../types/exercises.types';

type Props = {
  exercise: Exercise;
  onEdit: (ex: Exercise) => void;
  onDeactivate: (id: string) => void;
};

export function ExerciseCard({ exercise, onEdit, onDeactivate }: Props) {
  return (
    <div className="bg-[#1a1333] border border-[#2d244a] rounded-lg p-4 flex items-center justify-between relative overflow-hidden">
      {/* Decorative left line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ccff00]"></div>
      
      <div className="flex items-center gap-4 pl-2">
        <div className="text-white opacity-60">
          {/* Dumbbell icon placeholder */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16" />
            <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="20" cy="12" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div>
          <div className="text-white font-black text-sm uppercase tracking-wide">{exercise.name}</div>
          <div className="text-[#8b7fa8] text-[10px] font-bold tracking-widest uppercase mt-1 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00]"></div>
            {exercise.muscleGroup || 'GERAL'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => onEdit(exercise)} className="text-[#00e5ff] hover:brightness-125 transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        <button onClick={() => onDeactivate(exercise.id)} className="text-[#ff5555] hover:brightness-125 transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
