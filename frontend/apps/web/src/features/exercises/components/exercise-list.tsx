import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';
import { searchExercises } from '../services/exercises-api';
import { ExerciseCard } from './exercise-card';
import type { Exercise } from '../types/exercises.types';

type Props = {
  onEdit: (ex: Exercise) => void;
  onDeactivate: (id: string) => void;
};

export function ExerciseList({ onEdit, onDeactivate }: Props) {
  const [filter, setFilter] = useState('');

  const query = useQuery({
    queryKey: ['exercises', filter],
    queryFn: () => searchExercises({ name: filter }),
    // CORREÇÃO: Nova sintaxe do React Query v5
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <svg
          className="absolute left-4 top-3.5 text-[#8b7fa8]"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          placeholder="BUSCAR EXERCÍCIO OU GRUPO"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-[#150f2e] border-none rounded-lg pl-10 pr-4 py-3.5 text-white placeholder-[#4a4266] uppercase tracking-widest text-[10px] font-bold outline-none ring-1 ring-transparent focus:ring-[#ccff00] transition"
        />
        {query.isFetching && <div className="absolute right-4 top-3.5 w-4 h-4 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h3 className="text-[#8b7fa8] text-[10px] font-bold tracking-[0.2em] whitespace-nowrap">LISTA DE EXERCÍCIOS (A-Z)</h3>
          <div className="h-px bg-[#2d244a] flex-1"></div>
        </div>

        <div className="space-y-3">
          {query.isLoading ? (
            <div className="text-[#8b7fa8] text-center text-sm py-4">Carregando...</div>
          ) : query.data && query.data.length > 0 ? (
            // CORREÇÃO: Adicionada a tipagem (ex: Exercise) e corrigido o map
            query.data.map((ex: Exercise) => (
              <ExerciseCard key={ex.id} exercise={ex} onEdit={onEdit} onDeactivate={onDeactivate} />
            ))
          ) : (
            <div className="text-[#8b7fa8] text-center text-sm py-4">Nenhum exercício encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}