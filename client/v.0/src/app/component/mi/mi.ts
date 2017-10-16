import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'mi',
  templateUrl: './mi.html',
  styleUrls: ['./mi.css'],
  providers: []
})

export class Mi {
  constructor(
    private router: Router
  ) {

  }

  // goTo(path: string): void {
  //   this.router.navigate([path])
  // }
}
