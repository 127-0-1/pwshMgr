import { Component, OnInit, TemplateRef, Inject, ViewChild } from '@angular/core';
import { Group, SingleGroupView, Machine } from '../group.model';
import { GroupService } from '../group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MachineService } from 'src/app/machine/machine.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { AlertPolicyView } from 'src/app/alerts/alertpolicy.model';
import { AlertService } from 'src/app/alerts/alert.service';

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
    if(confirm("Are you sure to delete?")) {
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
    this.dialog.open(AddMachinesToGroupDialog, dialogConfig);
  }

  tabClick(tab) {
    if (tab.tab.textLabel == "Alert Policies") {
      console.log("alert policies selected")
      
      this.alertService.getSingleMachineAlertPolicies(this.id).subscribe(alertPolicies => {
        this.alertPolicies = alertPolicies
        console.log(this.alertPolicies)
      })
    }
  }

  deleteFromGroup(machineId){
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
    console.log(result)
    var postData = {
      machines: result,
      groupId: this.data.groupId
    }
    this.groupService.addMultipleMachinesToGroup(postData).subscribe(result => {
      this.dialogRef.close()
    })
    // this.groupService.deleteMultipleGroups(result).subscribe(() => {
    //   this.groupService.getAllGroups()
    //     .subscribe((groups: Array<Group>) => {
    //       this.groups = groups
    //       this.temp = [...groups]
    //       this.tData = true
    //       this.selected = []
    //     });
    // })
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
}