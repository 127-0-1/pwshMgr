import { Component, OnInit, Inject } from '@angular/core';
import { Script } from '../script.model';
import { ScriptService } from '../script.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-script-details',
  templateUrl: './script-details.component.html',
  styleUrls: ['./script-details.component.css']
})
export class ScriptDetailsComponent implements OnInit {

  script: Script
  id: String

  constructor(private scriptService: ScriptService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.scriptService.getScriptById(this.id)
      .subscribe(script => { this.script = script })
  }

  deleteScript() {
    if (confirm("Are you sure to delete?")) {
      this.scriptService.deleteScript(this.script._id)
        .subscribe()
      this.router.navigate(['main/scripts'])
    }
  }

  edit() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.data = this.script
    dialogConfig.autoFocus = true;
    dialogConfig.width = '700px'
    dialogConfig.height = '700px'
    dialogConfig.position = { top: '10%' }
    const dialogRef = this.dialog.open(EditScriptDialog, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      this.scriptService.getScriptById(this.id)
      .subscribe(script => { this.script = script })
    });
  }
}


@Component({
  selector: 'edit-script-dialog',
  templateUrl: 'edit-script-dialog.html',
  styleUrls: ['./edit-script-dialog.css']
})
export class EditScriptDialog implements OnInit {

  scripts: Script[]
  editScriptForm: FormGroup

  constructor(
    public dialogRef: MatDialogRef<EditScriptDialog>,
    private scriptService: ScriptService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Script
  ) {
    this.editScriptForm = this.formBuilder.group({
      'name': ['', [Validators.required]],
      'scriptBody': ['', [Validators.required]]
    })
  }

  ngOnInit() {
    this.editScriptForm.patchValue(this.data);

  }

  submitForm(script: Script) {
    this.scriptService.updateScript(script, this.data._id).subscribe()
    this.dialogRef.close()
  }
}