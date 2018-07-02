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
  patients: PatientModel[] = []
  additionalInfoType: any[] = [
    {
      type: 1,
      desc: "Dentista"
    }]
  selectedPatient: PatientModel
  additionalInfo: any = {
  }

  constructor(
    private patientService: PatientService
  ) {
    this.pageModel = {
      hint: "",
      errorMsgs: [],
      action:"search"
      // addNewClient: false,
      // isClientCorrect: false,
    }

    this.initialize()
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  ngOnInit(): void {
  }

  initialize(): void {
    this.selectedPatient = {
      name: "",
      gender: 1,
      age: null,
      address: {},
      phone: "",
      marital_status: 1,
      additional_info: {
        i: {}
      }
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
    console.log(this.additionalInfo)
    // if (this.additionalInfo[aft.type]) {
    //   this.selectedPatient["type"] = this.selectedPatient
    // }
    this.patientService.updatePatient(this.selectedPatient)
      .then((r) => {
        console.log(r)
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
  }

  showPatient(patient: PatientModel): void {
    this.pageModel.action = "show"
    this.selectedPatient = patient
  }

}
