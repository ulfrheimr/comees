import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { GridOptions } from "ag-grid";
import { CellButton } from '../../cell.button.component';

// import { Mc } from '../../prots/mc/mc';
import { Partial } from '../../prots/partial';
import { Assets } from '../../assets';
// import { Client } from '../../prots/admin/client';
import { MiSale } from '../../prots/mi/sale';
// import { Phys } from '../../prots/phys';
import { SaleService } from '../../services/mi/sale.service';
// import { PhysService } from '../../services/phys.service';
//
import { PassPrint } from '../pass-print';
//
import { MdlDialogComponent } from '@angular-mdl/core';

@Component({
  selector: 'partial-following',
  templateUrl: './partial-following.component.html',
  styleUrls: ['./partial-following.component.css'],
  providers: [
    // McService,
    SaleService,
    Assets
  ]
})

export class MiPartialFollowingComponent implements OnInit {
  @ViewChild('partialPaymentDialog') private partialPaymentDialog: MdlDialogComponent;

  // mcHash: any = {};
  // mcs: Mc[];
  // physs: Phys[];
  // physHash;
  pageModel;
  partials: any[];
  selectedPartial: Partial;
  // products: Mc[] = [];
  // payments: any[] = [];
  // saleTotal: number;

  private gridOptions: GridOptions;
  constructor(
    // private mcService: McService,
    private assets: Assets,
    private saleService: SaleService,
    private router: Router,
    private passPrint: PassPrint
  ) {
    this.pageModel = {
      hint: "",
      amountError: "",
      partialPayment: undefined
    }
  }

  ngOnInit(): void {
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      }
    };
    this.gridOptions.columnDefs = [
      {
        headerName: "Cliente",
        field: "client_name"
      }, {
        headerName: "Total",
        field: "total"
      },
      {
        headerName: "Fecha",
        field: "date"
      },
      {
        headerName: "Seleccionar",
        field: "value",
        cellRendererFramework: CellButton,
        colId: "select",
        width: 120
      }
    ];
    this.gridOptions.rowData = [];
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  findPartials(): void {
    var client = this.pageModel.hint;
    this.saleService.getPartials(client)
      .then((partials) => {

        var res = partials.map((x) => {
          var total = x.mis.map((m) => m.mi.price)
            .reduce((x, y) => x + y, 0);

          var paymentsTotal = x.payments.map((c) => c.payment)
            .reduce((x, y) => x + y, 0);


          var payments = x.payments.map((x) => {
            return {
              _id: x._id,
              timestamp: this.assets.formatDate(x.timestamp),
              payment: x.payment
            }
          })

          return {
            id: x._id,
            client: x.client,
            client_name: x.client_name,
            payments: payments,
            mis: x.mis,
            total: total,
            payed: paymentsTotal,
            date: this.assets.formatDate(x.payments[0].timestamp)
          }
        })

        this.partials = res;
        this.gridOptions.api.setRowData(this.partials);
      });
  }

  onSelected(partial: Partial): void {
    this.selectedPartial = partial;

  }

  remaining(): number {
    return this.selectedPartial["total"] - this.selectedPartial["payed"]
  }

  remainOfRemaining(): number {
    if (isNaN(this.pageModel.partialPayment))
      return;

    var newTotal = this.selectedPartial["total"] - this.selectedPartial["payed"] - this.pageModel.partialPayment
    if (newTotal < 0)
      return;

    return this.selectedPartial["total"] - this.selectedPartial["payed"] - this.pageModel.partialPayment;
  }

  addPayment(): void {
    this.saleService.addPartialPayment(this.selectedPartial["id"], this.pageModel.partialPayment)
      .then((x) => {
        var newTotal = this.selectedPartial["total"] - this.selectedPartial["payed"] - this.pageModel.partialPayment
        var payed = parseFloat(this.selectedPartial["payed"]) + parseFloat(this.pageModel.partialPayment);

        if (newTotal <= 0) {
          this.makeSale()
            .then((id) => {
              this.closePartial(id, this.selectedPartial["id"])
                .then((res) => {
                  if (res) {
                    this.partialPaymentDialog.close();
                    this.sendToPrint(payed);
                  }
                })
                .catch(this.handleError)
            })
            .catch(this.handleError);
        } else {
          this.partialPaymentDialog.close();
          this.sendToPrint(payed);
        }
      })
      .catch(this.handleError);
  }

  sendToPrint(total): void {
    let routeUrl: string = "/mi"
    console.log(this.selectedPartial)
    var send = this.selectedPartial["mis"].map((x) => {
      return {
        qty: x["qty"],
        name: x["mi"]["name"],
        price_discount: x["mi"]["price"]
      }
    })

    this.passPrint._type = "mi";
    this.passPrint.printObjects = send;
    this.passPrint.registerPayment = total;

    this.partialPaymentDialog.close();

    this.router.navigate(['.' + routeUrl + '/print'])
  }

  closePartial(saleId, partialID): Promise<string> {
    return new Promise((resolve, reject) => {
      return this.saleService.closePartial(saleId, partialID)
        .then((id) => {
          resolve(id);
        })
        .catch(this.handleError)
    })
  }

  makeSale(): Promise<string> {
    var sendMis = this.selectedPartial["mis"].map((x) => {
      return {
        qty: x["qty"],
        mi: x["mi"]["_id"],
        price_discount: x["mi"]["price"],
        type_discount: "normal"
      }
    })

    let s: MiSale = {
      paymentType: "cash",
      paymentAccount: "",
      auth: "",
      mis: sendMis
    }

    return new Promise((resolve, reject) => {
      this.saleService.makeSale(s)
        .then((id) => {
          resolve(id)
        })
        .catch(this.handleError)
    })
  }

  isPartialAllowed(): Boolean {
    if (isNaN(this.pageModel.partialPayment))
      return false;

    var newTotal = this.selectedPartial["total"] - this.selectedPartial["payed"] - this.pageModel.partialPayment

    if (newTotal < 0) {
      this.pageModel.amountError = "El pago debe ser menor al importe";
      return false;
    }

    if (newTotal == 0) {
      this.pageModel.amountError = "Con el monto seleccionado se cerrará la venta";
      return true;
    }

    return true;
  }

}
