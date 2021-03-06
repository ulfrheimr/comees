import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { AppComponent } from './app.component';
import { MenuComponent } from './menu.component';
import { AppRoutingModule } from './app-routing.module';
import { MdlModule } from '@angular-mdl/core';
import { MdlSelectModule } from '@angular-mdl/select';

import { HttpModule } from '@angular/http';
import { AgGridModule } from "ag-grid-angular/main";
import { NgDatepickerModule } from 'ng2-datepicker';

import { ChartsModule } from 'ng2-charts';

import { UsrActivate } from './guard/usr-activate';
import { UsrService } from './services/usr.service'

import { Login } from './login.component'
import { PrintComponent } from './print.component';

import { MainMenuComponent } from './component/main-menu.component';

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
import { SalePaymentComponent } from './component/sale-payment.component';

import { CellButton } from './cell.button.component';

import { PassPrint } from './component/pass-print';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    Login,
    PrintComponent,

    MainMenuComponent,

    Mi,
    MiSales,
    PrintMiTicketComponent,
    MiSalesReportComponent,
    MiPartialFollowingComponent,

    McSales,
    PrintMcTicketComponent,
    PartialFollowingComponent,

    SalesCut,
    SalesReport,

    ClientComponent,
    SalePaymentComponent,
    ModifyMIComponent,
    CellButton
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    MdlModule,
    MdlSelectModule,
    NgDatepickerModule,

    ChartsModule,

    AgGridModule.withComponents([
      CellButton
    ])
  ],
  providers: [
    PassPrint,
    UsrService,
    UsrActivate,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
