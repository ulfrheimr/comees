import { Component, Input, OnInit, EventEmitter, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { GridOptions } from "ag-grid";
import { CellButton } from '../../cell.button.component';

import { Mi } from '../../prots/mi/mi';
import { MiSale } from '../../prots/mi/sale';

import { MiService } from '../../services/mi/mi.service';
import { MiDiscountService } from '../../services/mi/discount.service';
import { SaleService } from '../../services/mi/sale.service';

import { PassMi } from './pass-mi';

import { MdlDialogComponent } from '@angular-mdl/core';

@Component({
  selector: 'mi-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
  providers: [
    MiService,
    MiDiscountService,
    SaleService,
    // UsrService
  ]
})

export class MiSales implements OnInit {
  @ViewChild('paymentConfirmDialog') private paymentConfirmDialog: MdlDialogComponent;
  @ViewChild('partialPaymentDialog') private partialPaymentDialog: MdlDialogComponent;


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
    private passMi: PassMi
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

  private initializePageModel(): void {
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
      paymentType: "cash",
      allowSale: false,
      cardDigits: "",
      cardAuth: "",
      allowPartialPayment: false,
      amountError: ""
      // toPayment: false,
      // amount: undefined,

      //
      // isPartialPayment: false,
      // partialPayment: undefined
    }
  }

  findMis(): void {
    if (this.pageModel.hint != "")
      this.miService.getMis(this.pageModel.hint)
        .then((x) => {
          this.mis = x;
          console.log(x)
          this.gridOptions.api.setRowData(this.mis);
        });
  }

  onSelected(mi: Mi): void {
    this.selectedMi = mi;
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
    console.log(this.priceDiscount)
  }

  toggleDiscount(e): void {
    this.pageModel.allowAdd = !e;
  }

  addToSale(): void {
    let priceDiscount: number = this.priceDiscount == undefined ? this.selectedMi.price : this.priceDiscount
    priceDiscount = parseFloat(priceDiscount.toFixed(2))

    console.log(this.pageModel)

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
        discount: this.pageModel.discountCode
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

  change(): string {
    if (parseFloat(this.pageModel.amount)) {
      var total = this.getTotalDiscount()

      if (parseFloat(this.pageModel.amount) >= total) {
        this.pageModel.allowSale = true;
        return (this.pageModel.amount - total).toFixed(2);
      } else
        this.pageModel.allowSale = false;

    } else
      this.pageModel.allowSale = false;

  }

  makeSale(): void {
    // Validación de
    console.log(this.pageModel)

    var url = this.router.url.split('/');
    let routeUrl: string = "/mi";
    let total: number = this.pageModel.amount - this.getTotalDiscount();

    let s: MiSale = {
      usr: "CHOCOCO",
      paymentType: this.pageModel.paymentType,
      paymentAccount: this.pageModel.cardDigits,
      auth: this.pageModel.cardAuth,
      mis: this.products
    }

    this.saleService.makeSale(s)
      .then((id) => {
        localStorage.setItem('payment', parseFloat(this.pageModel.amount).toFixed(2));
        localStorage.setItem('change', total.toFixed(2));

        this.paymentConfirmDialog.close();
        this.router.navigate(['.' + routeUrl + '/print-ticket', id])
      })
      .catch(this.handleError)
  }

  // Partial Payment
  remaining(): number {
    this.pageModel.amountError = "";

    if (!parseFloat(this.pageModel.partialPayment)) {
      // this.pageModel.amountError = "Importe no válido";
      this.pageModel.allowPartialPayment = false;
      return;
    }

    if (parseFloat(this.pageModel.partialPayment) > this.getTotalDiscount()) {
      this.pageModel.amountError = "El importe es mayor para solo hacer pago parcial, realice la venta";
      this.pageModel.allowPartialPayment = false;
      return;
    }

    this.pageModel.allowPartialPayment = true;
    return this.getTotalDiscount() - parseFloat(this.pageModel.partialPayment);
  }

  partialPayment(): void {
    this.partialPaymentDialog.close();

    let routeUrl: string = "/mi";
    this.passMi._type = "mi";
    this.passMi.mis = this.products;
    this.passMi.registerPayment = parseFloat(this.pageModel.partialPayment);

    this.router.navigate(['.' + routeUrl, "print"])

  }
}
