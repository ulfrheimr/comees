import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsrActivate } from './guard/usr-activate';

import { Login } from './login.component';

// import { Ph } from './ph/ph.component';
// import { PhSalesComponent } from './ph/sales.component';
// import { PrintPhTicketComponent } from './ph/print-ticket.component';
// import { SearchDrugComponent } from './ph/search-drug.component';
// import { ImportPurchase } from './ph/import-purchase.component';
//

import { MainMenuComponent } from './component/main-menu.component'

import { Mi } from './component/mi/mi';
import { MiSales } from './component/mi/sales.component';
import { PrintMiTicketComponent } from './component/mi/print-ticket.component';
import { MiSalesReportComponent } from './component/mi/sales-report.component';
import { ModifyMIComponent } from './component/mi/modify-mi.component';
import { MiPartialFollowingComponent } from './component/mi/partial-following.component';

import { McSales } from './component/mc/sales.component';
import { PrintMcTicketComponent } from './component/mc/print-ticket.component';
import { PartialFollowingComponent } from './component/mc/partial-following.component';

import { SalesReport } from './component/admin/report.component';
import { SalesCut } from './component/sales-cut.component';

import { ClientComponent } from './component/admin/client.component';


import { PrintComponent } from './print.component';
//
// import { UsrActivate } from './guard/usr-activate';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'mi', component: MainMenuComponent, canActivate: [UsrActivate],
    children: [
      { path: '', redirectTo: 'sales', pathMatch: 'full' },
      { path: 'sales', component: MiSales },
      { path: 'print-ticket/:id', component: PrintMiTicketComponent },
      // { path: 'sales-report', component: MiSalesReportComponent },
      { path: 'print', component: PrintComponent },
      { path: 'modify-mi', component: ModifyMIComponent, canActivate: [UsrActivate] },
      { path: 'partial-following', component: MiPartialFollowingComponent },
    ]
  },
  {
    path: 'mc', component: MainMenuComponent, canActivate: [UsrActivate],
    children: [
      { path: '', redirectTo: 'sales', pathMatch: 'full' },
      { path: 'sales', component: McSales },
      { path: 'print-ticket/:id', component: PrintMcTicketComponent },
      // { path: 'sales-report', component: MiSalesReportComponent },
      { path: 'print', component: PrintComponent },
      { path: 'partial-following', component: PartialFollowingComponent },
    ]
  },
  {
    path: 'cc', component: MainMenuComponent, canActivate: [UsrActivate],
    children: [
      { path: '', redirectTo: 'sales-cut', pathMatch: 'full' },
      // { path: 'sales-cut', component: SalesCut },
      // { path: 'print-ticket/:id', component: PrintMcTicketComponent },
      // { path: 'sales-report', component: MiSalesReportComponent },
      // { path: 'print', component: PrintComponent },
      // { path: 'partial-following', component: PartialFollowingComponent },
    ]
  },
  {
    path: 'adm', component: MainMenuComponent, canActivate: [UsrActivate],
    children: [
      { path: '', redirectTo: 'report', pathMatch: 'full' },
      { path: 'report', component: SalesReport },
      // { path: 'print-ticket/:id', component: PrintMcTicketComponent },
      // { path: 'sales-report', component: MiSalesReportComponent },
      // { path: 'print', component: PrintComponent },
      // { path: 'partial-following', component: PartialFollowingComponent },
    ]
  },
  { path: 'sales-cut', component: SalesCut },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
