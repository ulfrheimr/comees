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
          console.log(x)
          this.mis = x;
          this.gridOptions.api.setRowData(this.mis);
        });
  }

  getCats(): void {
    this.catService.getCats()
      .then((x) => {
        console.log(x)
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
      "1": "ESTUDIO",
      "2": "DESCRIPCIÓN",
      "3": "TIEMPO DE ENTREGA",
      "4": "TIPO DE MUESTRA",
      "5": "CATEGORIA",
      "6": "PRECIO DE VENTA"
    }]

    this.miService.getMis("")
      .then((mis) => {
        data = data.concat(mis
          .filter((x) =>
            x.category != undefined
          )
          .map((x) => {
            console.log(x)
            return {
              "1": x.name,
              "2": x.description,
              "3": x.delivery_time,
              "4": x.sample,
              "5": x.category.name,
              "6": x.price
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
