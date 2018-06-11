import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { config } from '../config'
import 'rxjs/add/operator/toPromise';

import { Usr } from '../prots/usr'
import * as moment from 'moment/moment';;


@Injectable()
export class UsrService {
  private uri = config.cc + '/salesman';
  private usrUri = config.cc + '/login';

  constructor(
    private http: Http
  ) {

  }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }

  setUsr(usr): any {
    sessionStorage.setItem("usr", usr.usr)
    sessionStorage.setItem("name", usr.name)
    sessionStorage.setItem("id", usr.id)
    sessionStorage.setItem("role", JSON.stringify(usr.role))
    sessionStorage.setItem("token", usr.token)
  }

  init(usr: string, pass: string): any {
    var headers = new Headers();
    headers.append("Authorization", "Basic " + btoa(usr + ":" + pass));
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    var data = {
      usr: usr,
      pass: pass
    }

    return new Promise((resolve, reject) => {
      return this.http.post(this.usrUri, {}, { headers: headers })
        .toPromise()
        .then(r => {
          r = r.json();

          if (r) {
            this.setUsr(r["usr"]);
            resolve(r["usr"].role);
          }
          else
            resolve(null);

        })
        .catch((err) => {
          reject(err);
          this.handleError(err)
        });
    });
  }

  close(): Promise<void> {
    var headers = new Headers();

    headers.append("x-username", this.get()["usr"]);
    headers.append("x-token", this.get()["token"]);
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    return this.http.delete(this.usrUri, { headers: headers })
      .toPromise()
      .then(r => {
        r = r.json();

      })
      .catch(this.handleError);

  }

  getUsrs(): Promise<Usr[]> {
    return this.http.get(this.uri)
      .toPromise()
      .then(r => r.json().data as Usr[])
      .catch(this.handleError);
  }

  getFirstLoginTime(is_closed: boolean = undefined): any {
    var headers = new Headers();

    headers.append("x-username", this.get()["usr"]);
    headers.append("x-token", this.get()["token"]);
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    return this.http.get(this.usrUri +
      (is_closed != undefined ? "?is_closed=" + is_closed : "")
      , { headers: headers })
      .toPromise()
      .then(r => {
        r = r.json().data;

        return {
          init_login: r["init_login"],
          is_closed: r["is_closed"],
          end_login: !r["is_closed"] ? undefined : r["end_login"]
        }

      })
      .catch((err) => {
        this.handleError(err)
        throw err
      });

  }

  get(): any {
    return {
      usr: sessionStorage.getItem("usr"),
      role: JSON.parse(sessionStorage.getItem("role")),
      id: sessionStorage.getItem("id"),
      name: sessionStorage.getItem("name"),
      token: sessionStorage.getItem("token")
    }
  }
}
