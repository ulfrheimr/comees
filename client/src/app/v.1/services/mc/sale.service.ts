import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/mergeMap';

import { UsrService } from '../../services/usr.service';

import { McSale } from '../../prots/mc/sale'
import { SoldMc } from '../../prots/mc/sold-mc'
// import { Partial } from '../../prots/partial';

import { config } from '../../config';

@Injectable()
export class SaleService {
  private uri = config.mc + '/sales'
  private uriPartial = config.mc + '/partials'

  private uriPartialPayments = config.mc + '/partial_payments'
  private uriPartialsCut = config.mc + '/partials_cut'

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

  makeSale(mcs: SoldMc[], payments): Promise<string> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    var data = {
      usr: this.usrService.get().usr,
      payments: payments.map((x) => {
        return {
          paymentType: this.paymentTypes[x.paymentType],
          paymentAccount: x.paymentAccount,
          auth: x.auth,
          payment: x.payment
        }
      }),
      mcs: mcs
    };

    return this.http.put(this.uri, data, { headers: headers })
      .toPromise()
      .then(r => r.json().data)
      .catch(this.handleError);
    // return new Promise((resolve, reject) => {
    //   this.createSale(sale)
    //     .then((id) => {
    //       resolve(id)
    //     })
    //     .catch(this.handleError)
    // })
  }

  // private createSale(s: any): Promise<string> {
  //   var headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   var data = {
  //     usr: this.usrService.get().usr,
  //     payments: sale.payments.map((x) => {
  //       return {
  //         paymentType: this.paymentTypes[x.paymentType],
  //         paymentAccount: x.paymentAccount,
  //         auth: x.auth,
  //         payment: x.payment
  //       }
  //     }),
  //     mcs: sale.mcs
  //   };
  //
  //   return this.http.put(this.uri, data, { headers: headers })
  //     .toPromise()
  //     .then(r => r.json().data)
  //     .catch(this.handleError);
  // }

  getSale(id: string): Promise<any[]> {
    return this.http.get(this.uri + "/" + id)
      .toPromise()
      .then(r => {
        let sale: McSale = r.json().data as McSale;
        var result = {
          timestamp: sale.timestamp,
          // payment: this.typeToPayment[sale.paymentType],
          // isCard: !(this.typeToPayment[sale.paymentType] == "01"),
          mcs: sale.mcs
        }

        return result
      })
      .catch(this.handleError);
  }

  //PARTIAL
  makePartial(partial: any): Promise<string> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    var data = {
      usr: this.usrService.get().usr,
      payments: partial.payments.map((x) => {
        return {
          paymentType: this.paymentTypes[x.paymentType],
          paymentAccount: x.paymentAccount,
          auth: x.auth,
          payment: x.payment
        }
      }),
      mcs: partial.mcs,
      client: partial.client,
      client_name: partial.clientName
    };

    return this.http.put(this.uriPartial, data, { headers: headers })
      .toPromise()
      .then(r => r.json().data)
      .catch(this.handleError);
  }

  getPartials(client: string): Promise<any[]> {
    console.log(client)
    return this.http.get(this.uriPartial
      + "?client=" + client)
      .toPromise()
      .then((r) => {
        return r.json().data as McSale
      })
      .catch(this.handleError);
  }

  addMcToPartial(mc): void {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // mc['id_sale'] = idSale;
    // console.log(mc)

    // return this.http.post(this.uri, mc, { headers: headers })
    //   .toPromise()
    //   .then(r => {
    //     if (mcs.length > 0)
    //       return this.addMc(idSale, mcs)
    //         .then(idSale => idSale)
    //         .catch(this.handleError);
    //   })
    //   .catch(this.handleError);
  }

  addPaymentToPartial(payment, saleId, close = false): Promise<number> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    var data = {
      sale: saleId,
      usr: this.usrService.get().usr,
      payment: payment,
      close: close
    };

    return this.http.post(this.uriPartial, data, { headers: headers })
      .toPromise()
      .then((r) => {
        return r.json().data as number
      })
      .catch(this.handleError);
  }

  // makeSale(sale: McSale): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //
  //     this.createSale(sale)
  //       .then((id) => {
  //         var res = sale.mcs.map((x) => {
  //           var q = {
  //             qty: x["qty"],
  //             mc: x["mc"],
  //             sale_price: x["sale_total"],
  //             phys: x["phys"]._id,
  //             observations: x["observations"]
  //           }
  //
  //           return q;
  //         });
  //
  //         this.addMc(id, res)
  //           .then(idSale => {
  //             resolve(id)
  //           })
  //           .catch(this.handleError)
  //       })
  //       .catch(this.handleError)
  //   });
  // }
  //
  // private addMc(idSale: string, mcs: any[]): Promise<string> {
  //   let mc: any = mcs.pop();
  //
  //   var headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   mc['id_sale'] = idSale;
  //
  //   return this.http.post(this.uri, mc, { headers: headers })
  //     .toPromise()
  //     .then(r => {
  //       if (mcs.length > 0)
  //         return this.addMc(idSale, mcs)
  //           .then(idSale => idSale)
  //           .catch(this.handleError);
  //     })
  //     .catch(this.handleError);
  // }
  //

  //
  // private createPartial(s: any): Promise<string> {
  //   var headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   var data = {
  //     client: s.client._id,
  //     client_name: s.client.name,
  //   };
  //
  //   return this.http.put(this.uriPartial, data, { headers: headers })
  //     .toPromise()
  //     .then(r => r.json().data._id)
  //     .catch(this.handleError);
  // }
  //
  // closePartial(sale_id: string, partial_id: string): Promise<boolean> {
  //   var headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   return this.http.delete(this.uriPartial + "/" + sale_id + "/" + partial_id)
  //     .toPromise()
  //     .then((r) => {
  //       r = r.json();
  //       return r.ok;
  //     })
  //     .catch(this.handleError);
  // }
  //
  // private addPartialMc(idSale: string, mcs: any[], payment): Promise<string> {
  //   let mc: any = mcs.pop();
  //
  //   console.log(mcs.length)
  //
  //   var headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   mc['id_sale'] = idSale;
  //
  //   return this.http.post(this.uriPartial, mc, { headers: headers })
  //     .toPromise()
  //     .then(r => {
  //       console.log(r)
  //       if (mcs.length > 0)
  //         return this.addPartialMc(idSale, mcs, payment)
  //           .then(idSale => idSale)
  //           .catch(this.handleError);
  //       else {
  //         return this.addPartialPayment(idSale, payment)
  //           .then(idSale => idSale)
  //           .catch(this.handleError);
  //       }
  //     })
  //     .catch(this.handleError);
  // }
  //
  // addPartialPayment(idSale: string, payment: number): Promise<string> {
  //   var headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   var data = {
  //     id_sale: idSale,
  //     payment: payment,
  //     usr: this.usrService.get().usr
  //   }
  //
  //   return this.http.put(this.uriPartialPayments, data, { headers: headers })
  //     .toPromise()
  //     .then(r => {
  //
  //       return r;
  //     })
  //     .catch(this.handleError);
  // }
  //

  //

  //
  // getSales(init: string, end: string = null, usr: any = null): Promise<any[]> {
  //   return this.http.get(this.uri
  //     + "?init=" + init
  //     + (end ? "&end=" + end : "")
  //     + (usr ? "&usr=" + usr : ""))
  //     .toPromise()
  //     .then((r) => {
  //       let sales: McSale[] = r.json().data as McSale[];
  //
  //       return sales;
  //     })
  //     .catch(this.handleError);
  // }
  //
  // getPartialCut(init_date: any, end_date: any = null): Promise<any[]> {
  //   return this.http.get(this.uriPartialsCut
  //     + "?init_date=" + init_date
  //     + "&usr=" + this.usrService.get().usr
  //     + (end_date ? "&end_date=" + end_date : "")
  //   )
  //     .toPromise()
  //     .then((r) => {
  //       return r.json().data as Partial[];
  //     })
  //     .catch(this.handleError);
  // }
}
