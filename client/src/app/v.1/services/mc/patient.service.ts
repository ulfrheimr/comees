import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { UsrService } from '../../services/usr.service';
import { Patient } from '../../prots/mc/patient';

import { config } from '../../config';

@Injectable()
export class PatientService {

  private patientUrl = config.mc + '/patients';

  constructor(
    private http: Http,
    private usrService: UsrService) { }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }

  getPatients(search: string): Promise<Patient[]> {
    return this.http.get(this.patientUrl + "?patient=" + search)
      .toPromise()
      .then(r => r.json().data as Patient[])
      .catch(this.handleError);
  }

  updatePatient(patient: Patient): Promise<any> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    var data = patient
    data["usr"] = this.usrService.get().usr

    console.log(data)

    return this.http.post(this.patientUrl, data, { headers: headers })
      .toPromise()
      .then((r) => {
        console.log(r.json())
        return r.json().data
      })
      .catch(this.handleError);
  }
}
