import { Component, OnInit, Inject } from '@angular/core';
import { GroupService } from 'src/app/group/group.service';
import { Group } from 'src/app/group/group.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

export interface DialogData {
  machineId: string;
}

@Component({
  selector: 'app-machine-add-to-group-dialog',
  templateUrl: './machine-add-to-group-dialog.component.html',
  styleUrls: ['./machine-add-to-group-dialog.component.css']
})
export class MachineAddToGroupDialogComponent implements OnInit {

  groups: Group[]
  newGroupForm: FormGroup

  constructor(
    private groupService: GroupService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<MachineAddToGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { 
    this.newGroupForm = this.formBuilder.group({
      'group': ['', [Validators.required]]
    })
  }

  ngOnInit() {
    this.groupService.getAllGroups()
      .subscribe((groups: Array<Group>) => {
        this.groups = groups
      });

  }

  submitForm(form){
    
    this.groupService.addMachineToGroup(form.group,this.data.machineId).subscribe(() =>{
      this.dialogRef.close()
    }
    )
  }

}
