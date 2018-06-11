import { Mc } from './mc';

export class SoldMc {
  _id?: string
  qty: number
  timestamp?: Date = null
  usr?: string
  mc?: Mc
  salePrice: Number
  phys: string
}
