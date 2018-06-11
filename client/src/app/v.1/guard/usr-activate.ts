import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { UsrService } from '../services/usr.service';

@Injectable()
export class UsrActivate implements CanActivate {
  private allowedMiSales = {

  }
  constructor(
    private router: Router,
    private usrService: UsrService
  ) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    let role: string = this.usrService.get()["role"];
    

    // console.log(route.url[0].path)
    // console.log(this.usrService.get())

    return true;
    // var r = JSON.parse(role);
    //
    // if (r["ph"] == "adm" && r["mi"] == "adm") {
    //   return true;
    // }
    // else if (r["ph"] == "sales" && r["mi"] == "sales") {
    //   if (next == "sales")
    //     return true;
    //
    //   return false;
    // }
    // else if (r["ph"] == "adm") {
    //
    // }
    // else if (r["ph"] == "sales") {
    //   if (next == "ph")
    //     return true;
    // }
    // else if (r["mi"] == "adm") {
    //
    // }
    // else if (r["mi"] == "sales") {
    //   if (next == "mi")
    //     return true;
    // }
    //
    //
    // return false;
  }

  drop(): void {
    // this.usrService.dropInfo();
  }
}
