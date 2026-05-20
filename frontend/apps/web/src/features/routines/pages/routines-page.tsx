import { useState } from 'react';
import { RoutineModal } from '../components/RoutineModal';

export function RoutinesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);

  // Mock para visualização imediata
  const currentRoutine = {
    id: '1',
    name: "PREPARAÇÃO MEN'S PHYSIQUE",
    description: 'Foco em hipertrofia e definição muscular',
    exerciseCount: 24,
    isActive: true,
  };

  const otherRoutines = [
    {
      id: '2',
      name: 'BULKING',
      createdAt: 'Criado em 12 de Setembro',
      frequency: '6 DIAS/SEMANA',
      division: 'FICHA A-B-C-D',
      isActive: false,
    },
  ];

  const handleOpenModal = (routine?: any) => {
    setSelectedRoutine(routine || null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col pb-20 font-sans text-white">
      {/* Header Fixo */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-[rgba(139,127,168,0.15)]">
        <span className="text-brand font-black text-xl tracking-tight">Fichas de Treino</span>
        <button className="text-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </header>

      <main className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full space-y-8">

        {/* Seção: FICHA ATUAL */}
        <section>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">FICHA ATUAL</h2>

          <div className="bg-surface rounded-2xl p-5 border border-[rgba(139,127,168,0.15)] relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>

            <div className="flex justify-between items-start mb-2">
              <span className="bg-brand text-black text-[10px] font-bold px-2 py-1 rounded tracking-wider">ACTIVE</span>
              <button onClick={() => handleOpenModal(currentRoutine)} className="text-[#00e5ff] hover:brightness-110">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>

            <h3 className="text-xl font-black uppercase leading-tight mb-1">{currentRoutine.name}</h3>
            <p className="text-muted text-sm mb-6">{currentRoutine.description}</p>

            <div className="flex items-center justify-between mt-4">
              <span className="text-muted text-xs font-bold flex items-center gap-1">
                ↗ {currentRoutine.exerciseCount} EXERCÍCIOS
              </span>
              <button className="text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-red-300">
                ⊘ INATIVAR
              </button>
            </div>
          </div>
        </section>

        {/* Seção: OUTRAS FICHAS */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-sm font-bold text-muted tracking-widest uppercase whitespace-nowrap">OUTRAS FICHAS</h2>
            <div className="h-px bg-[rgba(139,127,168,0.15)] flex-1"></div>
          </div>

          <div className="relative mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              placeholder="BUSCAR FICHA..."
              className="w-full bg-surface border border-[rgba(139,127,168,0.15)] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-muted outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-4">
            {otherRoutines.map((routine) => (
              <div key={routine.id} className="bg-surface rounded-2xl p-5 border border-[rgba(139,127,168,0.15)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black uppercase">{routine.name}</h3>
                    <p className="text-muted text-xs mt-1">{routine.createdAt}</p>
                  </div>
                  <button className="border border-[rgba(139,127,168,0.3)] text-gray-300 hover:text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                    ATIVAR
                  </button>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className="bg-card text-gray-300 text-[10px] font-bold px-2 py-1 rounded tracking-wider">{routine.frequency}</span>
                  <span className="bg-card text-gray-300 text-[10px] font-bold px-2 py-1 rounded tracking-wider">{routine.division}</span>
                </div>

                <div className="flex items-center justify-end gap-4 mt-2">
                  <button onClick={() => handleOpenModal(routine)} className="text-gray-300 text-xs font-bold uppercase tracking-wider hover:text-white flex items-center gap-1">
                    ✎ EDITAR
                  </button>
                  <button className="text-red-400 text-xs font-bold uppercase tracking-wider hover:text-red-300 flex items-center gap-1">
                    🗑 EXCLUIR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:brightness-110"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d0b1e" strokeWidth="3">
          <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
        </svg>
      </button>

      <RoutineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedRoutine}
      />
    </div>
  );
}