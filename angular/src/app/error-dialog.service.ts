import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component'
@Injectable()
export class ErrorDialogService {

    constructor(public dialog: MatDialog) { }
    openDialog(data): void {
        const dialogRef = this.dialog.open(ErrorDialogComponent, {
            width: '300px',
            data: data
        });
        console.log(data)
        dialogRef.afterClosed().subscribe(result => {
        });
    }
}