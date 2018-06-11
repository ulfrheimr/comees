import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular/main";

@Component({
  selector: 'mi-invoke',
  template: `<span><button style="height: 20px" (click)="select()">Seleccionar</button></span>`
})
export class CellButton implements ICellRendererAngularComp {
  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return true;
  }

  public select() {
    this.params.context.componentParent.onSelected(this.params.data);
  }
}
