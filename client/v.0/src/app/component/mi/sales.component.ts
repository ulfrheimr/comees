import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { GridOptions } from "ag-grid";
import { CellButton } from '../../cell.button.component';

import { Client } from '../../prots/admin/client';

import { Mi } from '../../prots/mi/mi';
import { MiSale } from '../../prots/mi/sale';
import { Estimation } from '../../prots/estimation';

import { MiService } from '../../services/mi/mi.service';
import { MiDiscountService } from '../../services/mi/discount.service';
import { SaleService } from '../../services/mi/sale.service';

import { PassPrint } from '../pass-print';

import { MdlDialogComponent } from '@angular-mdl/core';

@Component({
  selector: 'mi-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
  providers: [
    MiService,
    MiDiscountService,
    SaleService
  ]
})

export class MiSales implements OnInit {
  @ViewChild('paymentConfirmDialog') private paymentConfirmDialog: MdlDialogComponent;
  @ViewChild('partialPaymentDialog') private partialPaymentDialog: MdlDialogComponent;
  @ViewChild('estimationDialog') private estimationDialog: MdlDialogComponent;

  usr: string;
  mis: Mi[];
  miHash: any = {};
  pageModel;
  selectedMi: any;
  priceDiscount;
  products: any[] = [];
  saleTotal: number;

  private gridOptions: GridOptions;
  constructor(
    private miService: MiService,
    private miDiscountService: MiDiscountService,
    private saleService: SaleService,
    private router: Router,
    private passPrint: PassPrint
  ) {
    this.initializePageModel();
    this.findMis();
  }

  ngOnInit(): void {
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      }
    };
    this.gridOptions.columnDefs = [
      {
        headerName: "Estudio",
        field: "name"
      }, {
        headerName: "Descripción",
        field: "description"
      },
      {
        headerName: "Tiempo de entrega",
        field: "delivery_time"
      }, {
        headerName: "Precio",
        field: "price"
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

  findMis(): void {
    if (this.pageModel.hint != "")
      this.miService.getMis(this.pageModel.hint)
        .then((x) => {
          this.mis = x;

          this.gridOptions.api.setRowData(this.mis);
        });
  }

  onSelected(mi: Mi): void {
    this.selectedMi = mi;
    this.pageModel.discountCode = null;
    this.pageModel.allowAdd = true;
    this.pageModel.toggleDiscount = false;
  }

  initializePageModel(): void {
    this.selectedMi = undefined;
    this.priceDiscount = null;
    this.pageModel = {
      hint: "",
      toggleDiscount: false,
      discountType: "normal",
      discountCode: null,
      discountFound: null,
      discountError: null,
      discount: 0.0,
      allowAdd: true,
      toConfirm: false,
      selectedClient: undefined,
      allowSale: false
    }
  }

  cancelSale(): void {
    this.selectedMi = undefined;
  }

  getDiscount(): void {
    this.pageModel.notFoundDiscount = null;
    this.pageModel.discountFound = null;

    if (this.pageModel.discountType == "coupon") {
      this.miDiscountService.getCoupon(this.pageModel.discountCode)
        .then((d) => {
          this.pageModel.discountFound = true;
          this.pageModel.discount = d.discount;
        })
        .catch((err) => {
          this.pageModel.discountFound = false;
          this.pageModel.discountError = err.message;
        })
    } else {
      this.miDiscountService.getRefMiDisc(this.pageModel.discountCode)
        .then((d) => {
          this.pageModel.discountFound = true;
          this.pageModel.discount = d;
        })
        .catch((err) => {
          this.pageModel.discountFound = false;
          this.pageModel.discountError = err.message;
        })
    }
  }

  applyDiscount(): void {
    this.pageModel.allowAdd = true;
    this.priceDiscount = this.selectedMi.price * (1 - (this.pageModel.discount * 0.01));
  }

  toggleDiscount(e): void {
    this.pageModel.allowAdd = !e;

    if (!e) {
      this.pageModel.discountType = "";
      this.pageModel.discountCode = null;
      this.pageModel.discount = 0.0;
      this.priceDiscount = null;
    }
  }

  addToSale(): void {
    let priceDiscount: number = this.priceDiscount == undefined ? this.selectedMi.price : this.priceDiscount
    priceDiscount = parseFloat(priceDiscount.toFixed(2))

    if (this.miHash[this.selectedMi._id]) {
      this.miHash[this.selectedMi._id]["qty"] += 1;
      this.miHash[this.selectedMi._id]["sale_price"] += this.selectedMi.price;
      this.miHash[this.selectedMi._id]["price_discount"] += priceDiscount;
    } else {
      this.miHash[this.selectedMi._id] = {
        qty: 1,
        mi: this.selectedMi._id, //id_mi
        name: this.selectedMi.name,
        sale_price: this.selectedMi.price,
        price_discount: priceDiscount,
        type_discount: this.pageModel.discountType,
        discount: this.pageModel.discountCode,
        mi_description: this.selectedMi.description
      }
    }

    this.priceDiscount = undefined;
    this.pageModel.discountType = "normal";
    this.pageModel.discount = 0

    this.setProducts();
  }

  removeMi(id: string): void {
    delete this.miHash[id];

    this.setProducts();
  }

  private setProducts(): void {
    var prods = Object.keys(this.miHash).map((key, index) => {
      return this.miHash[key];
    });

    this.saleTotal = prods
      .map((x) => x.price_discount)
      .reduce((x, y) => x + y, 0);

    this.products = prods;
    this.initializePageModel();
    this.selectedMi = null;
    this.gridOptions.api.setRowData([]);
  }

  confirmSale(): void {
    this.pageModel.toConfirm = true;
  }

  isPartialPaymentAllowed(): Boolean {
    return this.getTotal() == this.getTotalDiscount()
  }

  getTotal(): number {
    return Object.keys(this.miHash)
      .map((key, index) => this.miHash[key].sale_price)
      .reduce((x, y) => x + y, 0);
  }

  getTotalDiscount(): number {
    return Object.keys(this.miHash)
      .map((key, index) => this.miHash[key].price_discount)
      .reduce((x, y) => x + y, 0);
  }
  makeSale(paymentInfo): void {
    // Validación de
    var url = this.router.url.split('/');
    let routeUrl: string = "/mi";
    let total: number = this.pageModel.amount - this.getTotalDiscount();

    let s: MiSale = {
      //TODO: HERE
      paymentType: paymentInfo.paymentType,
      paymentAccount: paymentInfo.paymentType != "cash" ? paymentInfo.cardDigits : "",
      auth: paymentInfo.paymentType != "cash" ? paymentInfo.cardAuth : "",
      mis: this.products
    }

    this.saleService.makeSale(s)
      .then((id) => {
        localStorage.setItem('payment', paymentInfo.amount);
        localStorage.setItem('change', paymentInfo.change);

        this.paymentConfirmDialog.close();
        this.router.navigate(['.' + routeUrl + '/print-ticket', id])
      })
      .catch(this.handleError)
  }

  // Estimation
  estimation(): void {
    this.estimationDialog.close();

    let est: Estimation[] = Object.keys(this.miHash).map((x) => {
      return {
        qty: this.miHash[x]["qty"],
        product: this.miHash[x]["name"],
        description: this.miHash[x]["mi_description"],
        sale_price: this.miHash[x]["sale_price"]
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
  remaining(): number {
    this.pageModel.amountError = "";

    if (!this.pageModel.partialPayment)
      return;

    if (isNaN(this.pageModel.partialPayment))
      return;

    return this.getTotalDiscount() - parseFloat(this.pageModel.partialPayment);
  }

  allowPartialPayment(): string {
    var r = this.remaining();

    if (r < 0)
      return "El importe debe ser mayor al pago parcial";

    return null;
  }

  partialPayment(): void {
    let routeUrl: string = "/mi";
    this.partialPaymentDialog.close();

    var s = {
      client: this.pageModel.selectedClient,
      mis: this.products,
      payments: this.pageModel.partialPayment
    }

    this.saleService.makePartial(s)
      .then((id) => {
        this.passPrint._type = "mi";
        this.passPrint.printObjects = this.products;
        this.passPrint.registerPayment = parseFloat(this.pageModel.partialPayment);

        this.partialPaymentDialog.close();
        this.router.navigate(['.' + routeUrl + '/print'])
      })
      .catch(this.handleError)
  }

  //SALE WINDOW
  onPaymentConfirmed(e): void {
    this.makeSale(e);
  }

  onPaymentCancelled(e): void {
    this.paymentConfirmDialog.close()
  }

  //CONFIRMATION
  allowConfirmation(): Boolean {
    var confirmation = true;

    // this.products.forEach((p) => {
    //   if (parseFloat(p.sale_total) == 0 || p.sale_total == "") {
    //     confirmation = false;
    //     this.pageModel.confirmationError = "La confirmación de importe no puede estar en ceros";
    //   }
    //
    //   if (!p.observations || p.observations == "") {
    //     confirmation = false;
    //     this.pageModel.confirmationError = "Se deben agregar observaciones a la venta";
    //   }
    // })

    return confirmation;
  }

  //CLIENT WINDOW
  onClientSelected(client: Client): void {
    this.pageModel.selectedClient = client;
    this.pageModel.partial = false;
  }
}
