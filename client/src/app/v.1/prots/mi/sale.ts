import { SoldMi } from './sold-mi'

export class MiSale {
  _id?: string
  timestamp?: Date = null
  client?:string
  client_name?:string
  usr?: string
  mis: SoldMi[]
  payments: Object[]
}
