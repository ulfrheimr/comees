import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { DatepickerOptions } from 'ng2-datepicker';

import { SaleService as MiSales } from '../../services/mi/sale.service';
import { SaleService as McSales } from '../../services/mc/sale.service';

import * as moment from 'moment/moment';
import * as math from 'mathjs';

@Component({
  selector: 'report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
  providers: [
    MiSales,
    McSales
  ]

})
export class SalesReport implements OnInit {
  pageModel;
  selectedDate: any;
  people: any = ["asd", "asdas", "asdas"]
  sel: string = ""

  private chartData: Observable<any>
  public lineChartData: Array<any> = []
  public lineChartOptions: any = {
    responsive: true
  };

  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';
  public lineChartLabels: Array<any>


  sales: any = {
    miSales: [],
    miPartials: [],
    mcSales: [],
    mcPartials: []
  }

  constructor(
    private miSaleService: MiSales,
    private mcSaleService: McSales,
  ) {
    this.initializePageModel()
  }

  ngOnInit(): void {
    this.getData()
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  private initializePageModel(): void {
    this.pageModel = {
      span: "day",
      init: new Date(Date.now()),
      end: new Date(Date.now())
    }
  }

  private clear(): void {
    this.lineChartData = []
  }

  public getData(): void {
    this.clear()

    let init = moment(this.pageModel.init)
    let end = moment(this.pageModel.end)

    let span = Array.from({ length: end.diff(init, 'days') }, (value, key) => key)
    this.lineChartLabels = span.map((x) => init.clone().add(x, "d").format("DD-MMM"))

    let awaiter: any = {
      miSales: null,
      miPartials: null,
      mcSales: null,
      mcPartials: null
    }

    var done = () => {
      return Object.keys(awaiter).map((k) => awaiter[k] != null).reduce((x, y) => x && y)
    }

    this.chartData = new Observable(observer => {

      this.miSaleService.getSales(init.format(), end.format())
        .then((s) => {
          var d = s.map((x) => {
            return x.mis.map((y) => {
              return {
                date: moment(x.timestamp),
                data: y
              }
            })
          })
            .reduce((x, y) => x.concat(y), [])
            .sort((x, y) => {
              return x.date.diff(y.date)
            })


          observer.next({ label: "miSales", data: this.convertData(init, end, d) });
          awaiter.miSales = true

          if (done())
            observer.complete()

        })

      this.miSaleService.getPartialCut(init.format(), end.format())
        .then((s) => {
          var d = s.map((x) => {
            return {
              date: moment(x.timestamp),
              data: { sale_price: x.payment }
            }
          })
            .reduce((x, y) => x.concat(y), [])
            .sort((x, y) => {
              return x.date.diff(y.date)
            })

          observer.next({ label: "miPartials", data: this.convertData(init, end, d) });
          awaiter.miPartials = true

          if (done())
            observer.complete()

        })

      this.mcSaleService.getSales(init.format(), end.format())
        .then((s) => {

          var d = s.map((x) => {
            return x.mcs.map((mc) => {
              return {
                date: moment(x.timestamp),
                data: mc
              }
            })
          })
            .reduce((x, y) => x.concat(y), [])
            .sort((x, y) => {
              return x.date.diff(y.date)
            })


          observer.next({ label: "mcSales", data: this.convertData(init, end, d) });
          awaiter.mcSales = true

          if (done())
            observer.complete()
        })

      this.mcSaleService.getPartialCut(init.format(), end.format())
        .then((p) => {
          var d = p.map((x) => {
            return {
              date: moment(x.timestamp),
              data: { sale_price: x.payment }
            }
          })
            .reduce((x, y) => x.concat(y), [])
            .sort((x, y) => {
              return x.date.diff(y.date)
            })

          observer.next({ label: "mcPartials", data: this.convertData(init, end, d) });
          awaiter.mcPartials = true

          if (done())
            observer.complete()
        })
    })

    let temp = []

    let subscription = this.chartData
      .forEach((v) => {
        temp.push(v)
      }).then(() => {
        var total = temp.map(x => x.data)
          .reduce((x, y) => math.add(x, y))

        temp.push({ label: "TOTAL", data: total })

        this.lineChartData = temp

        console.log("DONE")
      });
  }

  private convertData(init: any, end: any, data: any): any {

    let span = Array.from({ length: end.diff(init, 'days') }, (value, key) => key)

    var res = span.map((x) => {
      var i = init.clone().add(x, "d")
      var r = data.filter((d) => {
        return d.date.isSame(i, "day")
      }).map((x) => x.data.sale_price)
        .reduce((x, y) => x + y, 0)

      return {
        date: i,
        total: r
      }
    })


    return res.map((x) => x.total)
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }
}
