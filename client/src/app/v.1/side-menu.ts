import { Component } from '@angular/core';
import { UsrService } from './services/usr.service';

import { Router } from '@angular/router';

@Component({
  selector: 'side-menu',
  templateUrl: './side-menu.html',
  styleUrls: ['./side-menu.css']
})
export class SideMenuComponent {
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
