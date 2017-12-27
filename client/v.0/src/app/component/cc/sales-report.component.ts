import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { UsrService } from '../../services/usr.service';

@Component({
  selector: 'sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.css'],
  providers: [
    // MiService,
    // MiDiscountService,
    // SaleService
  ]
})

export class SalesReport implements OnInit {
  pageModel;

  constructor(
    private usrService: UsrService
    // private miService: MiService,
    // private miDiscountService: MiDiscountService,
    // private saleService: SaleService,
    // private router: Router,
    // private passPrint: PassPrint
  ) {
    this.initializePageModel();
    // this.findMis();
  }

  ngOnInit(): void {
    // this.gridOptions = <GridOptions>{
    //   context: {
    //     componentParent: this
    //   }
    // };
    // this.gridOptions.columnDefs = [
    //   {
    //     headerName: "Estudio",
    //     field: "name"
    //   }, {
    //     headerName: "Descripción",
    //     field: "description"
    //   },
    //   {
    //     headerName: "Tiempo de entrega",
    //     field: "delivery_time"
    //   }, {
    //     headerName: "Precio",
    //     field: "price"
    //   },
    //   {
    //     headerName: "Seleccionar",
    //     field: "value",
    //     cellRendererFramework: CellButton,
    //     colId: "select",
    //     width: 120
    //   }
    // ];
    // this.gridOptions.rowData = [];
  }

  initializePageModel(): void {
    this.pageModel = {
      roles: this.getRole()
    }
  }

  getRole(): string {
    return this.usrService.get()["role"];;
  }
}
