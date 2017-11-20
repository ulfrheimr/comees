import { Component } from '@angular/core';

import { UsrService } from '../services/usr.service';

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent {

  role: string;

  constructor(
    private usrService: UsrService
  ) {
    this.role = this.getRole();
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
}
