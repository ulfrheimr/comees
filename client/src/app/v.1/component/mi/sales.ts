import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Mi } from '../../prots/mi/mi';
import { MiSale } from '../../prots/mi/sale'
import { SoldMi } from '../../prots/mi/sold-mi'

import { MiService } from '../../services/mi/mi.service'
import { SaleService } from '../../services/mi/sale.service'

import { PassPrint } from '../pass-print';

import { MdlDialogComponent } from '@angular-mdl/core';

@Component({
  selector: 'mi-sales',
  templateUrl: './sales.html',
  styleUrls: ['./sales.css'],
  providers: [
    MiService,
    // MiDiscountService,
    SaleService
  ]
})

export class MiSales implements OnInit {
  @ViewChild('paymentConfirmDialog') private paymentConfirmDialog: MdlDialogComponent;

  pageModel
  mis: Mi[]
  miHash: any = {}
  sale: any[] = []

  constructor(
    private miService: MiService,
    private saleService: SaleService,
    private router: Router,
    private passPrint: PassPrint
  ) { }
  ngOnInit(): void {
    console.log("HELL")
    this.pageModel = {
      option: "create",
      hint: "",
      isSearching: false,
      confirmSale: false,
      // hintPartial: "",
      // selectPhys,
      // selectMc: false,
      // availableToBuy: false,
      //
      // partial: false,
      // toPay: false,
      // selectedClient: undefined,
      // selectedOMc: undefined
    }
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  //CREATE MI SALE
  findMis(): void {
    if (this.pageModel.hint != "") {
      this.miService.getMis(this.pageModel.hint)
        .then((x) => {
          this.mis = x
          this.pageModel.isSearching = true
        })
    }
  }

  addToSale(mi, add = true): void {
    if (this.miHash[mi._id]) {
      if (add)
        this.miHash[mi._id]["qty"] += 1
      else {
        this.miHash[mi._id]["qty"] -= 1

        if (this.miHash[mi._id]["qty"] == 0)
          delete this.miHash[mi._id]
      }
    } else {
      this.miHash[mi._id] = {
        qty: 1,
        mi: mi
      }
    }

    var prods = Object.keys(this.miHash).map((key, index) => {
      return this.miHash[key];
    });

    this.sale = prods
    this.pageModel.isSearching = false
    this.pageModel.hint = ""
  }

  getTotal(): number {
    var prods = Object.keys(this.miHash).map((key, index) => {
      return this.miHash[key];
    });

    return prods
      .map((x) => parseFloat(x.mi.price) * x.qty)
      .reduce((x, y) => x + y, 0);
  }

  makeSale(paymentInfo): void {
    console.log(this.sale)

    let mis: SoldMi[] = this.sale.map((x) => {
      return {
        qty: x.qty,
        mi: x.mi,
        salePrice: x.mi.price
      }
    })

    let s: MiSale = {
      mis: mis,
      payments: [{
        paymentType: paymentInfo.paymentType,
        paymentAccount: paymentInfo.paymentType != "cash" ? paymentInfo.cardDigits : "",
        auth: paymentInfo.paymentType != "cash" ? paymentInfo.cardAuth : "",
        payment: this.getTotal()
      }]
    }

    this.saleService.makeSale(s)
      .then((id) => {
        this.sendToPrint(id, paymentInfo)
      })
      .catch(this.handleError)
  }

  sendToPrint(id: string, paymentInfo: any): void {
    var url = this.router.url.split('/');
    let routeUrl: string = "/mi"
    let total: number = this.getTotal()

    localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));

    this.paymentConfirmDialog.close();
    this.router.navigate(['.' + routeUrl + '/print-ticket', id])
  }

  sendToEstimation(): void {
    let routeUrl: string = "/mi";
    this.passPrint.printObjects = this.sale
    this.passPrint._type = "mi"

    this.router.navigate(['.' + routeUrl, "print"])
  }

  //SALE WINDOW
  onPaymentConfirmed(e): void {
    this.makeSale(e)
  }

  onPaymentCancelled(e): void {
    this.paymentConfirmDialog.close()
  }

  //MI FOLLOWING
}
