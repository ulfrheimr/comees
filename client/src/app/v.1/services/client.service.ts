import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Client } from '../prots/client';

import { config } from '../config';

@Injectable()
export class ClientService {

  private clientUrl = config.cc + '/clients';

  constructor(private http: Http) { }

  getClients(search: string, by: string = ""): Promise<Client[]> {

    return this.http.get(this.clientUrl + "?search=" + search +
      (by != "" ? "&by=" + by : ""))
      .toPromise()
      .then(r => r.json().data as Client)
      .catch(this.handleError);
  }

  createClient(c: Client): Promise<Client> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    var data = c

    return this.http.put(this.clientUrl, data, { headers: headers })
      .toPromise()
      .then(r => {
        return r.json().data as Client;
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }
}
