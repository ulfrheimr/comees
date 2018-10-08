import { Mi } from './mi';

export class SoldMi {
  _id?: string
  qty: number
  timestamp?: Date = null
  usr?: string
  mi?: Mi
  salePrice: Number
  discount?: string
  discountType?: string
}
