import { Component, OnInit, Input, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { MdlDialogComponent } from '@angular-mdl/core';

import { PassMi } from './component/mi/pass-mi';
import { Assets } from './assets';
import { Mi } from './prots/mi/mi'

// import { UsrService } from './services/usr.service';

@Component({
  selector: 'print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css'],
  providers: [
    Assets
  ]
})

export class PrintComponent implements OnInit {
  @ViewChild('printConfirm') private printConfirm: MdlDialogComponent;
  pageModel;
  timestamp;
  total1: number;
  poolToPrint: any[];
  noPrints: number = 0;
  asset;

  constructor(
    private passMi: PassMi,
    private router: Router,
    private assets: Assets,
    // private usrService: UsrService
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

    this.getPrintingObject();
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  getAsset(key): any {
    // return this.config.get(key);
  }

  getPrintingObject(): any[] {
    console.log(PassMi)
    if (this.passMi._type == "mi") {
      this.getTemporalMis()
        .then((mis) => {
          this.poolToPrint = mis;
          this.pageModel.ready = true;
        })
        .catch(this.handleError)
    }

    return null;
  }

  getTemporalMis(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      if (!this.passMi.mis)
        reject("No MIs found");

      let res: any[] = this.passMi.mis.map((x) => {
        return {
          "f1": x.qty,
          "f2": x.name,
          "f3": x.price_discount
        }
      });
      resolve(res);
    });
  }

  getFields(): any {
    return this.passMi.fields;
  }

  getUsr(): any {
    // return this.usrService.get()["name"];
  }

  endProcess(): void {
    this.printConfirm.close();
    var url = this.router.url.split('/');
    let routeUrl: string = url.slice(1, url.length - 1).reduce((x, y) => x + "/" + y, "");
    this.router.navigate(['.' + routeUrl + "/mi"])
  }

  getTotal1(): string {
    this.total1 = this.poolToPrint
      .map((x) => parseFloat(x.f3))
      .reduce((x, y) => x + y, 0);


    return this.total1.toFixed(2);
  }

  getTotal2(): string {
    return this.passMi.registerPayment.toFixed(2);
  }

  getTotal3(): string {
    let res: number = this.total1 - this.passMi.registerPayment;
    return res.toFixed(2);
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
