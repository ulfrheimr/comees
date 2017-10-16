import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'

@Injectable()
export class Assets {
  private config: any;
  constructor(
    private http: Http
  ) {

  }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }

  private load() {
    return new Promise((resolve, reject) => {
      this.http.get('assets/config/env.json')
        .map(r => r.json())
        .subscribe(data => {
          resolve(data);
        });
    });

  }

  private asText(num: string): string {

    if (num.length == 4 && num[0] == "1") {
      return "mil " + this.asText(num.slice(-3));
    }
    else if (num.length > 3) {
      let temp: string = "";
      let left: string = "";
      let current: string = num;

      while (current.length > 3) {
        left = current.slice(-3) + left
        current = current.slice(0, -3)
      }

      temp += this.asText(current) + " mil " + this.asText(left)

      return temp;
    }
    else if (num.length > 2) {
      let temp: string = "";

      switch (num[0]) {
        case "1":
          temp += "cien";
          if (num.slice(1, 3) != "00")
            temp += "to"
          break;
        case "2":
          temp += "doscientos";
          break;
        case "3":
          temp += "trescientos";
          break;
        case "4":
          temp += "cuatrocientos";
          break;
        case "5":
          temp += "quinientos";
          break;
        case "6":
          temp += "seiscientos";
          break;
        case "7":
          temp += "setecientos";
          break;
        case "8":
          temp += "ochocientos";
          break;
        case "9":
          temp += "novecientos";
      }

      temp += " " + this.asText(num.slice(1, 3))

      return temp;

    }
    else if (num.length == 2 && num[0] == "1") {
      switch (num) {
        case "10":
          return "diez";
        case "11":
          return "once";
        case "12":
          return "doce";
        case "13":
          return "trece";
        case "14":
          return "catorce";
        case "15":
          return "quince";
        case "16":
          return "dieciseis";
        case "17":
          return "diecisiete";
        case "18":
          return "dieciocho";
        case "19":
          return "diecinueve";
      }
    }
    else if (num.length == 2 && num[0] == "2") {
      if (num == "20") return "veinte";
      return "veinti" + this.asText(num[1]);
    }
    else if (num.length == 2) {
      let temp = "";
      switch (num[0]) {
        case "3":
          temp += "treinta";
          break;
        case "4":
          temp += "cuarenta";
          break;
        case "5":
          temp += "cincuenta";
          break;
        case "6":
          temp += "sesenta";
          break;
        case "7":
          temp += "setenta";
          break;
        case "8":
          temp += "ochenta";
          break;
        case "9":
          temp += "noventa";
          break;
      }

      if (num[1] != "0")
        temp = temp + " y " + this.asText(num[1])

      return temp;
    }
    else if (num.length == 1) {
      switch (num) {
        case "1":
          return "uno";
        case "2":
          return "dos";
        case "3":
          return "tres";
        case "4":
          return "cuatro";
        case "5":
          return "cinco";
        case "6":
          return "seis";
        case "7":
          return "siete";
        case "8":
          return "ocho";
        case "9":
          return "nueve";
      }
    }
    return "";
  }

  get(key: string): any {

    if (this.config == undefined) {
      this.load()
        .then(r => {
          this.config = r['config'];
          return this.config[key];
        })
        .catch(this.handleError);
    }
    else {
      return this.config[key];
    }
  }

  getAssets(): any {
    return this.load();

  }

  getNumToText(num: number): string {
    let roundNum: number = parseInt("" + num);
    let cents = "(" + parseInt("" + ((num - roundNum) * 100)) + "/100)";

    let curr: string = "" + roundNum;

    return this.asText("" + roundNum) + " pesos " + cents;
  }



}
