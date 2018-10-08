import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { UsrService } from '../../services/usr.service';
import { SaleService as MiSaleService } from '../../services/mi/sale.service'
import { SaleService as McSaleService } from '../../services/mc/sale.service';
import { FactMIService } from '../../services/mi/fact-mi.service';
import { PhysService } from '../../services/phys.service';

import async from 'async'

@Component({
  selector: 'sales-report',
  templateUrl: './sales-report.html',
  styleUrls: ['./sales-report.css'],
  providers: [
    UsrService,
    MiSaleService,
    McSaleService,
    FactMIService,
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
  factMIs: any = {}
  pageModel

  constructor(
    private usrService: UsrService,
    private miSaleService: MiSaleService,
    private mcSaleService: McSaleService,
    private factMIService: FactMIService,
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
        this.getFactMIs(sales)
      })
      .catch(this.handleError)
  }

  getFactMIs(sales): void {
    let s = sales
    let facts = new Set(
      sales.map((x) => {
        let r = x.mis.map((m) => m.mi._id)

        return Array.from(new Set(r))
      }).reduce((x, y) => x.concat(y), [])
    )

    async.map(Array.from(facts),
      (item, callback) => {
        this.factMIService.getFactMI(item)
          .then((m) => {
            callback(null, [item, m])
          })
          .catch((err) => {
            callback(err)
          })
      },
      (err, result) => {
        let res = {}

        result.forEach((r) => {
          res[r[0]] = r[1]
        })

        let sale = s.map((ss) => {
          ss.mis.forEach((m) => {

            if (res[m.mi._id].length == 0)
              m["fact"] = 0
            else
              m["fact"] = res[m.mi._id][0].price
          })
          return ss
        })

        this.sales.mi = sale
      }
    )

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

  getTotalFactMIs(): number {
    let total = this.sales.mi
      .map((x) => x.mis
        .map((xx) => xx.fact)
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
