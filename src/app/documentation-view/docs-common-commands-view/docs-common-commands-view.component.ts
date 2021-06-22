import { Component, OnInit } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-docs-common-commands-view',
  templateUrl: './docs-common-commands-view.component.html',
  styleUrls: ['./docs-common-commands-view.component.css']
})
export class DocsCommonCommandsViewComponent {

  openCommand = 'open: Member';
  closeCommand = 'close:';
  message = 'Code copied';
  action = 'Ok';

  constructor(private _snackBar: MatSnackBar) {}

  openSnackBar(): void {
    this._snackBar.open(this.message, this.action);
  }

}
