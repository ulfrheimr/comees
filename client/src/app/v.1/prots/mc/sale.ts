import { SoldMc } from './sold-mc'

export class McSale {
  _id?: string
  timestamp?: Date = null
  usr?: string
  status?: number
  client?: string
  clientName?: string
  payments: Object[]
  mcs: SoldMc[]
}
