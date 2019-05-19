import { Component, OnInit } from '@angular/core';
import { Script } from '../script.model';
import { ScriptService } from '../script.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-new-script',
  templateUrl: './new-script.component.html',
  styleUrls: ['./new-script.component.css']
})
export class NewScriptComponent implements OnInit {

  newScriptForm: FormGroup;
  script: Script

  constructor(
    private scriptService: ScriptService,
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogRef: MatDialogRef<NewScriptComponent>
  ) {
    this.newScriptForm = this.formBuilder.group({
      'name': ['', [Validators.required]],
      'scriptBody': ['', [Validators.required]]
    });
  }

  ngOnInit() { }


  submitForm(newScript: Script) {
    this.scriptService.postScript(newScript)
      .subscribe(newScript => {
        this.router.navigate(['main/scripts/' + newScript._id])
        this.dialogRef.close()
      });
  }

}