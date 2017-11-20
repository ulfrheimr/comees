import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {Cat} from '../../prots/mi/cat';

import { config } from '../../config';

@Injectable()
export class CatService {
  private miUrl = config.mi + '/cats';

  constructor(private http: Http) { }

  getCats(): Promise<Cat[]> {
    return this.http.get(this.miUrl)
      .toPromise()
      .then(r => r.json().data as Cat)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }
}
