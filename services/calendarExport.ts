
import { Block } from '../types';
import { PRODUCT_TYPES } from '../constants';

export const exportToIcal = (blocks: Block[]) => {
  const placedBlocks = blocks.filter(b => b.status === 'placed' && b.scheduledAt);
  
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//InterviewPrep//PrepPlanner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  placedBlocks.forEach(block => {
    const start = new Date(block.scheduledAt!);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const productLabel = PRODUCT_TYPES.find(p => p.type === block.productType)?.label || block.productType;
    const summary = `${productLabel} (${block.prepType === 'aiMock' ? 'AI' : 'Real'} Mock)`;

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:${block.id}@interviewprep.app`);
    icsContent.push(`DTSTAMP:${formatDate(new Date())}`);
    icsContent.push(`DTSTART:${formatDate(start)}`);
    icsContent.push(`DTEND:${formatDate(end)}`);
    icsContent.push(`SUMMARY:${summary}`);
    if (block.comment) {
      icsContent.push(`DESCRIPTION:${block.comment.replace(/\n/g, '\\n')}`);
    }
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'interview_prep_schedule.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
