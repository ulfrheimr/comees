import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Login } from './login.component';

import { MainMenuComponent } from './main-menu'

import { McSales } from './v.1/component/mc/sales';
import { PrintMcTicket } from './v.1/component/mc/print-ticket'

import { MiSales } from './v.1/component/mi/sales'
import { MICompare } from './v.1/component/mi/mi-compare'
import { FactMI } from './v.1/component/mi/fact-mi'
import { PrintMiTicket } from './v.1/component/mi/print-ticket';

import { SalesReport } from './v.1/component/admin/sales-report'
import { Patient } from './v.1/component/mc/patient';

import { Print } from './v.1/component/shared/print';
import { UsrActivate } from './v.1/guard/usr-activate';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'mc', component: MainMenuComponent,
    children: [
      { path: '', redirectTo: 'sales', pathMatch: 'full' },
      { path: 'sales', component: McSales },
      { path: 'patients', component: Patient },
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
      { path: 'fact-mi', component: FactMI },
      { path: 'print', component: Print },
    ]
  },
  {
    path: 'admin', component: MainMenuComponent,
    children: [
      { path: '', redirectTo: 'sales-report', pathMatch: 'full' },
      { path: 'sales-report', component: SalesReport },
      { path: 'mi-compare', component: MICompare },
      // { path: 'print-ticket/:id', component: PrintMcTicketComponent },
      // { path: 'sales-report', component: MiSalesReportComponent },
      // { path: 'print', component: PrintComponent },
      // { path: 'partial-following', component: PartialFollowingComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
