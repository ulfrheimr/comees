import { Component, Input, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { GridOptions } from "ag-grid";

import { Angular2Csv } from 'angular2-csv/Angular2-csv';

import { MiSale } from '../../prots/mi/sale';
import { SaleService } from '../../services/mi/sale.service';

// import { UsrInfoService } from '../services/cc/usr-info.service';
import { UsrService } from '../../services/usr.service';
//
// import { UsrInfo } from '../prots/cc/usr-info';

@Component({
  selector: 'sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.css'],
  providers: [
    SaleService
  ]
})

export class MiSalesReportComponent implements OnInit {
  sales;
  usrs;
  role;
  // usrs: UsrInfo[];
  soldMis: any[];
  pageModel;
  // usrDict = {};
  //
  private gridOptions: GridOptions;
  constructor(
    private saleService: SaleService,
    private usrService: UsrService
  ) {
    this.role = this.getRole();

    this.pageModel = {
      usr: undefined,
      init: undefined,
      end: undefined,
      typeSearch: "day"
    }
  }

  ngOnInit(): void {
    this.searchUsrs();
    // this.getUsrsInfo();
    //
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      }
    };
    this.gridOptions.columnDefs = [
      {
        headerName: "Cantidad",
        field: "qty"
      }, {
        headerName: "Estudio",
        field: "name"
      }, {
        headerName: "Descripción",
        field: "description"
      }, {
        headerName: "Fecha",
        field: "sale_date"
      }, {
        headerName: "Precio",
        field: "sale_price"
      }
      , {
        headerName: "Usuario",
        field: "usr"
      }
    ];
    this.gridOptions.rowData = [];
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  searchUsrs(): void {
    this.usrService.getUsrs()
      .then((u) => {
        this.usrs = u;
      })
      .catch(this.handleError)
  }

  getRole(): string {
    return this.usrService.get()["role"]["mi"];
  }

  search(): void {
    let end: Date = new Date();
    let init: Date = new Date(end.toISOString().split("T")[0] + "T00:00:00.000Z");

    if (this.pageModel.typeSearch == "period") {
      init = new Date(this.pageModel.init + "T00:00:00.000Z")
      end = new Date(this.pageModel.end + "T23:59:00.000Z")
    }

    this.saleService.getSales(init.toISOString(), end.toISOString())
      .then((sales) => {
        this.sales = sales;
        this.soldMis = sales.map((s) => {
          console.log(s.mis)
          return s.mis.map((m) => {
            return {
              qty: m.qty,
              name: m.mi.name,
              description: m.mi.description,
              sale_date: s.timestamp.toString().split("T")[0] + " " +
              s.timestamp.toString().split("T")[1].split(":").slice(0, 2).join(":"),
              sale_price: m.sale_price,
              usr: s.usr
            }
          })
        }).reduce((x, y) => x.concat(y))


        this.gridOptions.api.setRowData(this.soldMis);
      })
      .catch((err) => {
        this.gridOptions.api.setRowData([]);
        this.handleError(err)
      });
  }

  report(): void {
    var dateReport = new Date().toISOString().split("T")[0];
    var timeReport = new Date().toISOString().split("T")[1].split(":").slice(0, 2).join(":");
    // var usr = this.usrService.get()["usr"];
    let total: number = 0;

    var data = [
      { "1": "Fecha de reporte" },
      { "1": dateReport + " " + timeReport },
      { "1": "Usuario" },
      { "1": "usr" },
      {
        "1": "Cantidad",
        "2": "Estudio",
        "3": "Descripción",
        "4": "Fecha",
        "5": "Usuario Venta",
        "6": "Precio venta"
      }
    ]

    this.soldMis.map((m) => {
      total += parseFloat(m.sale_price);

      data = data.concat([{
        "1": m.qty,
        "2": m.name,
        "3": m.description,
        "4": m.sale_date,
        "5": m.usr,
        "6": m.sale_price
      }])
    });

    data = data.concat([{
      "1": "",
      "2": "",
      "3": "",
      "4": "",
      "5": "TOTAL",
      "6": total
    }]);

    new Angular2Csv(data, "Venta_" + dateReport);
  }
}
