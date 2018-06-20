import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/mergeMap';

import { UsrService } from '../../services/usr.service';

import { MiSale } from '../../prots/mi/sale';

import { config } from '../../config';
import * as moment from 'moment/moment'

@Injectable()
export class SaleService {
  private uri = config.mi + '/sales'
  // private uriPartial = config.mc + '/partials'
  //
  // private uriPartialPayments = config.mc + '/partial_payments'
  // private uriPartialsCut = config.mc + '/partials_cut'

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

  makeSale(sale: any): Promise<string> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    var data = {
      usr: this.usrService.get().usr,
      payments: sale.payments.map((x) => {
        return {
          paymentType: this.paymentTypes[x.paymentType],
          paymentAccount: x.paymentAccount,
          auth: x.auth,
          payment: x.payment
        }
      }),
      mis: sale.mis
    };

    return this.http.put(this.uri, data, { headers: headers })
      .toPromise()
      .then(r => r.json().data)
      .catch(this.handleError);
  }


  getSale(id: string): Promise<any[]> {
    return this.http.get(this.uri + "/" + id)
      .toPromise()
      .then(r => {
        let sale: MiSale = r.json().data as MiSale;

        return sale
      })
      .catch(this.handleError);
  }

  getSales(init: string, end: string = null, usr: string = null): Promise<any[]> {
    let postUri: string;
    let query = "?init=" + moment(init).format("YYYY-MM-DD")
      + (end ? "&end=" + moment(end).format("YYYY-MM-DD") : "")
      + (usr ? "&usr=" + usr : "")

    console.log(query)
    return this.http.get(this.uri
      + query)
      .toPromise()
      .then((r) => {
        let sales: MiSale[] = r.json().data as MiSale[];

        return sales;
      })
      .catch(this.handleError);
  }
  //
  // //PARTIAL
  // makePartial(partial: any): Promise<string> {
  //   var headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   var data = {
  //     usr: "zapatito",
  //     // usr: this.usrService.get().usr,
  //     payments: partial.payments.map((x) => {
  //       return {
  //         paymentType: this.paymentTypes[x.paymentType],
  //         paymentAccount: x.paymentAccount,
  //         auth: x.auth,
  //         payment: x.payment
  //       }
  //     }),
  //     mcs: partial.mcs,
  //     client: partial.client,
  //     client_name: partial.client_name
  //   };
  //
  //
  //
  //
  //   return this.http.put(this.uriPartial, data, { headers: headers })
  //     .toPromise()
  //     .then(r => r.json().data)
  //     .catch(this.handleError);
  // }
  //
  // getPartials(client: string): Promise<any[]> {
  //   return this.http.get(this.uriPartial
  //     + "?client=" + client)
  //     .toPromise()
  //     .then((r) => {
  //       return r.json().data as McSale
  //     })
  //     .catch(this.handleError);
  // }
}
