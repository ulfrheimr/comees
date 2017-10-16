import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Mi } from '../../prots/mi/mi';

import { config } from '../../config';

@Injectable()
export class MiService {
  private miUrl = config.mi + '/mis';

  constructor(private http: Http) { }

  getMis(name: string): Promise<any[]> {
    console.log(this.miUrl + "?name=" + name)
    return this.http.get(this.miUrl + "?name=" + name)
      .toPromise()
      .then(r => r.json().data)
      .catch(this.handleError);
  }

  // changeMi(mi: any): Promise<boolean> {
  //   console.log("Sending")
  //   console.log(mi)
  //   var headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   var m = {
  //     _id: mi._id,
  //     name: mi.name,
  //     price: mi.price,
  //     desc: mi.description,
  //     catId: mi.category._id,
  //     delivery: mi.delivery_time,
  //     sample: mi.sample
  //   }
  //
  //   return this.http.post(this.miUrl + "/" + mi._id, m, { headers: headers })
  //     .toPromise()
  //     .then(r => {
  //       var ret_m = r.json().data_id;
  //       return mi._id == mi._id;
  //     })
  //     .catch(this.handleError);
  // }
  //
  // addMi(mi: any): Promise<Mi> {
  //   var headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   return this.http.put(this.miUrl, mi, { headers: headers })
  //     .toPromise()
  //     .then(r => r.json().data as Mi)
  //     .catch(this.handleError);
  // }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }
}
