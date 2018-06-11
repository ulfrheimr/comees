import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { GridOptions } from "ag-grid";
import { CellButton } from '../../cell.button.component';

import { Mc } from '../../prots/mc/mc';
import { Client } from '../../prots/admin/client';
import { McSale } from '../../prots/mc/sale';
import { Phys } from '../../prots/phys';
import { Estimation } from '../../prots/estimation';
//
import { McService } from '../../services/mc/mc.service';
// import { MiDiscountService } from '../../services/mi/discount.service';
import { SaleService } from '../../services/mc/sale.service';
import { PhysService } from '../../services/phys.service';

import { PassPrint } from '../pass-print';

import { MdlDialogComponent } from '@angular-mdl/core';

@Component({
  selector: 'mc-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
  providers: [
    McService,
    SaleService,
    PhysService
  ]
})

export class McSales implements OnInit {
  @ViewChild('paymentConfirmDialog') private paymentConfirmDialog: MdlDialogComponent;
  @ViewChild('partialPaymentDialog') private partialPaymentDialog: MdlDialogComponent;
  @ViewChild('estimationDialog') private estimationDialog: MdlDialogComponent;

  selectedMc: Mc;
  mcHash: any = {};
  mcs: Mc[];
  physs: Phys[];
  physHash;
  pageModel;
  products: any[] = [];
  saleTotal: number;

  private gridOptions: GridOptions;
  constructor(
    private mcService: McService,
    private physService: PhysService,
    private saleService: SaleService,
    private router: Router,
    private passPrint: PassPrint
  ) {
    this.pageModel = {
      hint: "",
      partial: false,
      selectedClient: undefined,
      toConfirm: false,
      selectedPhys: undefined,
      paymentType: "cash",
      allowSale: false,
      cardDigits: "",
      cardAuth: "",
      amountError: "",
      amount: undefined,
      isEstimation: false,
      partialPayment: undefined,
      confirmationError: "",
      partialPaymentError:""
    }
  }

  ngOnInit(): void {
    // this.findMcs();
    this.findPhyss();
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      }
    };
    this.gridOptions.columnDefs = [
      {
        headerName: "Tratamiento",
        field: "name"
      }, {
        headerName: "Descripción",
        field: "description"
      },
      {
        headerName: "Precio",
        field: "suggested_price"
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

  removeMc(id: string): void {
    delete this.mcHash[id];

    this.setProducts();
  }

  findPhyss(): void {
    var result = {}
    this.physService.getPhyss()
      .then((x) => {
        for (var i = 0; i < x.length; i++)
          result[x[i]._id] = x[i]

        this.physs = x;
        this.physHash = result;
      });
  }

  findMcs(): void {
    if (this.pageModel.hint != "")
      this.mcService.getMcs(this.pageModel.hint)
        .then((x) => {
          console.log(x)
          this.mcs = x;
          this.gridOptions.api.setRowData(this.mcs);
        });
  }

  onSelected(mc: Mc): void {
    this.selectedMc = mc;
  }

  onClientSelected(client: Client): void {
    this.pageModel.selectedClient = client;
    this.pageModel.partial = false;
  }

  addToSale(): void {
    if (this.mcHash[this.selectedMc._id + "" + this.pageModel.selectedPhys]) {
      this.mcHash[this.selectedMc._id + "" + this.pageModel.selectedPhys]["qty"] += 1;
      this.mcHash[this.selectedMc._id + "" + this.pageModel.selectedPhys]["suggested_price"] += this.selectedMc.suggested_price;
    } else {
      this.mcHash[this.selectedMc._id + "" + this.pageModel.selectedPhys] = {
        qty: 1,
        mc: this.selectedMc._id, //id_mi
        name: this.selectedMc.name,
        suggested_price: this.selectedMc.suggested_price,
        sale_total: null,
        phys: this.physHash[this.pageModel.selectedPhys],
        observations: this.selectedMc.observations
      }
    }

    this.setProducts();
  }

  getTotal(): number {
    var prods = Object.keys(this.mcHash).map((key, index) => {
      return this.mcHash[key];
    });

    return prods
      .map((x) => parseFloat(x.sale_total))
      .reduce((x, y) => x + y, 0);
  }

  private setProducts(): void {
    var prods = Object.keys(this.mcHash).map((key, index) => {
      return this.mcHash[key];
    });

    this.products = prods;
    this.selectedMc = null;
    this.gridOptions.api.setRowData([]);
  }


  makeSale(paymentInfo): void {
    let s: McSale = {
      paymentType: paymentInfo.paymentType,
      paymentAccount: paymentInfo.paymentType != "cash" ? paymentInfo.cardDigits : "",
      auth: paymentInfo.paymentType != "cash" ? paymentInfo.cardAuth : "",
      mcs: this.products
    }

    this.saleService.makeSale(s)
      .then((id) => {
        this.sendToPrint(id, "sale");
      })
      .catch(this.handleError)
  }

  allowConfirmation(): Boolean {
    var confirmation = true;

    this.products.forEach((p) => {
      if (parseFloat(p.sale_total) == 0 || p.sale_total == "") {
        confirmation = false;
        this.pageModel.confirmationError = "La confirmación de importe no puede estar en ceros";
      }

      if (!p.observations || p.observations == "") {
        confirmation = false;
        this.pageModel.confirmationError = "Se deben agregar observaciones a la venta";
      }
    })

    return confirmation;
  }

  // Estimation
  openEstimation(): void {
    this.pageModel.isEstimation = true;
    this.estimationDialog.show();
  }

  estimation(): void {
    this.estimationDialog.close();


    let est: Estimation[] = this.products.map((x) => {
      return {
        qty: x.qty,
        product: x.name,
        description: x.phys.name + " " + x.phys.first,
        sale_price: x.sale_total / x.qty
      }
    });

    let estPayment: number = est.map((x) => {
      return x.sale_price;
    }).reduce((x, y) => x + y, 0);

    let routeUrl: string = "/mi";
    this.passPrint._type = "estimation";
    this.passPrint.printObjects = est;
    this.passPrint.registerPayment = parseFloat(estPayment.toString());

    this.router.navigate(['.' + routeUrl, "print"])

  }

  // Partial Payment
  isPartialAllowed(): Boolean {
    if (!this.pageModel.partialPayment || this.pageModel.partialPayment == "")
      return false;

    if (isNaN(this.pageModel.partialPayment))
      return false;

    if (parseFloat(this.pageModel.partialPayment) >= this.getTotal()) {
      this.pageModel.partialPaymentError = "El importe es mayor para solo hacer pago parcial, realice la venta";
      return false;
    }

    return true;
  }

  remaining(): number {
    if (!this.pageModel.partialPayment || this.pageModel.partialPayment == "")
      return;

    if (isNaN(this.pageModel.partialPayment))
      return;

    if (parseFloat(this.pageModel.partialPayment) >= this.getTotal())
      return;

    return this.getTotal() - parseFloat(this.pageModel.partialPayment);
  }

  partialPayment(): void {
    var url = this.router.url.split('/');
    let routeUrl: string = "/mc"

    var s = {
      client: this.pageModel.selectedClient,
      mcs: this.products,
      payments: this.pageModel.partialPayment
    }

    this.saleService.makePartial(s)
      .then((id) => {
        this.passPrint._type = "mc";
        this.passPrint.printObjects = this.products;
        this.passPrint.registerPayment = parseFloat(this.pageModel.partialPayment);

        this.partialPaymentDialog.close();

        this.router.navigate(['.' + routeUrl + '/print'])
      })
      .catch(this.handleError)
  }

  sendToPrint(id: string, type: string): void {
    var url = this.router.url.split('/');
    let routeUrl: string = "/mc"
    let total: number = this.getTotal()

    localStorage.setItem('payment', "" + total);
    localStorage.setItem('change', "" + total);
    localStorage.setItem('type', "" + type);

    this.paymentConfirmDialog.close();
    this.router.navigate(['.' + routeUrl + '/print-ticket', id])
  }

  //SALE WINDOW
  onPaymentConfirmed(e): void {
    this.makeSale(e);
  }

  onPaymentCancelled(e): void {
    this.paymentConfirmDialog.close()
  }

}
