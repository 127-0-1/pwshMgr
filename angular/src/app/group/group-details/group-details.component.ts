import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { SingleGroupView, Machine } from '../group.model';
import { GroupService } from '../group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MachineService } from 'src/app/machine/machine.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { AlertPolicyView } from 'src/app/alerts/alertpolicy.model';
import { AlertService } from 'src/app/alerts/alert.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

export interface DialogData {
  groupId: string
}

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {

  group: SingleGroupView
  id: String
  machines: Machine[]
  selectedMachine: String
  alertPolicies: AlertPolicyView[];
  machineDisplayedColumns: string[] = ['name', 'operatingSystem', 'status'];
  alertPoliciesDisplayedColumns: string[] = ['name', 'priority'];


  constructor(private groupService: GroupService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.groupService.getGroupById(this.id)
      .subscribe(group => {
        this.group = group
        this.machines = group.machines
      })
  }

  deleteGroup() {
    if (confirm("Are you sure to delete? This will delete any alert policies assigned to this group.")) {
      this.groupService.deleteGroup(this.group._id)
        .subscribe()
      this.router.navigate(['main/groups'])
    }
  }

  addMachineToGroup() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.data = { groupId: this.id }
    dialogConfig.autoFocus = true;
    dialogConfig.width = '1000px'
    dialogConfig.height = '700px'
    dialogConfig.position = { top: '10%' }
    const dialogRef = this.dialog.open(AddMachinesToGroupDialog, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      this.groupService.getGroupById(this.id)
        .subscribe(group => {
          this.group = group
          this.machines = group.machines
        })
    });
  }

  rename() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.data = this.group
    dialogConfig.autoFocus = true;
    dialogConfig.width = '700px'
    dialogConfig.height = '300px'
    dialogConfig.position = { top: '10%' }
    const dialogRef = this.dialog.open(RenameGroupDialog, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      this.groupService.getGroupById(this.id)
        .subscribe(group => {
          this.group = group
          this.machines = group.machines
        })
    });
  }

  tabClick(tab) {
    if (tab.tab.textLabel == "Alert Policies") {
      this.alertService.getSingleMachineAlertPolicies(this.id).subscribe(alertPolicies => {
        this.alertPolicies = alertPolicies
      })
    }
  }

  deleteFromGroup(machineId) {
    this.groupService.deleteMachineFromGroup(this.id, machineId)
      .subscribe((group: SingleGroupView) => this.group = group)
  }
  
}

@Component({
  selector: 'add-machines-to-group-dialog',
  templateUrl: 'add-machines-to-group-dialog.html',
  styleUrls: ['./add-machines-to-group-dialog.css']
})
export class AddMachinesToGroupDialog implements OnInit {

  machines: Machine[]
  selected = [];
  tData: boolean = false;
  @ViewChild(DatatableComponent, { static: false }) table: DatatableComponent;

  constructor(
    private machineService: MachineService,
    private groupService: GroupService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<AddMachinesToGroupDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit() {
    this.tData = true;
    this.machineService.getAllMachines()
      .subscribe((machines: Array<Machine>) => {
        this.machines = machines
      });
  }

  addMachinesToGroup() {
    let result = this.selected.map(a => a._id);
    var postData = {
      machines: result,
      groupId: this.data.groupId
    }
    this.groupService.addMultipleMachinesToGroup(postData).subscribe(result => {
      this.dialogRef.close()
    })
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
}


@Component({
  selector: 'rename-group-dialog',
  templateUrl: 'rename-group-dialog.html',
  styleUrls: ['./rename-group-dialog.css']
})
export class RenameGroupDialog implements OnInit {

  renameGroupForm: FormGroup

  constructor(
    private groupService: GroupService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<AddMachinesToGroupDialog>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: SingleGroupView
  ) { 
    this.renameGroupForm = this.formBuilder.group({
      'name': ['', [Validators.required]]
    })
  }


  ngOnInit() {
    this.renameGroupForm.patchValue(this.data)
  }

  submitForm(group){
    this.groupService.updateGroup(group, this.data._id).subscribe()
    this.dialogRef.close()
  }

}