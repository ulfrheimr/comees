import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'partial-confirmation',
  templateUrl: './partial-confirmation.html',
  styleUrls: ['./partial-confirmation.css']
})

export class PartialConfirmation implements OnInit {
  pageModel;
  _amount: number;

  @Input()
  set amount(amount: number) {
    this._amount = amount;
  }

  @Output() onPartialConfirmed = new EventEmitter<any>();
  @Output() onPartialCancelled = new EventEmitter<any>();

  constructor() {

  }

  ngOnInit(): void {
    this.initializePageModel();
  }

  initializePageModel(): void {
    this.pageModel = {
      partialPayment: "",
      remain: 0.0,
      amountError: null
    }
  }

  getAmount(): number {
    return this._amount;
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

  remaining(): number {
    this.pageModel.amountError = null

    if (!this.pageModel.partialPayment || this.pageModel.partialPayment == "")
      return;

    if (isNaN(this.pageModel.partialPayment)) {
      this.pageModel.amountError = "Por favor revise el importe recibido"
      return;
    }

    if (parseFloat(this.pageModel.partialPayment) >= this.getAmount()) {
      this.pageModel.amountError = "El pago parcial no puede ser mayor al importe del servicio"
      return
    }

    this.pageModel.remain = this.getAmount() - parseFloat(this.pageModel.partialPayment)

    return this.pageModel.remain
  }

  // Handlers for button actions
  confirmPayment(): void {
    let sale: any = {
      amount: this._amount,
      remain: this.pageModel.remain
    }
    this.onPartialConfirmed.emit(sale);
  }

  cancelPayment(): void {
    this.onPartialCancelled.emit();
  }

  isPaymentAllowed(): Boolean {
    var total = this.remaining()
    if (total == null)
      return false

    return true
  }
}
