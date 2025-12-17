
import React from 'react';
import { Block, ProductType, PrepType } from '../types';
import { PRODUCT_TYPES } from '../constants';
import { Table, CheckSquare, Plus, Minus } from 'lucide-react';

interface TableViewProps {
  blocks: Block[];
  onAddBlock: (productType: ProductType, prepType: PrepType) => void;
  onRemoveBlock: (productType: ProductType, prepType: PrepType) => void;
}

const TableView: React.FC<TableViewProps> = ({ blocks, onAddBlock, onRemoveBlock }) => {
  
  const getCounts = (productType: ProductType, prepType: PrepType) => {
    const relevant = blocks.filter(b => b.productType === productType && b.prepType === prepType);
    return {
      required: relevant.length,
      performed: relevant.filter(b => b.isDone).length
    };
  };

  const totals = {
    aiReq: blocks.filter(b => b.prepType === 'aiMock').length,
    realReq: blocks.filter(b => b.prepType === 'realMock').length,
    aiDone: blocks.filter(b => b.prepType === 'aiMock' && b.isDone).length,
    realDone: blocks.filter(b => b.prepType === 'realMock' && b.isDone).length,
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-emerald-700 p-1.5 rounded text-white">
          <Table size={18} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Preparation Strategy</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-900 text-white text-xs uppercase tracking-wider">
              <th className="p-3 border-r border-emerald-800 min-w-[160px]">Product Area</th>
              <th className="p-3 border-r border-emerald-800 text-center">Req: AI Mocks</th>
              <th className="p-3 border-r border-emerald-800 text-center">AI Performed</th>
              <th className="p-3 border-r border-emerald-800 text-center">Req: Real Mocks</th>
              <th className="p-3 border-r border-emerald-800 text-center">Real Performed</th>
              <th className="p-3">Comments</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {PRODUCT_TYPES.map((pt, idx) => {
              const ai = getCounts(pt.type, 'aiMock');
              const real = getCounts(pt.type, 'realMock');
              const rowBlocks = blocks.filter(b => b.productType === pt.type);
              const firstBlockWithComment = rowBlocks.find(b => b.comment)?.comment || '';

              return (
                <tr key={pt.type} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-3 border-r border-slate-200 font-medium text-slate-700 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pt.color }}></div>
                    {pt.label}
                  </td>
                  
                  <td className="p-3 border-r border-slate-200">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => onRemoveBlock(pt.type, 'aiMock')}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-semibold">{ai.required}</span>
                      <button 
                        onClick={() => onAddBlock(pt.type, 'aiMock')}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>
                  
                  <td className="p-3 border-r border-slate-200 text-center font-medium text-slate-400">
                    {ai.performed > 0 ? ai.performed : '-'}
                  </td>

                  <td className="p-3 border-r border-slate-200">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => onRemoveBlock(pt.type, 'realMock')}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-semibold">{real.required}</span>
                      <button 
                        onClick={() => onAddBlock(pt.type, 'realMock')}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>

                  <td className="p-3 border-r border-slate-200 text-center font-medium text-slate-400">
                    {real.performed > 0 ? real.performed : '-'}
                  </td>

                  <td className="p-3 text-slate-500 italic truncate max-w-[200px]">
                    {firstBlockWithComment}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-emerald-50 text-emerald-900 font-bold text-sm">
              <td className="p-3 border-r border-emerald-100">Totals</td>
              <td className="p-3 border-r border-emerald-100 text-center">{totals.aiReq}</td>
              <td className="p-3 border-r border-emerald-100 text-center">{totals.aiDone}</td>
              <td className="p-3 border-r border-emerald-100 text-center">{totals.realReq}</td>
              <td className="p-3 border-r border-emerald-100 text-center">{totals.realDone}</td>
              <td className="p-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TableView;
