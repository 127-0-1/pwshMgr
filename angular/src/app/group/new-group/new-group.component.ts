import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Group } from '../group.model';
import { GroupService } from '../group.service';
import { Router } from '@angular/router';
import { MatDialogRef } from "@angular/material";

@Component({
  selector: 'app-new-group',
  templateUrl: './new-group.component.html',
  styleUrls: ['./new-group.component.css']
})
export class NewGroupComponent implements OnInit {

  newGroupForm: FormGroup;
  group: Group;

  constructor(
    private groupService: GroupService,
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogRef: MatDialogRef<NewGroupComponent>
  ) {
    this.newGroupForm = this.formBuilder.group({
      'name': ['', [Validators.required]]
    });
  }

  ngOnInit() {
  }

  submitForm(newGroup: Group) {
    this.groupService.postGroup(newGroup)
      .subscribe(newGroup => {
        this.router.navigate(['main/groups/' + newGroup._id])
        this.dialogRef.close()
      });
  }

}
