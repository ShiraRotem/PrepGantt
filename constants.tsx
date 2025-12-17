
import { ProductRow } from './types';

export const PRODUCT_TYPES: ProductRow[] = [
  { type: 'productLove', label: 'productLove', color: '#fee2e2' }, // Red-100
  { type: 'productHate', label: 'productHate', color: '#ffedd5' }, // Orange-100
  { type: 'productSense', label: 'productSense', color: '#fef9c3' }, // Yellow-100
  { type: 'productStrategy', label: 'productStrategy', color: '#f0fdf4' }, // Green-100
  { type: 'productAnalytics', label: 'productAnalytics', color: '#ecfeff' }, // Cyan-100
  { type: 'productExecution', label: 'productExecution', color: '#eff6ff' }, // Blue-100
  { type: 'productTech', label: 'productTech', color: '#eef2ff' }, // Indigo-100
  { type: 'behavePrep', label: 'behavePrep', color: '#f5f3ff' }, // Violet-100
  { type: 'behave', label: 'behave', color: '#fae8ff' }, // Fuchsia-100
  { type: 'vibeCoding', label: 'vibeCoding', color: '#f3f4f6' }, // Gray-100
];

export const INITIAL_COUNTS: Record<string, { ai: number; real: number; comments: string }> = {
  productLove: { ai: 3, real: 1, comments: '' },
  productHate: { ai: 3, real: 1, comments: '' },
  productSense: { ai: 4, real: 1, comments: '' },
  productStrategy: { ai: 4, real: 1, comments: 'Pricing (need more)' },
  productAnalytics: { ai: 4, real: 2, comments: '' },
  productExecution: { ai: 6, real: 2, comments: '' },
  productTech: { ai: 4, real: 2, comments: '' },
  behavePrep: { ai: 10, real: 0, comments: '' },
  behave: { ai: 4, real: 3, comments: '' },
  vibeCoding: { ai: 3, real: 1, comments: '' },
};
