import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsrActivate } from './v.1/guard/usr-activate';

import { Login } from './login.component';

import { MainMenuComponent } from './main-menu'

import { McSales } from './v.1/component/mc/sales';
import { PrintMcTicket } from './v.1/component/mc/print-ticket'

import { MiSales } from './v.1/component/mi/sales'
import { PrintMiTicket } from './v.1/component/mi/print-ticket';

import { Print } from './v.1/component/shared/print';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'mc', component: MainMenuComponent,
    children: [
      { path: '', redirectTo: 'sales', pathMatch: 'full' },
      { path: 'sales', component: McSales },
      { path: 'print-ticket/:id', component: PrintMcTicket },
      { path: 'print', component: Print },
    ]
  },
  {
    path: 'mi', component: MainMenuComponent,
    children: [
      { path: '', redirectTo: 'sales', pathMatch: 'full' },
      { path: 'sales', component: MiSales },
      { path: 'print-ticket/:id', component: PrintMiTicket },
      { path: 'print', component: Print },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
