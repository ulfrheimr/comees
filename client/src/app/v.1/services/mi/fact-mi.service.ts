import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { FactMI } from '../../prots/mi/fact-mi';

import { config } from '../../config';

@Injectable()
export class FactMIService {
  private uri = config.mi + '/fact_mis';
  private factMIuri = config.mi + '/fact_mi';

  constructor(private http: Http) { }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }

  getFactMIs(provider): Promise<FactMI[]> {
    return this.http.get(this.uri + "/" + provider)
      .toPromise()
      .then(r => {
        return r.json().data as FactMI[]
      })
      .catch(this.handleError);
  }

  getFactMI(IDMI: string): Promise<FactMI[]> {
    return this.http.get(this.factMIuri + "/" + IDMI)
      .toPromise()
      .then(r => {
        return r.json().data as FactMI
      })
      .catch(this.handleError);
  }

  putFactMIPrice(factMI): Promise<FactMI[]> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    var data = {
      price: factMI.price,
      id_provider: factMI.id_provider,
      id_mi: factMI.id_mi
    };

    return this.http.put(this.uri, data, { headers: headers })
      .toPromise()
      .then(r => r.json().data)
      .catch(this.handleError);
  }
}
