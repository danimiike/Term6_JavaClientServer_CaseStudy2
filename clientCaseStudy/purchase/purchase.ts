import { PurchaseItem } from './purchase-item';
/*
    Purcahse Order - interface for product report 
*/
export interface Purchase {
    id: number;
    vendorid: number;
    amount: number;
    items: PurchaseItem[];
    podate: string;
}