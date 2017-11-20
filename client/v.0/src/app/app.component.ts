import { Component } from '@angular/core';

import { UsrService } from './services/usr.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'consultorios Médicos Especializados';
  role: string;

  constructor(
    private usrService: UsrService
  ) {
    // this.role = this.getRole();
  }

  getRole(): string {
    let role = this.usrService.get()["role"];

    if (role["mi"])
      return role["mi"];
    else
      throw new Error();
  }

  getName(): string {
    let name: string = this.usrService.get()["name"];
    return name.split(" ")[0];
  }
}
