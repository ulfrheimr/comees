import { Component, OnInit, Input, EventEmitter, ViewChild } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { MdlDialogComponent } from '@angular-mdl/core';

import { Assets } from '../../../assets';

import { Mi } from '../../prots/mi/mi'
import { PassPrint } from '../pass-print';
import { UsrService } from '../../services/usr.service';

@Component({
  selector: 'print',
  templateUrl: './print.html',
  styleUrls: ['./print.css'],
  providers: [
    Assets,
    Location, { provide: LocationStrategy, useClass: PathLocationStrategy }
  ]
})

export class Print implements OnInit {
  @ViewChild('printConfirm') private printConfirm: MdlDialogComponent;
  pageModel;
  timestamp;
  typePrint: string;
  total1: number;
  poolToPrint: any[];
  noPrints: number = 0;
  asset;

  constructor(
    private passPrint: PassPrint,
    private router: Router,
    private assets: Assets,
    private usrService: UsrService,
    private location: Location
  ) {

  }

  ngOnInit(): void {
    this.timestamp = new Date();
    this.pageModel = {
      ready: false
    }

    this.assets.getAssets()
      .then((a) => {
        this.asset = a["config"];
      })
      .catch((err) => this.handleError);

    this.getPrintingObject()
    this.typePrint = this.passPrint._type
  }

  goBack(): void {
    this.printConfirm.close();
    this.location.back();
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  getUsr(): any {
    return this.usrService.get().name
  }

  getPrintingObject(): any[] {
    switch (this.passPrint._type) {
      case ("mi"):
        this.getTemporalMis()
          .then((mis) => {
            this.poolToPrint = mis;
            this.pageModel.ready = true;
          })
          .catch(this.handleError)
        break;
      case ("mc"):
        this.getTemporalMcs()
          .then((mcs) => {
            console.log("HERE")
            console.log(mcs)
            this.poolToPrint = mcs;
            this.pageModel.ready = true;
          })
          .catch(this.handleError)
        break;
      // case ("estimation"):
      //   this.getTemporalEstimation()
      //     .then((prods) => {
      //       console.log(prods)
      //       this.poolToPrint = prods;
      //       this.pageModel.ready = true;
      //     })
      //     .catch(this.handleError)
      //   break;
      default:
        return null;
    }
  }

  getTemporalMcs(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      if (!this.passPrint.printObjects)
        reject("No Mcs found");

      console.log(this.passPrint)

      let res: any[] = this.passPrint.printObjects.map((x) => {
        return {
          "f1": x.qty,
          "f2": x.mc.name,
          "f3": parseFloat(x.mc.sale_total),
          "f5": parseFloat(x.mc.sale_total)
        }
      });
      resolve(res);
    });
  }

  getTemporalMis(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      if (!this.passPrint.printObjects)
        reject("No MIs found");

      let res: any[] = this.passPrint.printObjects.map((x) => {
        return {
          "f1": x.qty,
          "f2": x.mi.name,
          "f3": x.mi.price,
          "f5": x.mi.price * x.qty
        }
      });
      resolve(res);
    });
  }

  getFields(): any {
    return this.passPrint.fields;
  }

  getTotal1(): number {
    this.total1 = this.poolToPrint
      .map((x) => parseFloat(x.f5))
      .reduce((x, y) => x + y, 0);


    return this.total1
  }

  getTotal2(): number {
    return this.passPrint.registerPayment;
  }

  getTotal3(): number {
    let res: number = this.total1 - this.passPrint.registerPayment;
    return res
  }

  tryPrint(): void {
    this.noPrints = 0;
    this.print();
  }

  print(): void {
    this.printConfirm.close();
    this.noPrints += 1;
    this.printConfirm.show();

    let printContents, popupWin;
    printContents = document.getElementById('ticket').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();

    popupWin.document.write(`
      <html>
        <head>
        <style>
        body{
          margin: 0;
        }
        * {
          font-family: 'Arial';
          text-transform: uppercase;
          font-size: 2.7mm;
        }

        .enhaced-ticket {
          font-size: 3.3mm;
        }

        table {
          position: relative;
          width: 100%;
        }

        td {
          padding: 1px;
        }

        hr {
          margin: 2mm 0mm 2mm 0mm;
          height: 1px;
          border: none;
          background-color: black;
        }

        .top-container {
          display: inline-block;
          text-align: center;
        }

        .right{
          text-align: right;
        }

        .ticket-container {
          width: 54mm;
        }

        .main-span-ticket {
          padding-right: 4mm;
          margin: 0 auto;
        }

        .logo-container {
          text-align: center;
          width: 100%;
          margin: 100%;
          margin: 0 auto;
        }

        .logo-container p {
          padding-top: 1mm;
          margin: 0 auto;
        }

        .logo {
          padding: 1mm;
          width: 100%;
          margin: 0 auto;
        }

        .bold {
          font-weight: bold;
        }

        .col1 {
          width:15%;
        }
        .col3 {
          width: 20%;
        }

        .sale td {
          text-align: right;
        }

        .totals {
          display: inline-block;
          padding-top: 5mm;
          width: 100%;
        }

        .text-total {
          display: inline-block;
          padding-top: 2mm;
          width: 80%;
          text-align: justify;
          line-height: 1.2em;
          font-weight: bold;
        }

        .totals>div {
          width: 70%;
          float: right;
        }

        .slogan {
          padding-top: 3mm;
          text-align: right;
        }

        .client-opts * {
          font-size: 2.2mm;
        }
          </style>
        </head>
    <body onload="window.print();close();">${printContents}</body>
      </html>`
    );
    popupWin.document.close();

  }
}
