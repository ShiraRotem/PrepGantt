
import React from 'react';
import { Block } from '../types';
import { PRODUCT_TYPES } from '../constants';
import BlockItem from './BlockItem';

interface PileSidebarProps {
  blocks: Block[];
  onToggleDone: (id: string) => void;
  onUpdateComment: (id: string, comment: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onBlockMove: (id: string, scheduledAt: string | undefined) => void;
}

const PileSidebar: React.FC<PileSidebarProps> = ({ 
  blocks, 
  onToggleDone, 
  onUpdateComment, 
  onDragStart,
  onBlockMove 
}) => {
  const unplacedBlocks = blocks.filter(b => b.status === 'pile');
  
  const groups = PRODUCT_TYPES.map(pt => {
    return {
      product: pt,
      blocks: unplacedBlocks.filter(b => b.productType === pt.type)
    };
  }).filter(group => group.blocks.length > 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const blockId = e.dataTransfer.getData('blockId');
    if (blockId) {
      onBlockMove(blockId, undefined);
    }
  };

  return (
    <div 
      className="w-72 bg-slate-50 border-r border-slate-200 h-full flex flex-col p-4 overflow-y-auto custom-scrollbar transition-colors hover:bg-slate-100/50"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="mb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Preparation Pile</h2>
        <p className="text-[10px] text-slate-400 italic">Drag units to calendar to schedule. Drag back here to unschedule.</p>
      </div>
      
      <div className="space-y-6 pb-20">
        {groups.map((group) => (
          <div key={group.product.type} className="flex flex-col gap-2">
            <h3 className="text-[10px] font-bold text-slate-500 flex justify-between items-center border-b border-slate-200 pb-1">
              {group.product.label}
              <span className="text-slate-400 px-1.5 rounded">
                {group.blocks.length}
              </span>
            </h3>
            
            <div className="grid grid-cols-1 gap-1.5">
              {group.blocks.map((block) => (
                <div key={block.id} className="h-12 w-full">
                  <BlockItem 
                    block={block}
                    onToggleDone={onToggleDone}
                    onUpdateComment={onUpdateComment}
                    onDragStart={onDragStart}
                    isPile={false}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 mb-2 flex items-center justify-center">
              ✨
            </div>
            <p className="text-xs italic text-slate-500">All units scheduled!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PileSidebar;
