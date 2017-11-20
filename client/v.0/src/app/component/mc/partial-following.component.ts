import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { GridOptions } from "ag-grid";
import { CellButton } from '../../cell.button.component';

import { Mc } from '../../prots/mc/mc';
import { PartialMc } from '../../prots/mc/partial';
import { Assets } from '../../assets';
// import { Client } from '../../prots/admin/client';
import { McSale } from '../../prots/mc/sale';
// import { Phys } from '../../prots/phys';
import { SaleService } from '../../services/mc/sale.service';
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

export class PartialFollowingComponent implements OnInit {
  // @ViewChild('paymentConfirmDialog') private paymentConfirmDialog: MdlDialogComponent;
  @ViewChild('partialPaymentDialog') private partialPaymentDialog: MdlDialogComponent;
  //

  // mcHash: any = {};
  // mcs: Mc[];
  // physs: Phys[];
  // physHash;
  pageModel;
  partials: PartialMc[];
  selectedPartial: PartialMc;
  products: Mc[] = [];
  payments: any[] = [];
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
    if (client.length > 3)
      this.saleService.getPartials(client)
        .then((partials) => {
          var res = partials.map((x) => {
            var total = x.mcs.map((c) => c.sale_price)
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
              mcs: x.mcs,
              total: total,
              payed: paymentsTotal,
              date: this.assets.formatDate(x.payments[0].timestamp)
            }
          })

          this.partials = res;
          this.gridOptions.api.setRowData(this.partials);
        });
  }

  onSelected(partial: PartialMc): void {
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
    let routeUrl: string = "/mc"
    var send = this.selectedPartial.mcs.map((x) => {
      return {
        qty: x["qty"],
        name: x["mc"]["name"],
        sale_total: x["sale_price"]
      }
    })

    this.passPrint._type = "mc";
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
    let s: McSale = {
      usr: "CHOCOCO",
      paymentType: "cash",
      paymentAccount: "",
      auth: "",
      mcs: this.selectedPartial.mcs
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
