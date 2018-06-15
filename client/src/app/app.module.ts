import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {NgxPaginationModule} from 'ngx-pagination'

import { AppComponent } from './app.component';

import { MomentModule } from 'angular2-moment/moment.module'

import { AppRoutingModule } from './app-routing.module';
import { HttpModule } from '@angular/http';

import { MdlModule } from '@angular-mdl/core';
// import { MdlSelectModule } from '@angular-mdl/select';

import { Login } from './login.component'


// Menus
import { MainMenuComponent } from './main-menu'
import { SideMenuComponent } from './v.1/side-menu';

//Shared Components
import { ClientSelection } from './v.1/client-selection';
import { SalePaymentComponent } from './v.1/component/shared/sale-payment';
import { PartialConfirmation } from './v.1/component/shared/partial-confirmation';
import { PassPrint } from './v.1/component/pass-print'

//Pages
import { McSales } from './v.1/component/mc/sales';
import { PrintMcTicket } from './v.1/component/mc/print-ticket'

import { MiSales } from './v.1/component/mi/sales'
import { FactMI } from './v.1/component/mi/fact-mi'
import { PrintMiTicket } from './v.1/component/mi/print-ticket'

import { Print } from './v.1/component/shared/print'

import { UsrService } from './v.1/services/usr.service'

// import { AgGridModule } from "ag-grid-angular/main";
// import { NgDatepickerModule } from 'ng2-datepicker';
//
// import { ChartsModule } from 'ng2-charts';
//
// import { UsrActivate } from './guard/usr-activate';

// import { PrintMiTicketComponent } from './component/mi/print-ticket.component';
// import { MiSalesReportComponent } from './component/mi/sales-report.component';
// import { ModifyMIComponent } from './component/mi/modify-mi.component';
// import { MiPartialFollowingComponent } from './component/mi/partial-following.component';
//

// import { PrintMcTicketComponent } from './component/mc/print-ticket.component';
// import { PartialFollowingComponent } from './component/mc/partial-following.component';
//
// import { SalesReport } from './component/admin/report.component';
// import { SalesCut } from './component/sales-cut.component';
//
// import { ClientComponent } from './component/admin/client.component';

//
// import { CellButton } from './cell.button.component';
//


@NgModule({
  declarations: [
    AppComponent,

    Login,
    // Menus
    SideMenuComponent,
    MainMenuComponent,
    // Shared Components
    ClientSelection,
    SalePaymentComponent,
    PartialConfirmation,
    McSales,
    PrintMcTicket,

    MiSales,
    FactMI,
    PrintMiTicket,

    Print
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,

    MdlModule,
    MomentModule,
    NgxPaginationModule
  ],
  providers: [
    PassPrint,
    UsrService,
    // UsrActivate,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
