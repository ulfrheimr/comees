import { Component, OnInit, Input, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { SaleService } from '../../services/mi/sale.service';
import { Assets } from '../../assets';
import { MdlDialogComponent } from '@angular-mdl/core';
//
// import { UsrService } from '../services/usr.service';

@Component({
  selector: 'print-mi-ticket',
  templateUrl: './print-ticket.component.html',
  styleUrls: ['./print-ticket.component.css'],
  providers: [
    SaleService,
    Assets
  ]
})

export class PrintMiTicketComponent implements OnInit {
  @ViewChild('printConfirm') private printConfirm: MdlDialogComponent;
  sale: any;
  saleTotals: any;
  paymentModel: any;
  noPrints: number = 0;
  asset;

  constructor(
    private saleService: SaleService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private assets: Assets,
    private router: Router,
    // private usrService: UsrService
  ) { }
  //
  ngOnInit(): void {
    this.assets.getAssets()
      .then((a) => {
        this.asset = a["config"];
        console.log(this.asset)
      })
      .catch((err) => this.handleError);


    this.paymentModel = {
      payment: localStorage.getItem("payment"),
      change: parseFloat(localStorage.getItem("change")).toFixed(2)
    }

    this.getSale()
  }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }
  //
  // getUsr(): any {
  //   return this.usrService.get()["name"];
  // }
  //
  private getSale(): void {
    this.activatedRoute.params
      .switchMap((params: Params) => {
        return this.saleService.getSale(params["id"])
          .then(x => {
            this.sale = x
            this.saleTotals = this.getSaleTotals(x);
          })
          .catch(this.handleError)
      })
      .subscribe();
  }

  getSaleTotals(sale): any {
    console.log(sale)
    return sale.mis.map((x) => {
      var cat = 0.16;
      var subtotal = x.price * (1 - cat)

      return {
        cat: x.sale_price - subtotal,
        subtotal: subtotal,
        saving: (x.sale_price - x.price),
        total: x.price,
        total_disc: x.sale_price,
        qty: x.qty
      };
    });
  }

  getSubtotal(): number {
    return this.saleTotals
      .map(x => x.subtotal)
      .reduce((x, y) => x + y, 0)
      .toFixed(2);
  }

  getSaving(): number {
    return this.saleTotals
      .map(x => x.saving)
      .reduce((x, y) => x + y, 0)
      .toFixed(2);
  }

  getCat(): number {
    return this.saleTotals
      .map(x => x.cat)
      .reduce((x, y) => x + y, 0)
      .toFixed(2);
  }

  getTotal(): number {
    return this.saleTotals
      .map(x => x.total)
      .reduce((x, y) => x + y, 0)
      .toFixed(2);
  }

  getTotalDisc(): number {
    return this.saleTotals
      .map(x => x.total_disc)
      .reduce((x, y) => x + y, 0)
      .toFixed(2);
  }

  getTotalAsText(): string {
    return this.assets.getNumToText(this.getTotalDisc());
  }

  getQty(): number {
    return this.saleTotals
      .map(x => x.qty)
      .reduce((x, y) => x + y, 0);
  }

  endProcess(): void {
    this.printConfirm.close();

    // var url = this.router.url.split('/');
    // let routeUrl: string = url.slice(1, url.length - 2).reduce((x, y) => x + "/" + y, "");
    this.router.navigate(['./mi/sales']);
  }

  tryPrint(): void {
    this.noPrints -= 1;
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
