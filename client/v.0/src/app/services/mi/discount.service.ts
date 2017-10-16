import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Coupon } from '../../prots/coupon';
import { config } from '../../config';

@Injectable()
export class MiDiscountService {
  private couponUrl = config.mi + '/coupons';
  private refMiUrl = config.mi + '/phys_discounts';

  // private couponUrl = config.cc + '/coupons';
  // private refMiUrl = config.mi + '/phys_discounts';
  //
  constructor(private http: Http) { }
  //
  // getCoupons(): Promise<Coupon[]> {
  //   return this.http.get(this.couponUrl + "?init=2011-1-1&end=2012-1-1")
  //     .toPromise()
  //     .then(r => r.json().data as Coupon)
  //     .catch(this.handleError);
  // }
  //
  getCoupon(code: string): Promise<Coupon> {
    return this.http.get(this.couponUrl + "/" + code)
      .toPromise()
      .then(r => {
        var data = r.json().data

        if (data.length != 1)
          throw {
            message: "No se ha encontrado el cupón"
          };

        data = data[0];

        data["init_date"] = (data["init_date"].replace(/-/gi, "/")).split("T")[0];
        data["end_date"] = (data["end_date"].replace(/-/gi, "/")).split("T")[0];

        let init_date: Date = new Date(data["init_date"])
        let end_date: Date = new Date(data["end_date"])

        if (new Date() >= end_date && new Date() <= init_date)
          throw {
            message: "Este cupón ha expirado"
          };

        return data as Coupon
      })
      .catch(this.handleError);
  }

  getRefMiDisc(code: string): Promise<number> {
    return this.http.get(this.refMiUrl + "/" + code + "?by=code")
      .toPromise()
      .then(r => {
        var ok = r.json().ok;
        var data = r.json().discount;

        if (ok == 0)
          throw { message: "No se ha encontrado el cupón" };

        if (data == 0)
          throw { message: "No se ha encontrado el cupón" };

        return data;
      })
      .catch(this.handleError);
  }


  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error);
  }
}
