
export type PrepType = 'aiMock' | 'realMock';

export type ProductType = 
  | 'productLove' 
  | 'productHate' 
  | 'productSense' 
  | 'productStrategy' 
  | 'productAnalytics' 
  | 'productExecution' 
  | 'productTech' 
  | 'behavePrep' 
  | 'behave' 
  | 'vibeCoding';

export type BlockStatus = 'pile' | 'placed';

export interface Block {
  id: string;
  productType: ProductType;
  prepType: PrepType;
  comment: string;
  status: BlockStatus;
  isDone: boolean;
  scheduledAt?: string; // ISO string representing the start of the hour
}

export interface ProductRow {
  type: ProductType;
  label: string;
  color: string;
  comment?: string;
}
