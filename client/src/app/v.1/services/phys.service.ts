import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { config } from '../config'

import { Phys } from '../prots/phys'

import 'rxjs/add/operator/toPromise';

@Injectable()
export class PhysService {
  // private uri = config.cc + '/usrs';
  private physsUri = config.cc + '/physs';

  constructor(
    private http: Http
  ) {

  }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }

  getPhyss(): Promise<Phys[]> {
    return this.http.get(this.physsUri)
      .toPromise()
      .then(r => r.json().data as Phys[])
      .catch(this.handleError);
  }
}
