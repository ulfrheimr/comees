import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { UsrService } from '../usr.service';

import 'rxjs/add/operator/mergeMap';

import { MiSale } from '../../prots/mi/sale';

import { Partial } from '../../prots/partial';

import { config } from '../../config';

@Injectable()
export class SaleService {
  private uri = config.mi + '/sales';
  private uriPartial = config.mi + '/partials';
  private uriPartialPayments = config.mi + '/partial_payments';
  private uriPartialsCut = config.mi + '/partials_cut';


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
    private usrService: UsrService
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
      usr: this.usrService.get().usr,
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

  getSales(init: string, end: string = null, usr: any = ""): Promise<any[]> {
    let postUri: string;
    return this.http.get(this.uri
      + "?init=" + init
      + (end ? "&end=" + end : "")
      + (usr ? "&usr=" + usr : ""))
      .toPromise()
      .then((r) => {
        let sales: MiSale[] = r.json().data as MiSale[];

        return sales;
      })
      .catch(this.handleError);
  }

  // PARTIAL PAYMENT
  makePartial(partial: any): Promise<string> {
    return new Promise((resolve, reject) => {

      this.createPartial(partial)
        .then((id) => {
          var res = partial.mis.map((x) => {
            var q = {
              qty: x["qty"],
              mi: x["mi"]
            }

            return q;
          });

          this.addPartialMc(id, res, partial.payments)
            .then(idSale => {
              resolve(id)
            })
            .catch(this.handleError)
        })
        .catch(this.handleError)
    });
  }

  private createPartial(s: any): Promise<string> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    var data = {
      client: s.client._id,
      client_name: s.client.name,
    };

    return this.http.put(this.uriPartial, data, { headers: headers })
      .toPromise()
      .then(r => r.json().data._id)
      .catch(this.handleError);
  }

  private addPartialMc(idSale: string, mis: any[], payment): Promise<string> {
    let mi: any = mis.pop();

    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    mi['id_sale'] = idSale;

    return this.http.post(this.uriPartial, mi, { headers: headers })
      .toPromise()
      .then(r => {

        if (mis.length > 0)
          return this.addPartialMc(idSale, mis, payment)
            .then(idSale => idSale)
            .catch(this.handleError);
        else {
          return this.addPartialPayment(idSale, payment)
            .then(idSale => idSale)
            .catch(this.handleError);
        }
      })
      .catch(this.handleError);
  }

  addPartialPayment(idSale: string, payment: number): Promise<string> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    var data = {
      id_sale: idSale,
      payment: payment,
      usr: this.usrService.get().usr
    }

    return this.http.put(this.uriPartialPayments, data, { headers: headers })
      .toPromise()
      .then(r => {

        return r;
      })
      .catch(this.handleError);
  }

  closePartial(sale_id: string, partial_id: string): Promise<boolean> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.delete(this.uriPartial + "/" + sale_id + "/" + partial_id)
      .toPromise()
      .then((r) => {
        r = r.json();
        return r.ok;
      })
      .catch(this.handleError);
  }

  getPartials(client: string): Promise<any[]> {
    return this.http.get(this.uriPartial
      + "?client=" + client
      // + "&end=" + end
      // + (usr ? "&usr=" + usr : "")
    )
      .toPromise()
      .then((r) => {
        return r.json().data as Partial[];
      })
      .catch(this.handleError);
  }

  getPartialCut(init_date: any, end_date: any = null): Promise<any[]> {
    return this.http.get(this.uriPartialsCut
      + "?init_date=" + init_date
      + "&usr=" + this.usrService.get().usr
      + (end_date ? "&end_date=" + end_date : "")
    )
      .toPromise()
      .then((r) => {
        return r.json().data as Partial[];
      })
      .catch(this.handleError);
  }
}
