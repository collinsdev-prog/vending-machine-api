import { RowDataPacket } from 'mysql2';

// buy.types.ts
export interface Product {
  id: number;
  productName: string;
  cost: number;
  amountAvailable: number;
  sellerId: number;
}

export interface PurchaseResult {
  depositedAmount: number;
  totalSpent: number;
  products: {
    productId: number;
    productName: string;
    amount: number;
    cost: number;
  }[];
  change: number[];
  note: string;
}

export interface PurchaseHistoryRow extends RowDataPacket {
  saleId: number;
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  date: Date;
}
