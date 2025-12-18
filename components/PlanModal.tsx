
import React, { useState } from 'react';
import { PrepPlan, User } from '../types';
import { FolderOpen, Plus, Save, X, Trash2, Calendar as CalendarIcon } from 'lucide-react';

interface PlanModalProps {
  user: User;
  savedPlans: PrepPlan[];
  activePlanId?: string;
  onClose: () => void;
  onSave: (name: string) => void;
  onLoad: (plan: PrepPlan) => void;
  onDelete: (id: string) => void;
}

const PlanModal: React.FC<PlanModalProps> = ({ 
  user, 
  savedPlans, 
  activePlanId,
  onClose, 
  onSave, 
  onLoad,
  onDelete
}) => {
  const [newName, setNewName] = useState('');
  const [isSavingNew, setIsSavingNew] = useState(false);

  const activePlan = savedPlans.find(p => p.id === activePlanId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <FolderOpen size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">My Interview Plans</h2>
              <p className="text-xs text-slate-500 font-medium">Logged in as {user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Create New Plan */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Create New Plan</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Google Prep - Q3"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button 
                disabled={!newName}
                onClick={() => onSave(newName)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} /> Save New
              </button>
            </div>
          </section>

          {/* Saved Plans List */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Saved Plans</h3>
            <div className="grid grid-cols-1 gap-2">
              {savedPlans.length === 0 ? (
                <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-sm italic">No saved plans yet.</p>
                </div>
              ) : (
                savedPlans.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(plan => (
                  <div 
                    key={plan.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${plan.id === activePlanId ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${plan.id === activePlanId ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <CalendarIcon size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{plan.name}</h4>
                        <p className="text-[10px] text-slate-400">Last updated: {new Date(plan.updatedAt).toLocaleDateString()} {new Date(plan.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {plan.id !== activePlanId && (
                        <button 
                          onClick={() => onLoad(plan)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Open
                        </button>
                      )}
                      {plan.id === activePlanId && (
                        <button 
                          onClick={() => onSave(plan.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                        >
                          <Save size={14} /> Update
                        </button>
                      )}
                      <button 
                        onClick={() => onDelete(plan.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PlanModal;
