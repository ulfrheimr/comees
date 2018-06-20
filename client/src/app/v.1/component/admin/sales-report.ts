import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { UsrService } from '../../services/usr.service';
import { SaleService as MiSaleService } from '../../services/mi/sale.service'
import { SaleService as McSaleService } from '../../services/mc/sale.service';
import { PhysService } from '../../services/phys.service';

@Component({
  selector: 'sales-report',
  templateUrl: './sales-report.html',
  styleUrls: ['./sales-report.css'],
  providers: [
    UsrService,
    MiSaleService,
    McSaleService,
    PhysService
  ]
})

export class SalesReport implements OnInit {
  statusDesc = {
    1: "Abierto",
    2: "Cerrado"
  }
  sales: any = {
    "mi": [],
    "mc": []
  }

  endpoints: any = {
    "mi": "Estudios de gabinete",
    "mc": "Servicios médicos"
  }
  settings = {
    bigBanner: true,
    timePicker: false,
    format: 'yyyy-MM-dd',
    defaultOpen: false
  }
  allowedEndpoints: any[] = []

  physs: any = {}
  pageModel

  constructor(
    private usrService: UsrService,
    private miSaleService: MiSaleService,
    private mcSaleService: McSaleService,
    private physService: PhysService
  ) {
    this.initialize()
  }

  ngOnInit(): void {
    this.getEndpoints()
    this.getPhyss()
  }

  private handleError(error): Promise<any> {
    return Promise.reject(error.message || error);
  }

  initialize(): void {
    this.pageModel = {
      endpoints: {},
      initDate: new Date(),
      endDate: null,
    }
  }

  getEndpoints(): void {
    let role = this.usrService.get()["role"]
    Object.keys(role).forEach((x) => {
      if (role[x] == "adm")
        this.allowedEndpoints.push({
          "endpoint": x,
          "name": this.endpoints[x]
        })
    })
  }

  getPhyss(): void {
    this.physService.getPhyss()
      .then((ps) => {
        ps.forEach((p) => {
          this.physs[p._id] = p
        })
      })
      .catch(this.handleError)
  }

  searchSales(): void {
    if (this.pageModel.endpoints["mi"] == true) {
      this.getMISales()
    }

    if (this.pageModel.endpoints["mc"] == true) {
      this.getMCSales()
    }
  }

  getMISales(): void {
    this.miSaleService.getSales(this.pageModel.initDate, this.pageModel.endDate)
      .then((sales) => {
        this.sales.mi = sales
      })
      .catch(this.handleError)
  }

  getTotalMiSales(): number {
    let total = this.sales.mi
      .map((x) => x.payments
        .map((xx) => xx.payment)
        .reduce((xx, yy) => xx + yy, 0)
      )
      .reduce((x, y) => x + y, 0)

    return total
  }

  getMCSales(): void {
    this.mcSaleService.getSales(this.pageModel.initDate, this.pageModel.endDate)
      .then((sales) => {
        this.sales.mc = sales
      })
      .catch(this.handleError)
  }

  getTotalMcSales(): number {
    let total = this.sales.mc
      .map((x) => x.payments
        .map((xx) => xx.payment)
        .reduce((xx, yy) => xx + yy, 0)
      )
      .reduce((x, y) => x + y, 0)

    return total
  }

}
