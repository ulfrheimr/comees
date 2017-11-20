import { Component, Input, OnInit, EventEmitter, ViewChild, Output } from '@angular/core';
import { Router } from '@angular/router';
//
import { GridOptions } from "ag-grid";
import { CellButton } from '../../cell.button.component';

import { MdlDialogComponent } from '@angular-mdl/core';
//
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';
//
import { Client } from '../../prots/admin/client';

import { ClientService } from '../../services/admin/client.service';
// import { CatService } from '../../services/mi/cat.service';

@Component({
  selector: 'client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css'],
  providers: [
    ClientService
    // CatService
  ]
})


export class ClientComponent implements OnInit {
  private gridOptions: GridOptions;
  private client: any;
  private pageModel: any;
  clients: Client[];
  selectedClient: Client;

  @Output() onClientSelected = new EventEmitter<Client>();
  @ViewChild('confirmDialog') private confirmDialog: MdlDialogComponent;

  constructor(
    private clientService: ClientService,
    // private catService: CatService
  ) {
    this.client = {
      name: "",
      rfc: "",
      mail: "",
      phone: "",
      address: ""
    }

    this.pageModel = {
      hint: "",
      addNewClient: false,
      isClientCorrect: false,
    }
  }

  ngOnInit(): void {
    // this.getCats();
    // this.findMis();
    //
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      }
    };
    this.gridOptions.columnDefs = [
      {
        headerName: "Cliente",
        field: "name"
      }, {
        headerName: "RFC",
        field: "rfc"
      },
      {
        headerName: "Correo",
        field: "mail"
      },
      {
        headerName: "Teléfono",
        field: "phone"
      },
      {
        headerName: "Dirección",
        field: "address"
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

  findClients(): void {
    if (this.pageModel.hint != "") {
      this.clientService.getClients(this.pageModel.hint)
        .then((r) => {
          this.clients = r;
          this.gridOptions.api.setRowData(this.clients);
        })
        .catch(this.handleError)

    }
  }

  newClient(): void {
    let c: Client = {
      name: this.client.name,
      rfc: this.client.rfc,
      mail: this.client.mail,
      phone: this.client.phone,
      address: this.client.address
    }

    this.clientService.createClient(c)
      .then((client) => {
        if (client != undefined) {
          this.pageModel.addNewClient = false;
          this.confirmDialog.close();

          this.onClientSelected.emit(client);
        }
      })
      .catch(this.handleError);
  }

  onSelected(client: Client): void {
    this.selectedClient = client;
    this.onClientSelected.emit(client);
  }

  // Validations
  isClientCorrect(): string[] {
    let msgs: string[] = [];
    this.pageModel.isClientCorrect = true;

    if (!this.client.name || this.client.name == "") {
      this.pageModel.isClientCorrect = false;
      msgs.push("Verifique el nombre de cliente")
    }

    if (!this.client.phone || this.client.phone == "") {
      this.pageModel.isClientCorrect = false;
      msgs.push("Verifique el teléfono de cliente")
    }

    return msgs;
  }


  //
  // modifyMI(): void {
  //   this.miService.changeMi(this.selectedMi)
  //     .then((x) => {
  //       if (x) {
  //         this.confirmDialog.close();
  //         this.gridOptions.api.setRowData([]);
  //       }
  //       this.cancel();
  //     })
  // }
  //
  // export(): void {
  //   var data = [{
  //     "1": "ESTUDIO",
  //     "2": "DESCRIPCIÓN",
  //     "3": "TIEMPO DE ENTREGA",
  //     "4": "TIPO DE MUESTRA",
  //     "5": "CATEGORIA",
  //     "6": "PRECIO DE VENTA"
  //   }]
  //
  //   this.miService.getMis("")
  //     .then((mis) => {
  //       data = data.concat(mis
  //         .filter((x) =>
  //           x.category != undefined
  //         )
  //         .map((x) => {
  //           console.log(x)
  //           return {
  //             "1": x.name,
  //             "2": x.description,
  //             "3": x.delivery_time,
  //             "4": x.sample,
  //             "5": x.category.name,
  //             "6": x.price
  //           }
  //         })
  //       )
  //
  //       new Angular2Csv(data, "mis");
  //     })
  //     .catch(this.handleError);
  // }
  //

  //
  // cancel(): void {
  //   this.selectedMi = undefined;
  //   this.pageModel.addNewMi = false;
  // }

}
