import { OnInit, Component, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { UsrService } from './v.1/services/usr.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [
    UsrService
  ]
})

export class Login implements OnInit {
  usr: string;
  pass: string;
  error: string;

  constructor(
    private router: Router,
    private usrService: UsrService,
  ) {

  }
  ngOnInit(): void {

  }

  login(): void {
    this.error = null;
    this.usrService.init(this.usr, this.pass)
      .then((role) => {
        if (!role) {
          this.error = "Por favor revise sus credenciales y vuelva a intentar"
          return;
        }

        console.log(role)

        if (role["mi"])
          this.router.navigate(['./mi/'])
        else if (role["mc"])
          this.router.navigate(['./mc/'])
      }).catch((err) => {
        this.error = "Por favor revise sus credenciales y vuelva a intentar"
        console.log(err);
      })

  }
}
