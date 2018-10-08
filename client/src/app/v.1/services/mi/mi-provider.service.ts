import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { MiProvider } from '../../prots/mi/mi-provider';

import { config } from '../../config';

@Injectable()
export class MiProviderService {
  private uri = config.mi + '/mi_providers';

  constructor(private http: Http) { }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }

  getMiProviders(): Promise<MiProvider[]> {
    return this.http.get(this.uri)
      .toPromise()
      .then(r => {
        return r.json().data as MiProvider[]
      })
      .catch(this.handleError);
  }
}
