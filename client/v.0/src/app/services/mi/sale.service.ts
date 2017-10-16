import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/mergeMap';

import { MiSale } from '../../prots/mi/sale';

import { config } from '../../config';

@Injectable()
export class SaleService {
  private uri = config.mi + '/sales';
  private paymentTypes = {
    "cash": "01",
    "debit": "28",
    "credit": "04"
  }

  private typeToPayment = {
    "01": "Efectivo",
    "28": "Débito",
    "04": "Crédito"
  }

  private typesDiscount = {
    "normal": 0,
    "refmi": 2,
    "coupon": 1
  }



  constructor(
    private http: Http,
    // private usrService: UsrService
  ) {

  }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }

  private createSale(s: any): Promise<string> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    var data = {
      usr:
      // this.usrService.get().id
      "CHOCOCO",
      paymentType: this.paymentTypes[s.paymentType],
      paymentAccount: s.paymentAccount,
      auth: s.auth
    };

    return this.http.put(this.uri, data, { headers: headers })
      .toPromise()
      .then(r => r.json().data._id)
      .catch(this.handleError);
  }

  makeSale(sale: MiSale): Promise<string> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');


    return new Promise((resolve, reject) => {
      this.createSale(sale)
        .then(id => {

          var mis = sale.mis.map(x => {
            return {
              qty: x["qty"],
              mi: x["mi"],
              sale_price: x["price_discount"],
              type_discount: this.typesDiscount[x["type_discount"]],
              discount: x["discount"]
            }
          });

          console.log(mis)

          this.addMi(id, mis)
            .then(idSale => {
              console.log("END")
              resolve(id)
            })
            .catch(this.handleError)
        })
        .catch(this.handleError)
    });
  }

  private addMi(idSale: string, mis: any[]): Promise<string> {
    let mi: any = mis.pop();

    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    mi['id_sale'] = idSale;
    console.log(mi)

    console.log(mi)

    return this.http.post(this.uri, mi, { headers: headers })
      .toPromise()
      .then(r => {
        if (mis.length > 0)
          return this.addMi(idSale, mis)
            .then(idSale => idSale)
            .catch(this.handleError);
      })
      .catch(this.handleError);
  }

  getSale(id: string): Promise<any[]> {
    return this.http.get(this.uri + "/" + id)
      .toPromise()
      .then(r => {
        let sale: MiSale = r.json().data as MiSale;

        console.log(sale);

        var result = {
          timestamp: sale.timestamp,
          payment: this.typeToPayment[sale.paymentType],
          isCard: !(this.typeToPayment[sale.paymentType] == "01"),
          mis: sale.mis.map(x => {
            return {
              qty: x["qty"],
              sale_price: x["sale_price"],
              price: x["mi"]["price"],
              mi: x["mi"]["name"]
            }
          })
        }
        return result;
      })
      .catch(this.handleError);
  }
  //
  // getSales(init: string, end: string, usr: any): Promise<MiSale[]> {
  //   console.log(usr == undefined)
  //   let postUri: string;
  //   return this.http.get(this.uri
  //     + "?init=" + init
  //     + "&end=" + end
  //     + (usr ? "&usr=" + usr : ""))
  //     .toPromise()
  //     .then(r => {
  //       let sales: MiSale[] = r.json().data as MiSale[];
  //
  //       return sales;
  //     })
  //     .catch(this.handleError);
  // }



}
