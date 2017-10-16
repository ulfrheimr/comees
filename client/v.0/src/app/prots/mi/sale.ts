export class MiSale {
  _id?: string;
  timestamp?: Date = null;
  usr: string;
  paymentType: string;
  paymentAccount: string;
  auth: string;
  mis: Object[];
}
