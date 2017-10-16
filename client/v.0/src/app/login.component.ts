import { OnInit, Component, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [
  ]
})

export class Login implements OnInit {
  constructor(
    private router: Router
  ) {

  }
  ngOnInit(): void {

  }

  login(): void {
    this.router.navigate(['./mi/'])

    // this.usrService.init(this.pageModel.usr, this.pageModel.pass)
    //   .then(u => {
    //     var r = JSON.parse(u.role);
    //     console.log(r)
    //
    //     if (r["ph"] == "adm" && r["mi"] == "adm") {
    //       this.router.navigate(['./admin/'])
    //     } else if (r["ph"] == "sales" && r["mi"] == "sales")
    //       this.router.navigate(['./sales/'])
    //     else if (r["ph"] == "adm") {
    //
    //     } else if (r["mi"] == "adm") {
    //
    //     } else if (r["ph"] == "sales")
    //       this.router.navigate(['./ph/'])
    //     else if (r["mi"] == "sales")
    //       this.router.navigate(['./mi/'])
    //     else this.error = "Por favor revise sus credenciales y vuelva a intentar"
    //   })
  }
}
