import { Component } from '@angular/core';
import { UsrService } from './services/usr.service';

import { Router } from '@angular/router';

@Component({
  selector: 'global-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  roles: any;

  constructor(
    private usrService: UsrService,
    private router: Router
  ) {
    this.roles = this.usrService.get()["role"];
  }

  closeSession(): void {
    this.router.navigate(['./sales-cut'])
  }
}
