
import React from 'react';
import { Block, ProductType } from '../types';
import { PRODUCT_TYPES } from '../constants';
import BlockItem from './BlockItem';

interface PileSidebarProps {
  blocks: Block[];
  onToggleDone: (id: string) => void;
  onUpdateComment: (id: string, comment: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

const PileSidebar: React.FC<PileSidebarProps> = ({ blocks, onToggleDone, onUpdateComment, onDragStart }) => {
  const unplacedBlocks = blocks.filter(b => b.status === 'pile');
  
  // Group by ProductType, preserving the order in PRODUCT_TYPES
  const groups = PRODUCT_TYPES.map(pt => {
    return {
      product: pt,
      blocks: unplacedBlocks.filter(b => b.productType === pt.type)
    };
  }).filter(group => group.blocks.length > 0);

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
      <h2 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">Unplaced Units</h2>
      
      <div className="space-y-12">
        {groups.map((group, groupIdx) => (
          <div key={group.product.type} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-slate-500 flex justify-between items-center">
              {group.product.label}
              <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                {group.blocks.length}
              </span>
            </h3>
            
            <div className="relative h-20 w-full">
              {/* Stack visual: show up to 3 blocks in stack, handle the rest in the pile */}
              {group.blocks.map((block, idx) => (
                <BlockItem 
                  key={block.id}
                  block={block}
                  onToggleDone={onToggleDone}
                  onUpdateComment={onUpdateComment}
                  onDragStart={onDragStart}
                  isPile={true}
                  stackCount={idx}
                />
              ))}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="text-center py-10 opacity-50 grayscale italic text-sm">
            All units placed!
          </div>
        )}
      </div>
    </div>
  );
};

export default PileSidebar;
