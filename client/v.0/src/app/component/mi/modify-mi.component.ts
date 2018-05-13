import { Component, Input, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { GridOptions } from "ag-grid";
import { CellButton } from '../../cell.button.component';

import { MdlDialogComponent } from '@angular-mdl/core';

import { Angular2Csv } from 'angular2-csv/Angular2-csv';

import { Mi } from '../../prots/mi/mi';

import { MiService } from '../../services/mi/mi.service';
import { CatService } from '../../services/mi/cat.service';

@Component({
  selector: 'modify_mi',
  templateUrl: './modify-mi.component.html',
  styleUrls: ['./modify-mi.component.css'],
  providers: [
    MiService,
    CatService
  ]
})


export class ModifyMIComponent implements OnInit {
  private gridOptions: GridOptions;
  private pageModel: any;
  mis: Mi[];
  cats: any[];
  selectedMi: any;

  @ViewChild('confirmDialog') private confirmDialog: MdlDialogComponent;



  constructor(
    private miService: MiService,
    private catService: CatService
  ) {
    this.pageModel = {
      hint: undefined,
      correctInfo: false,
      addNewMi: false
    }
  }

  ngOnInit(): void {
    this.getCats();
    this.findMis();

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
        headerName: "Muestra",
        field: "sample"
      },
      {
        headerName: "Entrega",
        field: "delivery_time"
      },
      {
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

  getCats(): void {
    this.catService.getCats()
      .then((x) => {
        this.cats = x;
      });
  }

  onSelected(mi: Mi): void {
    this.selectedMi = mi;
    this.pageModel.isModified = true;
  }

  newMI(): void {
    this.selectedMi = { category: { _id: "" } };
    this.pageModel.addNewMi = true;
  }

  modifyMI(): void {
    this.miService.changeMi(this.selectedMi)
      .then((x) => {
        if (x) {
          this.confirmDialog.close();
          this.gridOptions.api.setRowData([]);
        }
        this.cancel();
      })
  }

  hasErrors(): string {
    let hasErrors: boolean = false;
    let acc: string = "";
    this.pageModel.correctInfo = false;

    if (!this.selectedMi["name"] || this.selectedMi["name"] == "") {
      hasErrors = true;
      acc += "Verifique el campo de nombre \n";
    }

    if (!this.selectedMi["price"] || this.selectedMi["price"] == "" || isNaN(this.selectedMi["price"])) {
      hasErrors = true;
      acc += "Verifique el campo de precio \n";
    }


    if (!this.selectedMi["delivery_time"] || this.selectedMi["delivery_time"] == "") {
      hasErrors = true;
      acc += "Verifique el campo de tiempo entrega \n";
    }

    if (!this.selectedMi["sample"] || this.selectedMi["sample"] == "") {
      hasErrors = true;
      acc += "Verifique el campo de tipo de muestra \n";
    }


    if (hasErrors)
      return acc;
    this.pageModel.correctInfo = true;
    return "INFORMACIÓN CORRECTA";
  }

  export(): void {
    var data = [{
      "1": "ID",
      "2": "ESTUDIO",
      "3": "DESCRIPCIÓN",
      "4": "TIEMPO DE ENTREGA",
      "5": "TIPO DE MUESTRA",
      "6": "CATEGORIA",
      "7": "PRECIO DE VENTA",
      "8": "DISPONIBLE"
    }]

    this.miService.getMis("")
      .then((mis) => {
        data = data.concat(mis
          .filter((x) =>
            x.category != undefined
          )
          .map((x) => {
            return {
              "1": x._id,
              "2": x.name,
              "3": x.description,
              "4": x.delivery_time,
              "5": x.sample,
              "6": x.category.name,
              "7": x.price,
              "8": "1"
            }
          })
        )

        new Angular2Csv(data, "mis");
      })
      .catch(this.handleError);
  }

  addMi(): void {
    let m = {
      catId: this.selectedMi.category._id,
      name: this.selectedMi.name,
      price: this.selectedMi.price,
      desc: this.selectedMi.description,
      delivery: this.selectedMi.delivery_time,
      sample: this.selectedMi.sample
    }

    this.miService.addMi(m)
      .then((x) => {
        if (x) {
          this.mis = [];
          this.confirmDialog.close();
        }

        this.cancel();
      })
  }

  cancel(): void {
    this.selectedMi = undefined;
    this.pageModel.addNewMi = false;
  }

}
