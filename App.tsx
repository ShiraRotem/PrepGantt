
import React, { useState, useCallback, useEffect } from 'react';
import { Block, ProductType, PrepType, User, PrepPlan } from './types';
import { INITIAL_COUNTS } from './constants';
import TableView from './components/TableView';
import CalendarView from './components/CalendarView';
import PileSidebar from './components/PileSidebar';
import AuthModal from './components/AuthModal';
import PlanModal from './components/PlanModal';
import { LayoutGrid, Calendar as CalendarIcon, Download, RotateCcw, Save, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { exportToIcal } from './services/calendarExport';

const STORAGE_KEY_USER = 'prepgantt_user';
const STORAGE_KEY_PLANS = 'prepgantt_plans_v2';

const App: React.FC = () => {
  const [view, setView] = useState<'table' | 'calendar'>('calendar');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  
  // Auth & Plan State
  const [user, setUser] = useState<User | null>(null);
  const [savedPlans, setSavedPlans] = useState<PrepPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Initialize Default Blocks
  const createDefaultBlocks = useCallback(() => {
    const initialBlocks: Block[] = [];
    Object.entries(INITIAL_COUNTS).forEach(([type, counts]) => {
      for (let i = 0; i < counts.ai; i++) {
        initialBlocks.push({
          id: `ai-${type}-${Math.random().toString(36).substr(2, 9)}`,
          productType: type as ProductType,
          prepType: 'aiMock',
          comment: counts.comments,
          status: 'pile',
          isDone: type === 'productStrategy' && i === 0
        });
      }
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
    return initialBlocks;
  }, []);

  // Load User & Plans on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    const storedPlans = localStorage.getItem(STORAGE_KEY_PLANS);
    if (storedPlans) {
      setSavedPlans(JSON.parse(storedPlans));
    }

    // Load initial empty state
    setBlocks(createDefaultBlocks());
  }, [createDefaultBlocks]);

  const handleAuth = (authData: { email: string }) => {
    const newUser: User = { id: authData.email.split('@')[0], email: authData.email };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setActivePlanId(null);
    setBlocks(createDefaultBlocks());
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const handleSavePlan = (name: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const planId = activePlanId || `plan-${Date.now()}`;
    const newPlan: PrepPlan = {
      id: planId,
      userId: user.id,
      name,
      blocks,
      updatedAt: new Date().toISOString()
    };

    setSavedPlans(prev => {
      const filtered = prev.filter(p => p.id !== planId);
      const updated = [...filtered, newPlan];
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(updated));
      return updated;
    });

    setActivePlanId(planId);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
    setShowPlanModal(false);
  };

  const handleLoadPlan = (plan: PrepPlan) => {
    setBlocks(plan.blocks);
    setActivePlanId(plan.id);
    setShowPlanModal(false);
  };

  const handleDeletePlan = (id: string) => {
    if (confirm("Delete this plan forever?")) {
      setSavedPlans(prev => {
        const updated = prev.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(updated));
        return updated;
      });
      if (activePlanId === id) {
        setActivePlanId(null);
        setBlocks(createDefaultBlocks());
      }
    }
  };

  const handleQuickSave = () => {
    if (!user) {
      setShowAuthModal(true);
    } else if (!activePlanId) {
      setShowPlanModal(true);
    } else {
      const activePlan = savedPlans.find(p => p.id === activePlanId);
      if (activePlan) handleSavePlan(activePlan.name);
    }
  };

  const addBlock = useCallback((productType: ProductType, prepType: PrepType) => {
    setBlocks(prev => {
      const newBlock: Block = {
        id: `${prepType}-${productType}-${Math.random().toString(36).substr(2, 9)}`,
        productType,
        prepType,
        comment: '',
        status: 'pile',
        isDone: false
      };
      return [...prev, newBlock];
    });
  }, []);

  const removeBlock = useCallback((productType: ProductType, prepType: PrepType) => {
    setBlocks(prev => {
      const relevant = prev.filter(b => b.productType === productType && b.prepType === prepType);
      const unplaced = relevant.filter(b => b.status === 'pile' && !b.isDone);
      if (unplaced.length > 0) {
        const toRemove = unplaced[unplaced.length - 1];
        return prev.filter(b => b.id !== toRemove.id);
      }
      const placed = relevant
        .filter(b => b.status === 'placed' && !b.isDone)
        .sort((a, b) => new Date(b.scheduledAt!).getTime() - new Date(a.scheduledAt!).getTime());
      if (placed.length > 0) {
        return prev.filter(b => b.id !== placed[0].id);
      }
      return prev;
    });
  }, []);

  const handleBlockMove = useCallback((id: string, scheduledAt: string | undefined) => {
    setBlocks(prev => prev.map(b => 
      b.id === id 
        ? { ...b, status: (scheduledAt ? 'placed' : 'pile') as Block['status'], scheduledAt: scheduledAt || undefined } 
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

  const currentPlan = savedPlans.find(p => p.id === activePlanId);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">PrepGantt</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Product Interview Mastery</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          
          <button 
            onClick={() => user ? setShowPlanModal(true) : setShowAuthModal(true)}
            className="group flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-lg px-3 py-1.5 transition-all"
          >
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-0.5">Active Plan</p>
              <p className="text-sm font-bold text-slate-700 leading-none group-hover:text-indigo-600">
                {currentPlan?.name || "Untitled Plan"}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-indigo-500" />
          </button>
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
          {user ? (
            <div className="flex items-center gap-4 pr-2">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Account</p>
                <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <UserIcon size={16} /> Login
            </button>
          )}
          
          <button 
            onClick={handleQuickSave}
            className={`flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold shadow-sm transition-all ${isSaving ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <Save size={16} />
            {isSaving ? 'Saved!' : 'Save Progress'}
          </button>
          <button 
            onClick={() => exportToIcal(blocks)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {view === 'calendar' && (
          <PileSidebar 
            blocks={blocks}
            onToggleDone={toggleDone}
            onUpdateComment={updateComment}
            onDragStart={handleDragStart}
            onBlockMove={handleBlockMove}
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

      {/* Modals */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onAuth={handleAuth} />}
      {showPlanModal && user && (
        <PlanModal 
          user={user} 
          savedPlans={savedPlans.filter(p => p.userId === user.id)}
          activePlanId={activePlanId || undefined}
          onClose={() => setShowPlanModal(false)}
          onSave={handleSavePlan}
          onLoad={handleLoadPlan}
          onDelete={handleDeletePlan}
        />
      )}
    </div>
  );
};

export default App;
