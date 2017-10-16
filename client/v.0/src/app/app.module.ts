import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MdlModule } from '@angular-mdl/core';

import { HttpModule } from '@angular/http';
import { AgGridModule } from "ag-grid-angular/main";

import { Login } from './login.component'
import { PrintComponent } from './print.component';

import { Mi } from './component/mi/mi';
import { MiSales } from './component/mi/sales.component';
import { PrintMiTicketComponent } from './component/mi/print-ticket.component';
import { PassMi } from './component/mi/pass-mi';

import { CellButton } from './cell.button.component';

@NgModule({
  declarations: [
    AppComponent,
    Login,
    PrintComponent,
    Mi,
    MiSales,
    PrintMiTicketComponent,
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

    AgGridModule.withComponents([
      CellButton
    ])
  ],
  providers: [
    PassMi,

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
