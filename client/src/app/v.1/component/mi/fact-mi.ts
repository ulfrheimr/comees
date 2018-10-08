import { Component, Input, OnInit, EventEmitter, ViewChild } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { MdlDialogComponent } from '@angular-mdl/core';

import { Mi } from '../../prots/mi/mi';
import { FactMI as FM } from '../../prots/mi/fact-mi';
import { MiProvider } from '../../prots/mi/mi-provider';

import { MiService } from '../../services/mi/mi.service';
import { MiProviderService } from '../../services/mi/mi-provider.service';
import { FactMIService } from '../../services/mi/fact-mi.service';
import { UsrService } from '../../services/usr.service';

@Component({
  selector: 'fact-mi',
  templateUrl: './fact-mi.html',
  styleUrls: ['./fact-mi.css'],
  providers: [
    MiService,
    MiProviderService,
    FactMIService,
    UsrService
  ]
})

export class FactMI implements OnInit {
  pageModel: any = {}
  mis: any[] = []
  miProviders: MiProvider[] = []
  selectedMI
  permissions
  @ViewChild('modifyMIDialog') private modifyMIDialog: MdlDialogComponent

  constructor(
    private miService: MiService,
    private miProviderService: MiProviderService,
    private factMIService: FactMIService,
    private usrService: UsrService
  ) {
    this.pageModel = {
      facts: null,
      provider: null
    }
  }

  ngOnInit(): void {
    this.findMiProviders()
    this.usrPermissions()
  }

  private usrPermissions(): void {
    this.permissions = this.usrService.get()["role"]
  }

  private handleError(error): Promise<any> {
    return Promise.reject(error.message || error);
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
          values.mis[k]["modified"] = true
        })

        let r = Object.keys(values.mis).map((k) => {
          return values.mis[k]
        })
        r = r.sort((x, y) => {
          var name_x = x.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
          var name_y = y.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "")

          // if (x.modified) return 1;
          // if (y.modified) return -1;
          if (name_x < name_y) return -1;
          if (name_x > name_y) return 1;
        })

        this.mis = r
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

  findMiProviders(): void {
    this.miProviderService.getMiProviders()
      .then((x) => {
        this.pageModel.facts = x
      });
  }

  setPrice(mi): void {
    let s = {
      price: parseFloat(mi.fact_price),
      id_provider: this.pageModel.provider,
      id_mi: mi._id
    }
    this.factMIService.putFactMIPrice(s)
      .then((x) => {
        mi["modified"] = true
      });
  }

  modifyMI(mi): void {
    this.selectedMI = mi
    this.modifyMIDialog.show()
  }

  // Dialog changeMI
  isModificationAllowed(): boolean {
    return true
  }

  confirmModification(): void {
    this.miService.changeMI(this.selectedMI)
      .then((res) => {
        this.modifyMIDialog.close()
      })
      .catch(this.handleError)
  }

  cancelModification(): void {
    this.selectedMI = null
    this.modifyMIDialog.close()
  }

  isAllowedChangePrice(): boolean {
    let allowed = Object.keys(this.permissions)
      .map((x) => {
        return this.permissions[x] == "adm"
      })
      .reduce((x, y) => x && y, true)
    return allowed
  }
}
