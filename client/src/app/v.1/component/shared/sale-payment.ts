import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sale-payment',
  templateUrl: './sale-payment.html',
  styleUrls: ['./sale-payment.css']
})

export class SalePaymentComponent implements OnInit {
  pageModel;
  _amount: number;

  @Input()
  set amount(amount: number) {
    this._amount = amount;
  }

  @Output() onPaymentConfirmed = new EventEmitter<any>();
  @Output() onPaymentCancelled = new EventEmitter<any>();

  constructor() {

  }

  ngOnInit(): void {
    this.initializePageModel();
  }

  initializePageModel(): void {
    this.pageModel = {
      paymentType: "cash",
      cardDigits: "",
      amountReceived: "",
      cardAuth: "",
      change: 0.0,
      amountError: null
    }
  }

  getAmount(): number {
    return this._amount;
  }

  confirmPayment(): void {
    let sale: any = {
      paymentType: this.pageModel.paymentType,
      cardDigits: this.pageModel.cardDigits,
      cardAuth: this.pageModel.cardAuth,
      amount: this.pageModel.amountReceived,
      change: this.pageModel.change
    }
    this.onPaymentConfirmed.emit(sale);
  }

  cancelPayment(): void {
    this.onPaymentCancelled.emit();
  }

  isSaleAllowed(): Boolean {
    if (this.pageModel.paymentType == "cash") {
      if (!this.pageModel.amountReceived)
        return false;

      if (isNaN(this.pageModel.amountReceived))
        return false;

      var total = this._amount;
      var received = parseFloat(this.pageModel.amountReceived);
      if (received < total) {
        this.pageModel.amountError = "El importe recibido debe ser mayor que el costo del servicio";
        return false;
      }
    } else {
      if (this.pageModel.cardDigits.length < 4)
        return false;

      if (this.pageModel.cardAuth.length < 4)
        return false;
    }

    return true;
  }

  change(): number {
    let change: number = 0.0;

    if (parseFloat(this.pageModel.amountReceived)) {
      var total = this._amount;
      var received = parseFloat(this.pageModel.amountReceived);
      if (received >= total)
        change = received - total;
    }

    this.pageModel.change = change;
    return change;
  }
}
