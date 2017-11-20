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

import { McSales } from './component/mc/sales.component';
import { PrintMcTicketComponent } from './component/mc/print-ticket.component';
import { PartialFollowingComponent } from './component/mc/partial-following.component';

import { ClientComponent } from './component/admin/client.component';

// import { InvoiceComponent } from './admin/invoices.component';
//
// import { ClientComponent } from './cc/client.component';
//
// import { Sales } from './sales.component';
//
// import { Admin } from './admin/admin.component';
// import { ModifyMIComponent } from './admin/modify_mi.component';
//

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
      { path: 'sales-report', component: MiSalesReportComponent },
      { path: 'print', component: PrintComponent },
      { path: 'modify-mi', component: ModifyMIComponent, canActivate: [UsrActivate] },
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
  // {
  //   path: 'ph', component: Ph, canActivate: [UsrActivate],
  //   children: [
  //     { path: '', redirectTo: 'sales', pathMatch: 'full' },
  //     { path: 'ph', redirectTo: 'sales', pathMatch: 'full' },
  //     { path: 'sales', component: PhSalesComponent },
  //     { path: 'client/:type/:id', component: ClientComponent },
  //     { path: 'ph/print-ticket/:id', component: PrintPhTicketComponent },
  //     { path: 'search-drug', component: SearchDrugComponent },
  //     { path: 'import', component: ImportPurchase }
  //   ]
  // },
  // {
  //   path: 'mi', component: Mi, canActivate: [UsrActivate],
  //   children: [
  //     { path: '', redirectTo: 'sales', pathMatch: 'full' },
  //     { path: 'mi', redirectTo: 'sales', pathMatch: 'full' },
  //     { path: 'sales', component: MiSales },
  //     { path: 'print-ticket/:id', component: PrintMiTicketComponent },
  //     { path: 'sales-report', component: MiSalesReportComponent },
  //     { path: 'print', component: PrintComponent },
  //     { path: 'modify-mi', component: ModifyMIComponent, canActivate: [UsrActivate] },
  //   ]
  // },
  // {
  //   path: 'mc', component: Mi, canActivate: [UsrActivate],
  //   children: [
  //     // { path: '', redirectTo: 'sales', pathMatch: 'full' },
  //     // { path: 'mi', redirectTo: 'sales', pathMatch: 'full' },
  //     { path: 'sales', component: ClientComponent },
  //     // { path: 'print-ticket/:id', component: PrintMiTicketComponent },
  //     // { path: 'sales-report', component: MiSalesReportComponent },
  //     // { path: 'print', component: PrintComponent },
  //     // { path: 'modify-mi', component: ModifyMIComponent, canActivate: [UsrActivate] },
  //   ]
  // },
  // {
  //   path: 'sales', component: Sales, canActivate: [UsrActivate],
  //   children: [
  //     { path: 'ph', redirectTo: 'ph/sales', pathMatch: 'full' },
  //     { path: 'ph/sales', component: PhSalesComponent },
  //     { path: 'client/:type/:id', component: ClientComponent },
  //     { path: 'ph/print-ticket/:id', component: PrintPhTicketComponent },
  //     { path: 'ph/search-drug', component: SearchDrugComponent },
  //     { path: 'mi', redirectTo: 'mi/sales', pathMatch: 'full' },
  //     { path: 'mi/sales', component: MiSalesComponent },
  //     { path: 'mi/print-ticket/:id', component: PrintMiTicketComponent },
  //   ]
  // }
  // ,
  // {
  //   path: 'admin', component: Admin, canActivate: [UsrActivate],
  //   children: [
  //     { path: 'ph', redirectTo: 'ph/sales', pathMatch: 'full' },
  //     { path: 'ph/sales', component: PhSalesComponent },
  //     { path: 'client/:type/:id', component: ClientComponent },
  //     { path: 'ph/print-ticket/:id', component: PrintPhTicketComponent },
  //     { path: 'ph/search-drug', component: SearchDrugComponent },
  //     { path: 'mi', redirectTo: 'mi/sales', pathMatch: 'full' },
  //     { path: 'mi/sales', component: MiSalesComponent },
  //     { path: 'mi/sales-report', component: MiSalesReportComponent },
  //     { path: 'print', component: PrintComponent },
  //     { path: 'mi/print-ticket/:id', component: PrintMiTicketComponent },
  //     { path: 'admin/invoices', component: InvoiceComponent },
  //     { path: 'admin/modify_mi', component: ModifyMIComponent }
  //   ]
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
