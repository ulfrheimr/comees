import { Component, OnInit, Input, Output, EventEmitter, ViewContainerRef } from '@angular/core';

import { Assets } from '../assets'
import { Router } from '@angular/router';

import { UsrService } from '../services/usr.service';
import { SaleService as McSales } from '../services/mc/sale.service';
import { SaleService as MiSales } from '../services/mi/sale.service';
import { PhysService } from '../services/phys.service';

import * as moment from 'moment/moment';;

import { MdlSnackbarService } from '@angular-mdl/core';;

@Component({
  selector: 'sales-cut',
  templateUrl: './sales-cut.component.html',
  styleUrls: ['./sales-cut.component.css'],
  providers: [
    McSales,
    MiSales,
    PhysService,
    Assets
  ]
})

export class SalesCut implements OnInit {
  @Output() onSalesCutCancelled = new EventEmitter<any>()
  @Output() onSalesCutDone = new EventEmitter<any>()
  mi = {
    sales: [],
    partials: [],
    sales_total: 0,
    partial_total: 0
  }
  mc = []
  physs: any[]
  pageModel: any
  total: number = 0

  constructor(
    private usrService: UsrService,
    private miSaleService: MiSales,
    private mcSaleService: McSales,
    private physService: PhysService,
    private assets: Assets,
    private router: Router,
    private mdlSnackbarService: MdlSnackbarService
  ) {
    this.initializePageModel()
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  private initializePageModel(): void {
    this.pageModel = {
      toCalculate: false,
      firstLogin: null,
      endLogin: null,
    }
  }

  ngOnInit(): void {
    this.usrService.getFirstLoginTime()
      .then((r) => {
        let is_closed = r.is_closed

        if (is_closed) {
          this.mdlSnackbarService.showToast('Su sesión no se encuentra activa en este momento.');
          this.getTotals(r.end_login)
        }
      })
      .catch(this.handleError)
  }



  getTotals(close_session = false, end = undefined): void {

    this.usrService.getFirstLoginTime(false)
      .then((r) => {
        let init_time = moment(r.init_login)

        let end_time = moment(end)

        if (close_session)
          this.usrService.close()
            .then((session) => {
              this.mdlSnackbarService.showToast('Su sessión se cerró exitosamente.');
            })
            .catch(this.handleError);

        this.pageModel.firstLogin = this.assets.formatDate(init_time.format())

        this.pageModel.endLogin = this.assets.formatDate(end_time.format())

        this.physService.getPhyss()
          .then((physs) => {
            var phys_hash = {}
            physs.forEach((x) => {
              phys_hash[x["_id"]] = {
                id: x["_id"],
                name: x["name"],
                first: x["first"],
                schema: x["payment_schema"],
                sales: [],
                partials: [],
                sales_total: {
                  total: 0,
                  phys: 0,
                  box: 0
                },
                partial_total: {
                  total: 0,
                  phys: 0,
                  box: 0
                }
              }
            })

            this.mcSaleService.getSales(init_time.format(), end_time.format())
              .then((sales) => {
                var s = sales.forEach((x) => {
                  x.mcs.forEach((s) => {
                    var res = {
                      qty: s.qty,
                      price: s.sale_price,
                      mc: s.mc,
                      phys: s.phys,
                      box: 0,
                      payment: s.sale_price
                    }
                    var schema = phys_hash[s.phys].schema;

                    if (schema.schema == 1) {
                      var comm = parseFloat(schema["commission"]) / 100.0
                      res["box"] = parseFloat(res["price"]) * comm
                      res["payment"] = parseFloat(res["price"]) * (1 - comm)
                    }

                    phys_hash[s.phys].sales.push(res)
                    phys_hash[s.phys].sales_total["total"] += res["price"]
                    phys_hash[s.phys].sales_total["phys"] += res["payment"]
                    phys_hash[s.phys].sales_total["box"] += res["box"]

                    this.total += parseFloat(res["price"])
                  })

                })

                this.mcSaleService.getPartialCut(init_time.format(), end_time.format())
                  .then((partials) => {

                    partials.forEach((x) => {
                      var res = {
                        price: x.payment,
                        box: 0,
                        payment: x.payment
                      }

                      var schema = phys_hash[x.phys].schema;
                      if (schema.schema == 1) {
                        var comm = parseFloat(schema["commission"]) / 100.0
                        res["box"] = parseFloat(res["price"]) * comm
                        res["payment"] = parseFloat(res["price"]) * (1 - comm)
                      }

                      phys_hash[x.phys].partials.push(res)
                      phys_hash[x.phys].partial_total["total"] += res["price"]
                      phys_hash[x.phys].partial_total["phys"] += res["payment"]
                      phys_hash[x.phys].partial_total["box"] += res["box"]

                      this.total += parseFloat(res["price"])
                    })

                    this.mc = Object.values(phys_hash)
                  })
                  .catch(this.handleError)
              })
              .catch(this.handleError)

          })
          .catch(this.handleError)

        this.miSaleService.getSales(init_time.format(), end_time.format(), this.usrService.get().usr)
          .then((sales) => {
            var s = sales.map((s) => s.mis)
              .reduce((x, y) => x.concat(y), []);

            this.mi.sales = s
            this.mi.sales_total = s.map((x) => x.sale_price).reduce((x, y) => x + y, 0)

            this.total += this.mi.sales_total
          })
          .catch(this.handleError)

        this.miSaleService.getPartialCut(init_time.format(), end_time.format())
          .then((partials) => {
            console.log(partials)
            this.mi.partials = partials
            this.mi.partial_total = partials.map(x => x.payment)
              .reduce((x, y) => x + y, 0)

            this.total += this.mi.partial_total
          })
          .catch(this.handleError)


      })
      .catch(this.handleError)

    this.pageModel.toCalculate = true
  }

  cancelSalesCut(): void {
    this.onSalesCutCancelled.emit();
  }

  returnToApp(): void {
    this.router.navigate(['./mi'])
  }

  // Usr control
  getName(): string {
    let name: string = this.usrService.get()["name"];
    return name.split(" ")[0];
  }
}
