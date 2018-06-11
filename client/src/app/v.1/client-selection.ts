import { Component, EventEmitter, Output, ViewChild } from '@angular/core';

import { Client } from './prots/client';
import { ClientService } from './services/client.service';

import { MdlDialogComponent } from '@angular-mdl/core';

@Component({
  selector: 'client-selection',
  templateUrl: './client-selection.html',
  styleUrls: ['./client-selection.css'],
  providers: [
    ClientService
  ]
})

export class ClientSelection {
  private pageModel
  selectedClient: any = null
  clients: Client[] = []
  client: any = {}

  @ViewChild('addNewClient') private addNewClient: MdlDialogComponent;

  @Output() onClientSelected = new EventEmitter<Client>();

  constructor(
    private clientService: ClientService
  ) {
    this.pageModel = {
      hint: "",
      errorMsgs: []
      // addNewClient: false,
      // isClientCorrect: false,
    }
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  findClients(): void {
    if (this.pageModel.hint != "") {
      this.clientService.getClients(this.pageModel.hint)
        .then((r) => {
          this.clients = r;
        })
        .catch(this.handleError)
    }
  }

  //Handlers
  selectClient(c): void {
    this.selectedClient = c
  }

  searchAgain(): void {
    this.selectedClient = null
  }

  emmitClient(): void {
    this.onClientSelected.emit(this.selectedClient)
  }

  isClientAdditionAllowed(): boolean {
    this.pageModel.errorMsgs = [];

    if (!this.client.name || this.client.name == "")
      this.pageModel.errorMsgs.push("Verifique el nombre de cliente")

    if (!this.client.phone || this.client.phone == "")
      this.pageModel.errorMsgs.push("Verifique el teléfono de cliente")

    return this.pageModel.errorMsgs.length == 0
  }

  confirmClientAddition(): void {
    let c: Client = {
      name: this.client.name,
      rfc: this.client.rfc,
      mail: this.client.mail,
      phone: this.client.phone,
      address: this.client.address
    }

    this.clientService.createClient(c)
      .then((client) => {
        this.selectedClient = client
        this.addNewClient.close()
      })
      .catch(this.handleError)

  }

  cancelClientAddition(): void {

  }

}
