export class McSale {
  _id?: string;
  timestamp?: Date = null;
  usr?: string;
  paymentType: string;
  paymentAccount: string;
  auth: string;
  mcs: Object[];
}
