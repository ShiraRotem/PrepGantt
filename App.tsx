
import React, { useState, useCallback, useEffect } from 'react';
import { Block, ProductType, PrepType } from './types';
import { INITIAL_COUNTS } from './constants';
import TableView from './components/TableView';
import CalendarView from './components/CalendarView';
import PileSidebar from './components/PileSidebar';
import { LayoutGrid, Calendar as CalendarIcon, Download, RotateCcw } from 'lucide-react';
import { exportToIcal } from './services/calendarExport';

const App: React.FC = () => {
  const [view, setView] = useState<'table' | 'calendar'>('calendar');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Initialize data
  useEffect(() => {
    const initialBlocks: Block[] = [];
    Object.entries(INITIAL_COUNTS).forEach(([type, counts]) => {
      // AI Mocks
      for (let i = 0; i < counts.ai; i++) {
        initialBlocks.push({
          id: `ai-${type}-${Math.random().toString(36).substr(2, 9)}`,
          productType: type as ProductType,
          prepType: 'aiMock',
          comment: counts.comments,
          status: 'pile',
          isDone: type === 'productStrategy' && i === 0 // Match mockup example "1 performed"
        });
      }
      // Real Mocks
      for (let i = 0; i < counts.real; i++) {
        initialBlocks.push({
          id: `real-${type}-${Math.random().toString(36).substr(2, 9)}`,
          productType: type as ProductType,
          prepType: 'realMock',
          comment: counts.comments,
          status: 'pile',
          isDone: false
        });
      }
    });
    setBlocks(initialBlocks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addBlock = useCallback((productType: ProductType, prepType: PrepType) => {
    const newBlock: Block = {
      id: `${prepType}-${productType}-${Math.random().toString(36).substr(2, 9)}`,
      productType,
      prepType,
      comment: '',
      status: 'pile',
      isDone: false
    };
    setBlocks(prev => [...prev, newBlock]);
  }, []);

  const removeBlock = useCallback((productType: ProductType, prepType: PrepType) => {
    setBlocks(prev => {
      const relevant = prev.filter(b => b.productType === productType && b.prepType === prepType);
      
      // Check if all blocks are done
      if (relevant.every(b => b.isDone) && relevant.length > 0) {
        alert("Cannot reduce count: all units in this category are already marked as completed.");
        return prev;
      }

      // Deletion priority: 
      // 1. Unplaced blocks ('pile')
      // 2. Placed blocks (start from latest scheduled date)
      // BUT: skip 'isDone' blocks
      
      const unplaced = relevant.filter(b => b.status === 'pile' && !b.isDone);
      if (unplaced.length > 0) {
        const toRemove = unplaced[unplaced.length - 1];
        return prev.filter(b => b.id !== toRemove.id);
      }

      const placed = relevant
        .filter(b => b.status === 'placed' && !b.isDone)
        .sort((a, b) => new Date(b.scheduledAt!).getTime() - new Date(a.scheduledAt!).getTime());
      
      if (placed.length > 0) {
        const toRemove = placed[0];
        return prev.filter(b => b.id !== toRemove.id);
      }

      return prev;
    });
  }, []);

  const handleBlockMove = useCallback((id: string, scheduledAt: string | undefined) => {
    setBlocks(prev => prev.map(b => 
      b.id === id 
        ? { ...b, status: scheduledAt ? 'placed' : 'pile', scheduledAt } 
        : b
    ));
  }, []);

  const toggleDone = useCallback((id: string) => {
    setBlocks(prev => prev.map(b => 
      b.id === id ? { ...b, isDone: !b.isDone } : b
    ));
  }, []);

  const updateComment = useCallback((id: string, comment: string) => {
    setBlocks(prev => prev.map(b => 
      b.id === id ? { ...b, comment } : b
    ));
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('blockId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const resetSchedule = () => {
    if (confirm("Reset all scheduled items back to the pile?")) {
      setBlocks(prev => prev.map(b => ({ ...b, status: 'pile', scheduledAt: undefined })));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-none">PrepGantt</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Product Interview Mastery</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200">
          <button 
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${view === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <CalendarIcon size={16} />
            Calendar
          </button>
          <button 
            onClick={() => setView('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${view === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutGrid size={16} />
            Strategy
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={resetSchedule}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button 
            onClick={() => exportToIcal(blocks)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
          >
            <Download size={16} />
            Export Schedule
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {view === 'calendar' && (
          <PileSidebar 
            blocks={blocks}
            onToggleDone={toggleDone}
            onUpdateComment={updateComment}
            onDragStart={handleDragStart}
          />
        )}
        
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden relative">
          {view === 'table' ? (
            <div className="max-w-6xl mx-auto w-full overflow-y-auto custom-scrollbar pr-2">
              <TableView 
                blocks={blocks}
                onAddBlock={addBlock}
                onRemoveBlock={removeBlock}
              />
            </div>
          ) : (
            <div className="h-full w-full">
              <CalendarView 
                blocks={blocks}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onBlockMove={handleBlockMove}
                onToggleDone={toggleDone}
                onUpdateComment={updateComment}
                onDragStart={handleDragStart}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
