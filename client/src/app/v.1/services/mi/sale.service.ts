import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/mergeMap';

import { UsrService } from '../../services/usr.service';

import { MiSale } from '../../prots/mi/sale';

import { config } from '../../config';

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

    console.log("GETTING SALE")
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
