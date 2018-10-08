import { Component, OnInit, Input, Output, ViewChild } from '@angular/core';

import { Patient as PatientModel } from '../../prots/mc/patient';
import { PatientService } from '../../services/mc/patient.service';

import { MdlDialogComponent } from '@angular-mdl/core';

@Component({
  selector: 'patients',
  templateUrl: './patient.html',
  styleUrls: ['./patient.css'],
  providers: [
    PatientService
  ]
})

export class Patient implements OnInit {
  private pageModel
  @ViewChild('confirmAdd') private confirmAdd: MdlDialogComponent;
  patients: PatientModel[] = []
  additionalInfoType: any[] = [
    {
      type: 1,
      desc: "Dentista"
    }]
  selectedPatient: PatientModel
  additionalInfo: any = {
    1: {
      "store": false,
      "i": {}
    },
    2: {
      "store": false,
      "i": {}
    }
  }

  constructor(
    private patientService: PatientService
  ) {

  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  ngOnInit(): void {
    this.initialize()
  }

  initialize(): void {
    this.confirmAdd.close()
    this.pageModel = {
      hint: "",
      errorMsgs: [],
      action: "search",
      addedPatient: ""
    }

    this.selectedPatient = {
      name: "",
      gender: 1,
      age: null,
      address: {},
      phone: "",
      marital_status: 1,
      additional_info: []
    }
  }

  findPatients(): void {
    this.patientService.getPatients(this.pageModel.hint)
      .then((r) => {
        this.patients = r;
        console.log(r)
      })
      .catch(this.handleError)
  }

  registerPatient(): void {
    let addInfo = Object.keys(this.additionalInfo).filter((x) => {
      if (this.additionalInfo[x].store) return true

      return false
    }).map((x) => {
      return {
        "type_info": x,
        "i": this.additionalInfo[x].i
      }
    })

    this.selectedPatient["additional_info"] = addInfo
    this.patientService.updatePatient(this.selectedPatient)
      .then((r) => {
        this.pageModel.addedPatient = r["_id"]
        this.confirmAdd.show()
      })
      .catch(this.handleError)
  }

  cancelEditPatient(): void {
    this.pageModel.action = "search"
    this.initialize()
  }

  modifyPatient(patient: PatientModel): void {
    this.pageModel.action = "edit"
    this.selectedPatient = patient

    let addInfo = this.selectedPatient["additional_info"]

    let res: any[] = []
    for (var a in addInfo) {
      let info = addInfo[a]

      this.additionalInfo[info["type_info"]] = {
        "store": true,
        "i": info["i"]
      }
    }
  }

  showPatient(patient: PatientModel): void {
    this.pageModel.action = "show"
    this.selectedPatient = patient

    let addInfo = this.selectedPatient["additional_info"]

    let res: any[] = []
    for (var a in addInfo) {
      let info = addInfo[a]

      this.additionalInfo[info["type_info"]] = {
        "store": true,
        "i": info["i"]
      }
    }
  }

  confirm(): void {
    this.confirmAdd.show()
  }

}
