
import React, { useState } from 'react';
import { Check, MessageSquare } from 'lucide-react';
import { Block, ProductRow } from '../types';
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

  return (
    <div 
      draggable={!block.isDone}
      onDragStart={(e) => onDragStart(e, block.id)}
      onDoubleClick={handleDoubleClick}
      className={`
        relative select-none cursor-grab active:cursor-grabbing rounded-md border p-1 text-[10px] shadow-sm transition-all
        ${block.isDone ? 'opacity-70 grayscale-[0.5]' : ''}
        ${isPile ? 'absolute w-full h-full' : 'w-full h-full'}
      `}
      style={{ 
        backgroundColor: product?.color || '#f1f5f9',
        borderColor: 'rgba(0,0,0,0.1)',
        top: isPile ? `${stackCount * 3}px` : '0',
        left: isPile ? `${stackCount * 2}px` : '0',
        zIndex: isPile ? 50 - stackCount : 1,
      }}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <span className="font-bold leading-none truncate pr-4">
            {product?.label}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleDone(block.id); }}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${block.isDone ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 hover:border-slate-400'}`}
          >
            {block.isDone && <Check size={10} strokeWidth={4} />}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[9px] uppercase font-semibold text-slate-500">
            {block.prepType === 'aiMock' ? 'AI' : 'Real'}
          </span>
          {block.comment && (
            <MessageSquare size={10} className="text-slate-400" />
          )}
        </div>
      </div>

      {showComment && (
        <div 
          className="absolute z-[100] left-full top-0 ml-2 p-2 bg-white rounded shadow-xl border border-slate-200 w-48"
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <textarea
            autoFocus
            className="w-full h-20 text-xs border border-slate-200 rounded p-1 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            value={tempComment}
            onChange={(e) => setTempComment(e.target.value)}
            onBlur={handleCommentBlur}
            placeholder="Add notes..."
          />
        </div>
      )}
    </div>
  );
};

export default BlockItem;
