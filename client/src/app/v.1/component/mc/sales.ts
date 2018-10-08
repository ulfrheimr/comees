import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { MomentModule } from 'angular2-moment/moment.module'

import { Mc } from '../../prots/mc/mc';
import { McSale } from '../../prots/mc/sale'
import { SoldMc } from '../../prots/mc/sold-mc'

import { Phys } from '../../prots/phys';

import { PassPrint } from '../pass-print';

import { PhysService } from '../../services/phys.service'
import { McService } from '../../services/mc/mc.service'
import { SaleService } from '../../services/mc/sale.service'

import { MdlDialogComponent } from '@angular-mdl/core';

@Component({
  selector: 'mc-sales',
  templateUrl: './sales.html',
  styleUrls: ['./sales.css'],
  providers: [
    McService,
    PhysService,
    SaleService
  ]
})

export class McSales implements OnInit {
  @ViewChild('paymentConfirmDialog') private paymentConfirmDialog: MdlDialogComponent;
  @ViewChild('partialConfirmation') private partialConfirmation: MdlDialogComponent;
  @ViewChild('addPartialPaymentDialog') private addPartialPaymentDialog: MdlDialogComponent;
  @ViewChild('closePartialDialog') private closePartialDialog: MdlDialogComponent;

  pageModel
  physs: Phys[]
  openMCs: any[] = []
  physHash
  mcs: Mc[] = []
  products: any[] = []
  mcHash: any = {};
  currentProduct: any = {}

  constructor(
    private mcService: McService,
    private physService: PhysService,
    private saleService: SaleService,
    private router: Router,
    private passPrint: PassPrint
  ) {

  }

  ngOnInit(): void {
    this.pageModel = {
      option: "create",
      hint: "",
      hintPartial: "",
      selectPhys: false,
      selectMc: false,
      availableToBuy: false,
      toConfirm: false,
      partial: false,
      toPay: false,
      selectedClient: undefined,
      selectedOMc: undefined,
      amountError: null
    }

    this.pageModel.selectPhys = true
    this.findPhyss()
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  //SHARED
  findPhyss(): void {
    var result = {}
    this.physService.getPhyss()
      .then((x) => {
        for (var i = 0; i < x.length; i++)
          result[x[i]._id] = x[i]

        this.physs = x
        this.physHash = result;
      })
  }

  findMcs(): void {
    if (this.pageModel.hint != "")
      this.mcService.getMcs(this.pageModel.hint)
        .then((x) => {
          this.mcs = x
        })
  }

  private setProducts(): void {
    var prods = Object.keys(this.mcHash).map((key, index) => {
      return this.mcHash[key];
    });

    this.products = prods;
    this.initStep()
  }

  initStep(): void {
    this.currentProduct = {}
    this.pageModel.selectPhys = false
    this.pageModel.selectMc = false
  }

  changeView(option): void {
    this.ngOnInit()
    this.pageModel.option = option
  }

  //Client selection
  onClientSelected(client: any): void {
    this.pageModel.toPay = true
    this.pageModel.selectedClient = client
  }

  //CREATE MC SALE
  selectPhys(ph): void {
    this.currentProduct.phys = ph
    this.pageModel.selectMc = true
  }

  selectMc(mc): void {
    this.currentProduct.mc = mc
    this.pageModel.availableToBuy = true

    this.addToSale()
  }

  addToSale(): void {
    if (this.mcHash[this.currentProduct.mc._id + "" + this.currentProduct.phys._id]) {
      this.mcHash[this.currentProduct.mc._id + "" + this.currentProduct.phys._id]["qty"] += 1;
      this.mcHash[this.currentProduct.mc._id + "" + this.currentProduct.phys._id].mc.suggested_price += this.currentProduct.mc.suggested_price
    } else {
      this.mcHash[this.currentProduct.mc._id + "" + this.currentProduct.phys._id] = {
        qty: 1,
        mc: this.currentProduct.mc,
        phys: this.physHash[this.currentProduct.phys._id],
      }
    }

    this.setProducts()
  }

  makeSale(paymentInfo): void {
    let mcs: SoldMc[] = this.products.map(x => {
      return {
        qty: x.qty,
        mc: {
          _id: x.mc._id,
          name: x.mc.name,
          suggestedPrice: x.mc.suggested_price
        },
        phys: x.phys._id,
        salePrice: x.mc.sale_total
      }
    })

    var payments = [{
      paymentType: paymentInfo.paymentType,
      paymentAccount: paymentInfo.paymentType != "cash" ? paymentInfo.cardDigits : "",
      auth: paymentInfo.paymentType != "cash" ? paymentInfo.cardAuth : "",
      payment: this.getTotal()
    }]

    this.saleService.makeSale(mcs, payments)
      .then((id) => {
        this.sendToPrint(id, paymentInfo)
      })
      .catch(this.handleError)
  }

  sendToPrint(id: string, paymentInfo: any): void {
    var url = this.router.url.split('/');
    let routeUrl: string = "/mc"
    let total: number = this.getTotal()

    localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));

    this.paymentConfirmDialog.close();
    this.router.navigate(['.' + routeUrl + '/print-ticket', id])
  }

  //SALE VALIDATION
  isAmountAllowed(): boolean {
    let ps = this.products.map((x) => x.mc["sale_total"])

    if (ps.filter(x => x == null).length > 0) {
      this.pageModel.amountError = "Debe ingresar los valores de los servicios"
      return false
    }

    if (ps.filter(x => isNaN(parseFloat(x))).length > 0) {
      this.pageModel.amountError = "Debe ingresar valores numéricos en los servicios"
      return false
    }

    return true
  }

  // Sale window
  onPaymentConfirmed(e): void {
    this.makeSale(e)
  }

  onPaymentCancelled(e): void {
    this.paymentConfirmDialog.close()
  }

  // MC FOLLOWING
  findPartials(): void {
    this.saleService.getPartials(this.pageModel.hintPartial)
      .then((omcs) => {

        this.openMCs = omcs.map((x) => {
          let total = x.mcs
            .map(mc => mc.sale_price)
            .reduce((x, y) => x + y, 0)

          let payments = x.payments
            .map(x => x.payment)
            .reduce((x, y) => x + y, 0)

          return {
            client: x.client,
            client_name: x.client_name,
            timestamp: x.timestamp,
            total: total,
            remaining: total - payments,
            instance: x
          }
        })

      })
      .catch(this.handleError)
  }

  makePartialPayment(paymentInfo): void {
    this.partialConfirmation.close()
    var mcs: SoldMc[] = this.products.map(x => {
      return {
        qty: x.qty,
        mc: {
          _id: x.mc._id,
          name: x.mc.name,
          suggestedPrice: x.mc.suggested_price
        },
        phys: x.phys._id,
        salePrice: x.mc.sale_total
      }
    })

    let s: McSale = {
      mcs: mcs,
      payments: [{
        paymentType: "cash",
        paymentAccount: "",
        auth: "",
        payment: paymentInfo.amount - paymentInfo.remain
      }],
      client: this.pageModel.selectedClient._id,
      clientName: this.pageModel.selectedClient.name
    }

    this.saleService.makePartial(s)
      .then((id) => {
        console.log(id)
        this.sendToPartialPrint(paymentInfo)
      })
      .catch(this.handleError)
  }

  sendToPartialPrint(paymentInfo): void {
    let routeUrl: string = "/mc";
    this.passPrint.printObjects = this.products
    this.passPrint.additionalInfo = {
      "is_partial": true,
      "payed": paymentInfo.amount - paymentInfo.remain,
      "payment": paymentInfo.amount - paymentInfo.remain,
      "remain": paymentInfo.remain
    }
    this.passPrint._type = "mc"

    this.router.navigate(['.' + routeUrl, "print"])
  }

  selectOMc(omc): void {
    this.pageModel.selectedOMc = omc

    this.products = omc.instance.mcs.map((x) => {
      let temp = {
        qty: x.qty,
        mc: x.mc,
        sale_price: x.sale_price
      }
      temp.mc["sale_total"] = x.sale_price
      return temp
    })

  }

  addPaymentToSale(): void {
    this.addPartialPaymentDialog.show()
  }

  closeSale(): void {
    this.closePartialDialog.show()
  }

  onAddedPartialConfirmed(e): void {
    this.addPartialPaymentDialog.close()
    this.saleService.addPaymentToPartial({
      payment: e.amount - e.remain,
      paymentType: "cash",
      paymentAccount: "",
      auth: ""
    },
      this.pageModel.selectedOMc.instance._id)
      .then((r) => {
        if (r == 1) {
          let total = this.products.map((x) => parseFloat(x.mc.sale_total))
            .reduce((x, y) => x + y, 0);

          let routeUrl: string = "/mc";
          this.passPrint._type = "mc"
          this.passPrint.additionalInfo = {
            "is_partial": true,
            "payment": e.amount - e.remain,
            "payed": total - e.remain,
            "remain": e.remain
          }
          this.passPrint.printObjects = this.products

          this.router.navigate(['.' + routeUrl, "print"])
        }
      })
      .catch(this.handleError)
  }

  onAddedPartialCancelled(e): void {
    this.addPartialPaymentDialog.close()
  }

  onPartialClosed(e): void {
    this.closePartialDialog.close()
    this.saleService.addPaymentToPartial({
      payment: parseFloat(e.amount) - e.change,
      paymentType: e.paymetType,
      paymentAccount: e.cardDigits,
      auth: e.cardAuth
    },
      this.pageModel.selectedOMc.instance._id,
      true)
      .then((r) => {
        if (r == 1) {
          let routeUrl: string = "/mc";
          this.passPrint._type = "mc"
          this.passPrint.additionalInfo = {
            "is_partial": true,
            "payment": parseFloat(e.amount) - e.change,
            "payed": parseFloat(e.amount),
            "remain": 0
          }
          this.passPrint.printObjects = this.products

          this.router.navigate(['.' + routeUrl, "print"])
        }
      })
      .catch(this.handleError)
  }

  onClosedCancelled(e): void {
    this.closePartialDialog.close()
  }

  cancelConfirm(): void {
    this.pageModel.isPartial = false
    this.pageModel.toConfirm = false
  }

  // Partial window
  onPartialConfirmed(e): void {
    this.makePartialPayment(e)
  }

  onPartialCancelled(e): void {
    this.partialConfirmation.close()
  }

  // ESTIMATION
  sendToEstimation(): void {
    let routeUrl: string = "/mc";
    this.passPrint.printObjects = this.products
    this.passPrint._type = "mc"

    this.router.navigate(['.' + routeUrl, "print"])
  }

  //Payment confirmation
  getTotal(): number {
    var prods = Object.keys(this.mcHash).map((key, index) => {
      return this.mcHash[key];
    });

    return prods
      .map((x) => parseFloat(x.mc.sale_total))
      .reduce((x, y) => x + y, 0)
  }

}
