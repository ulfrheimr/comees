import { Injectable } from '@angular/core';

@Injectable()
export class PassPrint {
  public printObjects: any[];
  public _type: string;
  public registerPayment: number;
  public fields: any = {
    "f1": "Cant",
    "f2": "Estudio",
    "f3": "Precio"
  }
}
