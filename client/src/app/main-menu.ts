import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { UsrService } from './v.1/services/usr.service';

import { MdlDialogComponent } from '@angular-mdl/core';
import { MdlSnackbarService } from '@angular-mdl/core';;

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.html',
  styleUrls: ['./main-menu.css']
})
export class MainMenuComponent {
  @ViewChild('salesCutDialog') private salesCutDialog: MdlDialogComponent;

  role: string;

  constructor(
    private usrService: UsrService,
    private router: Router,
    private mdlSnackbarService: MdlSnackbarService
  ) {
    this.role = this.getRole();
    // this.usrService.getFirstLoginTime()
    //   .then((l) => {
    //     if (this.role == "adm")
    //       return
    //
    //     if (l.is_closed)
    //       this.router.navigate(['./sales-cut'])
    //   })
    //   .catch((err) => {
    //     if (err.status == 401)
    //       this.router.navigate(['./'])
    //
    //     this.handleError(err)
    //   });
  }

  private handleError(error: any): Promise<any> {
    console.log(error);
    return Promise.reject(error.message || error);
  }

  getRole(): string {
    let role = this.usrService.get()["role"];

    if (role["mi"] || role["mc"])
      return role["mi"];
    else
      throw new Error();
  }

  getName(): string {
    let name: string = this.usrService.get()["name"];
    return name.split(" ")[0];
  }

  //SALES CUT WINDOW

  closeSession(): void {
    this.router.navigate(['./sales-cut'])
  }

}
