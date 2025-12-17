
import React, { useMemo } from 'react';
import { Block } from '../types';
import WeekPicker from './WeekPicker';
import BlockItem from './BlockItem';

interface CalendarViewProps {
  blocks: Block[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onBlockMove: (id: string, scheduledAt: string | undefined) => void;
  onToggleDone: (id: string) => void;
  onUpdateComment: (id: string, comment: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  blocks, 
  currentDate, 
  onDateChange, 
  onBlockMove, 
  onToggleDone, 
  onUpdateComment,
  onDragStart
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const result = new Date(d.setDate(diff));
    result.setHours(0, 0, 0, 0);
    return result;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startOfWeek]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    const blockId = e.dataTransfer.getData('blockId');
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hour, 0, 0, 0);
    
    // Collision detection: Check if any block is already at this time
    const collision = blocks.find(b => b.scheduledAt === scheduledAt.toISOString());
    if (collision) {
      // Snapping back happens naturally if we don't update state
      console.warn("Collision detected at", scheduledAt.toISOString());
      return;
    }

    onBlockMove(blockId, scheduledAt.toISOString());
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800">Weekly Schedule</h2>
        <WeekPicker currentDate={currentDate} onDateChange={onDateChange} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
        {/* Day Labels */}
        <div className="flex border-b border-slate-200 sticky top-0 z-20 bg-white">
          <div className="w-16 flex-shrink-0 border-r border-slate-200"></div>
          {weekDays.map((day, i) => (
            <div key={i} className="flex-1 p-2 text-center border-r last:border-r-0 border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="text-lg font-bold text-slate-700">{day.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-1">
          {/* Hour labels */}
          <div className="w-16 flex-shrink-0 bg-slate-50/30 border-r border-slate-200">
            {hours.map(hour => (
              <div key={hour} className="h-16 text-[10px] text-slate-400 font-medium pr-2 text-right pt-2 border-b border-slate-100 last:border-b-0">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>

          {/* Slots */}
          <div className="flex flex-1">
            {weekDays.map((day, dayIdx) => (
              <div key={dayIdx} className="flex-1 border-r last:border-r-0 border-slate-200 relative">
                {hours.map(hour => {
                  const cellDate = new Date(day);
                  cellDate.setHours(hour, 0, 0, 0);
                  const isoDate = cellDate.toISOString();
                  const blockInSlot = blocks.find(b => b.scheduledAt === isoDate);

                  return (
                    <div 
                      key={hour} 
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, hour)}
                      className="h-16 border-b border-slate-100 last:border-b-0 p-0.5"
                    >
                      {blockInSlot && (
                        <BlockItem 
                          block={blockInSlot}
                          onToggleDone={onToggleDone}
                          onUpdateComment={onUpdateComment}
                          onDragStart={onDragStart}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
