import { Component } from '@angular/core';
import { UsrService } from './services/usr.service';

@Component({
  selector: 'global-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  roles: any;

  constructor(
    private usrService: UsrService
  ) {
    this.roles = this.usrService.get()["role"];
  }
}
