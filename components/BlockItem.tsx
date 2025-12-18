
import React, { useState } from 'react';
import { Check, MessageSquare } from 'lucide-react';
import { Block } from '../types';
import { PRODUCT_TYPES } from '../constants';

interface BlockItemProps {
  block: Block;
  onToggleDone: (id: string) => void;
  onUpdateComment: (id: string, comment: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  isPile?: boolean;
  stackCount?: number;
}

const BlockItem: React.FC<BlockItemProps> = ({ 
  block, 
  onToggleDone, 
  onUpdateComment, 
  onDragStart,
  isPile = false,
  stackCount = 0
}) => {
  const [showComment, setShowComment] = useState(false);
  const [tempComment, setTempComment] = useState(block.comment);
  const product = PRODUCT_TYPES.find(p => p.type === block.productType);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComment(true);
  };

  const handleCommentBlur = () => {
    onUpdateComment(block.id, tempComment);
    setShowComment(false);
  };

  const style: React.CSSProperties = { 
    backgroundColor: product?.color || '#f1f5f9',
    borderColor: 'rgba(0,0,0,0.08)',
    zIndex: isPile ? 50 - stackCount : 1,
  };

  if (isPile) {
    style.position = 'absolute';
    style.top = `${stackCount * 3}px`;
    style.left = `${stackCount * 2}px`;
  }

  return (
    <div 
      draggable={!block.isDone}
      onDragStart={(e) => onDragStart(e, block.id)}
      onDoubleClick={handleDoubleClick}
      className={`
        relative select-none cursor-grab active:cursor-grabbing rounded-lg border p-1.5 text-[10px] shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5
        ${block.isDone ? 'opacity-60 grayscale-[0.3] border-slate-300' : ''}
        w-full h-full
      `}
      style={style}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <span className="font-bold leading-none truncate pr-4 text-slate-800">
            {product?.label}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleDone(block.id); }}
            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${block.isDone ? 'bg-green-600 border-green-600 text-white' : 'bg-white/50 border-slate-300 hover:border-slate-500'}`}
          >
            {block.isDone && <Check size={10} strokeWidth={4} />}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <span className={`text-[8px] px-1 rounded uppercase font-bold ${block.prepType === 'aiMock' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
            {block.prepType === 'aiMock' ? 'AI' : 'Real'}
          </span>
          {block.comment && (
            <MessageSquare size={10} className="text-slate-500/50" />
          )}
        </div>
      </div>

      {showComment && (
        <div 
          className="fixed z-[100] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white rounded-xl shadow-2xl border border-slate-200 w-64 animate-in fade-in zoom-in duration-200"
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Block Notes</h4>
          <textarea
            autoFocus
            className="w-full h-24 text-xs border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none shadow-inner bg-slate-50"
            value={tempComment}
            onChange={(e) => setTempComment(e.target.value)}
            onBlur={handleCommentBlur}
            placeholder="What should you focus on?"
          />
          <div className="mt-2 text-[9px] text-slate-400 text-right">Click outside to save</div>
        </div>
      )}
    </div>
  );
};

export default BlockItem;
