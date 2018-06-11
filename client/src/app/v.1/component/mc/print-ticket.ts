import { Component, OnInit, Input, EventEmitter, ViewChild } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { SaleService } from '../../services/mc/sale.service';
import { Assets } from '../../../assets';
import { MdlDialogComponent } from '@angular-mdl/core';

import { Phys } from '../../prots/phys';

import { UsrService } from '../../services/usr.service';
import { PhysService } from '../../services/phys.service';
import { McService } from '../../services/mc/mc.service'

@Component({
  selector: 'print-mi-ticket',
  templateUrl: './print-ticket.html',
  styleUrls: ['./print-ticket.css'],
  providers: [
    SaleService,
    PhysService,
    McService,
    Assets,
    Location, { provide: LocationStrategy, useClass: PathLocationStrategy }
  ]
})

export class PrintMcTicket implements OnInit {
  @ViewChild('printConfirm') private printConfirm: MdlDialogComponent;
  sale: any;
  saleTotals: any;
  paymentModel: any;
  noPrints: number = 0;
  asset;
  physHash;

  constructor(
    private saleService: SaleService,
    private activatedRoute: ActivatedRoute,
    private assets: Assets,
    private router: Router,
    private usrService: UsrService,
    private physService: PhysService,
    private mcService: McService,
    private location: Location
  ) {

  }

  ngOnInit(): void {
    this.assets.getAssets()
      .then((a) => {
        this.asset = a["config"];
      })
      .catch((err) => this.handleError);


    this.paymentModel = JSON.parse(localStorage.getItem("paymentInfo"))
    this.paymentModel["payment"] = this.paymentModel["paymentType"] == "cash"
      ? "Efectivo"
      : "Tarjeta"

    console.log(this.paymentModel)

    this.getSale()
  }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }

  findPhyss(): void {
    var result = {}
    this.physService.getPhyss()
      .then((x) => {
        for (var i = 0; i < x.length; i++)
          result[x[i]._id] = x[i]

        this.physHash = result;
      });
  }

  getPhys(mc): string {
    return this.physHash[mc.phys].name;
  }

  getUsr(): any {
    return this.usrService.get()["name"];
  }

  findMc(id): Promise<string> {
    return this.mcService.getMc(id)
      .then(x => {
        return "asd"
      })
      .catch(this.handleError)
  }

  private getSale(): void {
    this.activatedRoute.params
      .switchMap((params: Params) => {
        return this.saleService.getSale(params["id"])
          .then(x => {
            this.sale = x
            this.saleTotals = this.getSaleTotals(x)
          })
          .catch(this.handleError)
      })
      .subscribe();
  }

  getSaleTotals(sale): any {
    return sale.mcs.map((x) => {
      return {
        cat: 0,
        subtotal: x.sale_price,
        saving: (x.sale_price - x.price),
        total: x.sale_price,
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

  getTotalAsText(): string {
    return this.assets.getNumToText(this.getTotal());
  }

  endProcess(): void {
    this.printConfirm.close();

    this.location.back();
  }

  tryPrint(): void {
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
