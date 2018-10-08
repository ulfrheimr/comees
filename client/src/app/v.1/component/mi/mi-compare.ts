import { Component, Input, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Mi } from '../../prots/mi/mi'
import { FactMI as FM } from '../../prots/mi/fact-mi'

import { MiService } from '../../services/mi/mi.service';
import { MiProviderService } from '../../services/mi/mi-provider.service';
import { FactMIService } from '../../services/mi/fact-mi.service'

import mathjs from 'mathjs'

@Component({
  selector: 'mi-compare',
  templateUrl: './mi-compare.html',
  styleUrls: ['./mi-compare.css'],
  providers: [
    MiService,
    MiProviderService,
    FactMIService,
    // UsrService
  ]
})

export class MICompare implements OnInit {
  pageModel: any = {}
  mis: any[] = []

  options = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    headers: ['column 1 header', 'column 2 header'],
    showTitle: true,
    useBom: true,
    removeNewLines: false,
    keys: []
  };

  constructor(
    private miService: MiService,
    private miProviderService: MiProviderService,
    private factMIService: FactMIService,
    // private usrService: UsrService
  ) {
    this.pageModel = {
      sort: "profit",
      stats: null,
      statsValues: {
        min: null,
        max: null,
        total: null,
        avg: null,
        missing: null,
        added: null
      }
      // provider: null
    }
  }

  ngOnInit(): void {
    this.findMiProviders()
    // this.usrPermissions()
  }

  private handleError(error): Promise<any> {
    return Promise.reject(error.message || error);
  }

  private checkProfit(fact, mi): Number {
    if (fact > mi) return 1
    else return 2
  }

  private createStats(): void {
    let added = this.mis.filter((x) => x.fact_price != null)
    let addedRes = added.map((x) => {
      return ((x.price / x.fact_price) - 1) * 100
    })

    this.pageModel.statsValues = {
      min: mathjs.min(addedRes),
      max: mathjs.max(addedRes),
      total: this.mis.length,
      avg: mathjs.mean(addedRes),
      missing: this.mis.length - added.length,
      added: added.length
    }

  }

  findMiProviders(): void {
    this.miProviderService.getMiProviders()
      .then((x) => {
        this.pageModel.facts = x
      });
  }

  fetchMIs(): void {
    if (!this.pageModel.provider)
      return

    let values = {
      "mis": null,
      "factMis": null
    }

    let r = new Observable(observer => {
      var join = (value) => {
        Object.keys(value).forEach((k) => {
          values[k] = value[k]
        })

        let isOver = Object.keys(values).map((k) => values[k])
          .filter((x) => x == null).length

        if (isOver == 0)
          observer.complete()
      }

      this.findMis()
        .then((mis) => {
          let res = {}
          mis.forEach((m) => {
            res[m._id] = m
            res[m._id]["status"] = 0
          })

          join({ "mis": res })
        })

      this.findFactMIs(this.pageModel.provider)
        .then((mis) => {
          let res = {}
          mis.forEach((m) => {
            res[m.ID_MI] = m
          })

          join({ "factMis": res })
        })
    })

    let subscription = r.subscribe(
      (value) => {

      },
      (errors) => {

      },
      () => {
        Object.keys(values.factMis).forEach((k) => {
          values.mis[k]["fact_price"] = values.factMis[k].price
          values.mis[k]["status"] = this.checkProfit(values.mis[k]["fact_price"], values.mis[k]["price"])
        })

        let r = Object.keys(values.mis).map((k) => {
          return values.mis[k]
        })

        r = r.sort((x, y) => {
          if (this.pageModel.sort == "name") {
            if (x.modified) return 1;
            if (y.modified) return -1;
            if (x.name < y.name) return -1;
            if (x.name > y.name) return 1;
          } else {
            if (!x.fact_price) return -1
            if (!y.fact_price) return 1
            if ((x.price / x.fact_price) < (y.price / y.fact_price)) return -1
            if ((x.price / x.fact_price) > (y.price / y.fact_price)) return 1
          }
        })



        let results = r.filter(x => x["fact_price"] != null)
          .map(x => {
            return {
              "name": x["name"],
              "description": x["description"],
              "price": x["price"],
              "fact_price": x["fact_price"],
              "diff": parseFloat(x["price"]) - parseFloat(x["fact_price"])
            }
          }).sort((x, y) => {
            if (x.diff > y.diff) return -1
            else return 1
          })

        let msg = results.map(x => x["name"] + ";" + x["description"] + ";" + x["price"] + ";" + x["fact_price"] + ";" + x["diff"] + "\n")


        console.log(msg)

        this.mis = r
        this.createStats()
      }
    )

  }

  findMis(): Promise<Mi[]> {
    return new Promise((resolve, reject) => {
      this.miService.getMis("")
        .then((x) => {
          let res = x.sort((x, y) => {
            if (x.name > y.name)
              return 1

            if (x.name < y.name)
              return -1

            return 0
          })

          resolve(res)
        });
    })

  }

  findFactMIs(provider: string): Promise<FM[]> {
    return new Promise((resolve, reject) => {
      this.factMIService.getFactMIs(provider)
        .then((x) => {
          resolve(x)
        });
    })
  }

  setPrice(mi): void {

    console.log(mi)
    let s = {
      price: parseFloat(mi.fact_price),
      id_provider: this.pageModel.provider,
      id_mi: mi._id
    }

    this.miService.changeMI(mi)
      .then((res) => {
        mi.status = -1
      })
      .catch(this.handleError)
  }
}
